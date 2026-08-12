import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, useWindowDimensions, View } from 'react-native';
import {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedView } from '@/components/AnimatedView';
import { Button } from '@/components/Button';
import { ReaderHeader } from '@/components/ReaderHeader';
import { Swap } from '@/components/Swap';
import { ArticleRenderer, contentRepository } from '@/features/articles';
import { SectionBar } from '@/features/learning';
import type { ArticleDocument } from '@/lib/content';
import {
  checkpointHref,
  locateSection,
  recordSectionComplete,
  sectionComplete,
  sectionHref,
  sectionNeighbours,
  useLearnerId,
  usePathway,
  useProgress,
  type NextInChapter,
} from '@/lib/learning';
import { useToken } from '@/lib/tokens';

/**
 * An article, either on its own or as a step in a pathway.
 *
 * The pathway case is the same screen with a context: where this sits, in the header, and a bar
 * carrying the completion the gating rules read and the step either side of it.
 *
 * Completion has two sources and they agree on purpose. Reading to the end is the only signal a
 * reading screen has that is about reading rather than about opening, and the renderer reports it
 * (see `onReachedEnd`); Mark Complete is the reader saying so directly, for the article they
 * skimmed or already knew. Both write the same row, and it only ever moves one way.
 *
 * ── Paging ──
 *
 * Moving between sections is not a navigation. The header and the bar are the fixed part of the
 * reader and only the article between them travels, so a step to the next section holds both
 * articles at once and slides them across; the route catches up afterwards with `setParams`. The
 * chrome changes what it says in the same beat, by fading where it stands rather than moving
 * (see `Swap`).
 *
 * A step onto a quiz or an activity cannot be paged, because those are other screens. It is dressed
 * as one instead: the article and the bar slide away, the counter fades, and only then does the
 * stack replace the screen — with its own animation off, under a header the destination is already
 * carrying, so the only thing that appears to happen is the new body fading up (see `ReaderHop`).
 */

/** One pass of content across the screen. Everything in the chrome is timed against it. */
const SLIDE_MS = 300;

/** Each half of a chrome crossfade: out while the old content leaves, in as the new arrives. */
const CHROME_FADE_MS = SLIDE_MS / 2;

const SLIDE_EASING = Easing.inOut(Easing.cubic);

/** A loaded article and the section it is being read as. */
interface Pane {
  /**
   * Where this sits on the reader's track, counting up towards the end of the chapter.
   *
   * Position is a property of the article rather than of the transition, which is what makes
   * landing free: the track is animated to the arriving pane's own number, and when the move ends
   * that pane is already at rest exactly where it is. Nothing has to be put back afterwards, so
   * there is no frame in which a shared value and a React commit can disagree about what is on
   * screen.
   */
  index: number;
  /** Null for a standalone read, which has no section to report anything under. */
  sectionId: string | null;
  slug: string;
  document: ArticleDocument;
}

/**
 * One article on the track.
 *
 * Its own component so the transform belongs to the article rather than to a slot: the pane that
 * arrives keeps the style — and the mounted list, and its scroll offset at the top — that it had
 * while it was coming in.
 */
function ArticlePane({
  index,
  track,
  width,
  document,
  sectionId,
  reading,
  onRead,
}: {
  index: number;
  /** Read only. The track position currently centred; panes never write to it. */
  track: SharedValue<number>;
  width: number;
  document: ArticleDocument;
  sectionId: string | null;
  /**
   * Whether this pane is the one being read. False for an article still crossing the screen: it
   * has not been read, and a short one would otherwise report itself finished before it arrived.
   */
  reading: boolean;
  onRead: (sectionId: string) => void;
}) {
  // Bound here rather than at the call site because the renderer times its fits-on-screen check
  // against this callback's identity — a fresh closure per render would keep restarting the clock.
  const reachedEnd = useCallback(() => {
    if (sectionId) onRead(sectionId);
  }, [sectionId, onRead]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: (index - track.value) * width }],
  }));

  return (
    <AnimatedView className="absolute inset-0" style={style}>
      <ArticleRenderer
        document={document}
        onReachedEnd={reading && sectionId ? reachedEnd : undefined}
      />
    </AnimatedView>
  );
}

type Reader =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; pane: Pane };

/** `page` swaps content inside this screen; `leave` hands over to another one. */
type Move = { kind: 'page'; pane: Pane } | { kind: 'leave'; href: Href };

export function ArticleScreen({
  slug,
  sectionId,
  pathwaySlug,
}: {
  slug: string | undefined;
  /** The curriculum section this article is being read as, not the document slug. */
  sectionId?: string;
  pathwaySlug?: string;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const muted = useToken('--ink-muted', '#9aa0aa');

  const userId = useLearnerId();
  const progress = useProgress(userId);
  // Only when there is a section to place: a standalone read has no pathway to load and should not
  // pay for one.
  const pathway = usePathway(sectionId ? pathwaySlug : undefined);

  const [reader, setReader] = useState<Reader>(
    slug ? { status: 'loading' } : { status: 'error', message: 'No article specified.' },
  );
  const [move, setMove] = useState<Move | null>(null);
  // Bumped by Retry; re-runs the load effect. The handler also resets the visible state, so the
  // effect body never has to set state synchronously.
  const [attempt, setAttempt] = useState(0);

  const documents = useRef(new Map<string, ArticleDocument>());
  /**
   * The slug the screen has already taken on. A page ends by pointing the route at the section it
   * landed on, and without this that would read as a request to load the thing already on show.
   */
  const held = useRef<string | null>(null);
  /** A press while a document is still being fetched, which would otherwise start a second move. */
  const busy = useRef(false);
  /**
   * Where the track is at rest, mirrored in plain JS.
   *
   * A pane loaded from the route rather than paged to — the first one, or a retry — has to be
   * placed where the track is standing, not at nought, or it would mount somewhere off the side of
   * the screen. Read from a ref rather than from the shared value, which is the movers' to touch.
   */
  const resting = useRef(0);

  /** The pane position on show. Panes read it; only the movers below write it. */
  const track = useSharedValue(0);
  /** The bar's own travel: it holds still for a page and leaves with the article for a hand-over. */
  const departure = useSharedValue(0);

  const load = useCallback(async (target: string): Promise<ArticleDocument> => {
    const cached = documents.current.get(target);
    if (cached) return cached;

    const document = await contentRepository.getArticle(target);
    documents.current.set(target, document);

    return document;
  }, []);

  useEffect(() => {
    if (!slug || held.current === slug) return;
    held.current = slug;
    let cancelled = false;

    load(slug).then(
      (document) => {
        if (!cancelled) {
          setReader({
            status: 'ready',
            pane: { index: resting.current, sectionId: sectionId ?? null, slug, document },
          });
        }
      },
      (error: unknown) => {
        if (cancelled) return;
        held.current = null;
        setReader({
          status: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong.',
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [slug, sectionId, attempt, load]);

  const retry = useCallback(() => {
    held.current = null;
    setReader({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  // What the chrome is describing, which during a page is the section arriving rather than the one
  // on its way out — the counter and the bar have to be talking about the destination while the
  // content is still crossing.
  const focus = move?.kind === 'page' ? move.pane : reader.status === 'ready' ? reader.pane : null;
  const focusId = focus?.sectionId ?? null;

  const treeSlug = pathway.value?.slug;
  const placement = pathway.value && focusId ? locateSection(pathway.value, focusId) : null;
  const complete = focusId !== null && sectionComplete(progress.get(focusId));
  const neighbours = placement && focusId ? sectionNeighbours(placement.chapter, focusId) : null;

  /**
   * Marks a section read.
   *
   * Takes the section rather than reading the focused one because the renderer that calls it is
   * bound to a particular article: mid-page the outgoing list can still settle and report itself
   * finished, and by then the chrome is describing a section the reader has not seen.
   */
  const markSection = useCallback(
    (id: string) => {
      if (!userId || sectionComplete(progress.get(id))) return;
      // Both the renderer and the button lead here, more than once each, and the row this writes
      // folds on the earliest `completedAt` — so a repeat costs nothing but a write.
      recordSectionComplete(userId, id);
    },
    [userId, progress],
  );

  // ── Movement ─────────────────────────────────────────────────────────────
  // Plain functions rather than callbacks, and above every worklet hook: the compiler freezes a
  // shared value the moment a worklet captures it, so the writers have to come first.

  function commit(pane: Pane) {
    held.current = pane.slug;
    setReader({ status: 'ready', pane });
    setMove(null);
    // The route follows rather than leads, so a restored or shared link opens where the reader
    // actually got to. It matches what the screen already shows, so nothing reloads.
    router.setParams({ slug: pane.slug, ...(pane.sectionId ? { section: pane.sectionId } : {}) });
  }

  function handOver(href: Href) {
    router.replace(href);
  }

  function page(pane: Pane) {
    setMove({ kind: 'page', pane });
    resting.current = pane.index;
    track.value = withTiming(pane.index, { duration: SLIDE_MS, easing: SLIDE_EASING }, (done) => {
      'worklet';
      if (done) runOnJS(commit)(pane);
    });
  }

  function leave(towards: 1 | -1, from: number, href: Href) {
    setMove({ kind: 'leave', href });
    departure.value = 0;
    track.value = withTiming(
      from + towards,
      { duration: SLIDE_MS, easing: SLIDE_EASING },
      (done) => {
        'worklet';
        if (done) runOnJS(handOver)(href);
      },
    );
    departure.value = withTiming(towards, { duration: SLIDE_MS, easing: SLIDE_EASING });
  }

  function step(towards: 1 | -1) {
    if (busy.current || move || !placement || !treeSlug) return;

    const target: NextInChapter | null =
      towards === 1
        ? (neighbours?.next ?? null)
        : neighbours?.previous
          ? { kind: 'section', section: neighbours.previous }
          : null;
    if (!target) return;

    const index = resting.current + towards;

    if (target.kind === 'section' && target.section.kind === 'article') {
      const { id, ref } = target.section;
      busy.current = true;

      // Nearly always already on the device — a chapter is cached whole — so this settles before
      // the finger is off the button. A genuine miss goes to the network, and the press waits.
      load(ref).then(
        (document) => {
          busy.current = false;
          page({ index, sectionId: id, slug: ref, document });
        },
        () => {
          busy.current = false;
        },
      );

      return;
    }

    const hop = { chapterTitle: placement.chapter.title };
    const href =
      target.kind === 'section'
        ? sectionHref(treeSlug, target.section, hop)
        : checkpointHref(target.chapter, hop);

    if (href) leave(towards, resting.current, href);
  }

  // Warm the neighbours so a press has nothing to wait for. A read that hits the cache costs one
  // synchronous query; the point is the miss, which fetches now rather than under a finger.
  const previousRef = neighbours?.previous?.kind === 'article' ? neighbours.previous.ref : null;
  const nextRef =
    neighbours?.next?.kind === 'section' && neighbours.next.section.kind === 'article'
      ? neighbours.next.section.ref
      : null;

  useEffect(() => {
    for (const target of [previousRef, nextRef]) {
      if (target) void load(target).catch(() => {});
    }
  }, [previousRef, nextRef, load]);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -departure.value * width }],
  }));

  // Emptied on the way out, so the counter fades where it stands instead of travelling.
  const counter =
    move?.kind === 'leave' || !placement || placement.position === 0
      ? ''
      : `${placement.position}/${placement.total}`;

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-1" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
        <ReaderHeader
          title={placement?.chapter.title ?? pathway.value?.title ?? 'Article'}
          trailing={
            <Swap
              id={counter}
              fadeMs={CHROME_FADE_MS}
              holdMs={0}
              render={(id) =>
                id === '' ? null : (
                  <Text className="font-mono text-[13px] tracking-[0.5px] text-ink-muted">{id}</Text>
                )
              }
            />
          }
        />

        <View className="flex-1 overflow-hidden">
          {reader.status === 'loading' ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={muted} />
            </View>
          ) : reader.status === 'error' ? (
            <View className="flex-1 items-center justify-center gap-[16px] px-[32px]">
              <Text className="text-center text-[13px] leading-[19px] text-ink-muted">
                {reader.message}
              </Text>
              <Button
                variant="secondary"
                size="xs"
                text="mono"
                radius={999}
                accessibilityLabel="Try loading the article again"
                onPress={retry}
              >
                Retry
              </Button>
            </View>
          ) : (
            // One keyed list rather than two children, so that when the move ends and the pane
            // arriving becomes the pane being read, React matches it by key and keeps the list it
            // has already mounted — at the top of the new article, where it was put. Reconciled by
            // position instead, it would be torn down and rebuilt on the last frame of the slide.
            [reader.pane, ...(move?.kind === 'page' ? [move.pane] : [])].map((pane) => (
              <ArticlePane
                key={pane.index}
                index={pane.index}
                track={track}
                width={width}
                document={pane.document}
                sectionId={pane.sectionId}
                reading={pane.index === reader.pane.index}
                onRead={markSection}
              />
            ))
          )}
        </View>

        {placement && reader.status === 'ready' ? (
          <AnimatedView style={barStyle}>
            <SectionBar
              complete={complete}
              fadeMs={CHROME_FADE_MS}
              paging={move !== null}
              onMarkComplete={() => focusId && markSection(focusId)}
              onPrevious={neighbours?.previous ? () => step(-1) : undefined}
              onNext={neighbours?.next ? () => step(1) : undefined}
            />
          </AnimatedView>
        ) : null}
      </View>
    </View>
  );
}
