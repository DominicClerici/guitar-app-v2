import { useNavigation, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, useWindowDimensions, View } from 'react-native';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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
 * A turn is interruptible. Pressing Next again while one is under way puts a third article on the
 * track and moves the destination on to it, and because the track is sprung rather than timed
 * (see `SLIDE`) that happens without the content stopping — held down, the reader flicks through
 * sections in one continuous movement. Everything the chrome says is about the section being
 * *arrived at* rather than the one underneath, so the next press steps from where the reader is
 * going rather than from where they were.
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

/**
 * How the track moves.
 *
 * A spring rather than an easing curve, because a page turn has to survive being interrupted by the
 * next one. Assigning a new spring to a value that is already springing carries over the speed it
 * had, so a second press picks the content up in flight and carries on with it; a timing curve
 * begins from rest whatever it interrupts, which is the stop-and-restart in the middle of a turn
 * this is here to avoid. Critically damped, so content asked for one page never overshoots and
 * shows a frame of the one after it.
 */
const SLIDE = { duration: SLIDE_MS, dampingRatio: 1 };

/** A loaded article and the section it is being read as. */
interface Pane {
  /**
   * Where this sits on the reader's track, counting up towards the end of the chapter.
   *
   * Position is a property of the article rather than of the transition, which is what makes
   * landing free: the track is animated to the arriving pane's own number, and when the move ends
   * that pane is already at rest exactly where it is. Nothing has to be put back afterwards, so
   * there is no frame in which a shared value and a React commit can disagree about what is on
   * screen. It is also what lets a turn be interrupted — a third pane simply takes the next
   * number, and the track is given a longer way to go.
   */
  index: number;
  /** Null for a standalone read, which has no section to report anything under. */
  sectionId: string | null;
  slug: string;
  document: ArticleDocument;
  /**
   * Whether this article is still on its way in — put on the track by a turn and not yet landed
   * from one.
   *
   * It says how much of the article to keep mounted (see `crossing`), and it latches off rather
   * than tracking where the track is: the narrow window is there to stop an arriving article
   * filling in below the fold while it crosses, and one on its way back *out* did its filling long
   * ago. Narrowing it again would only be work, at the one moment there is none to spare.
   */
  arriving: boolean;
}

/** The articles on the track and where it is heading. */
interface Deck {
  /** In track order: the one being read, plus any still crossing the screen behind or ahead. */
  panes: Pane[];
  /**
   * The pane the track is travelling to, which at rest is the one being read.
   *
   * The chrome describes this rather than whatever is currently under it, so a second press steps
   * from where the reader is going rather than from where they set off.
   */
  at: number;
  /** Whether the track is still travelling. */
  moving: boolean;
}

/** The deck's panes with `pane` among them, in track order. */
function withPane(panes: Pane[], pane: Pane): Pane[] {
  return [...panes.filter((existing) => existing.index !== pane.index), pane].sort(
    (a, b) => a.index - b.index,
  );
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
  crossing,
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
  /** Whether the article has yet to land, and so should render no more than fits. */
  crossing: boolean;
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
        crossing={crossing}
        onReachedEnd={reading && sectionId ? reachedEnd : undefined}
      />
    </AnimatedView>
  );
}

type Reader =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; deck: Deck };

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
  const navigation = useNavigation();
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
  /** The screen being handed over to, once a step off this route has started. */
  const [leaving, setLeaving] = useState<Href | null>(null);
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
   * Where the track is standing or heading, mirrored in plain JS.
   *
   * A pane loaded from the route rather than paged to — the first one, or a retry — has to be
   * placed where the track is, not at nought, or it would mount somewhere off the side of the
   * screen. Read from a ref rather than from the shared value, which is the movers' to touch.
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
          const pane = {
            index: resting.current,
            sectionId: sectionId ?? null,
            slug,
            document,
            arriving: false,
          };
          setReader({ status: 'ready', deck: { panes: [pane], at: pane.index, moving: false } });
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

  const deck = reader.status === 'ready' ? reader.deck : null;
  // What the chrome is describing, which during a turn is the section arriving rather than the one
  // on its way out — the counter and the bar have to be talking about the destination while the
  // content is still crossing, and the next press has to step from it.
  const focus = deck ? (deck.panes.find((pane) => pane.index === deck.at) ?? null) : null;
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

  /**
   * Whether the reader is still here.
   *
   * A move outlives the screen if the reader goes back part way through one, and what is left of it
   * then has no business touching the route — the screen it would be pointing somewhere is no
   * longer this one.
   */
  function present() {
    return navigation.isFocused();
  }

  function settle(pane: Pane) {
    if (!present()) return;

    // Landed: the others are behind it and gone, and it is free to fill itself out.
    const landed = { ...pane, arriving: false };
    setReader((current) =>
      current.status === 'ready' && current.deck.at === pane.index
        ? { status: 'ready', deck: { panes: [landed], at: pane.index, moving: false } }
        : current,
    );
    held.current = pane.slug;
    // The route follows rather than leads, so a restored or shared link opens where the reader
    // actually got to. It matches what the screen already shows, so nothing reloads.
    router.setParams({ slug: pane.slug, ...(pane.sectionId ? { section: pane.sectionId } : {}) });
  }

  function handOver(href: Href) {
    if (present()) router.replace(href);
  }

  function place(pane: Pane) {
    setReader((current) =>
      current.status === 'ready'
        ? {
            status: 'ready',
            deck: { panes: withPane(current.deck.panes, pane), at: pane.index, moving: true },
          }
        : current,
    );
    resting.current = pane.index;

    // A frame later, so that mounting the arriving article — its first screenful of blocks, and the
    // layout pass under them — is done with before anything starts moving. Started in the same tick,
    // that work would land on the opening frames of the slide, which is both where it is most
    // visible and where the article it belongs to has not been drawn yet.
    requestAnimationFrame(() => {
      track.value = withSpring(pane.index, SLIDE, (done) => {
        'worklet';
        // False when a later press has taken the track over, whose own callback settles instead.
        if (done) runOnJS(settle)(pane);
      });
    });
  }

  function leave(towards: 1 | -1, from: number, href: Href) {
    setLeaving(href);
    track.value = withSpring(from + towards, SLIDE, (done) => {
      'worklet';
      if (done) runOnJS(handOver)(href);
    });
    departure.value = withSpring(towards, SLIDE);
  }

  function step(towards: 1 | -1) {
    if (busy.current || leaving || !deck || !placement || !treeSlug) return;

    const target: NextInChapter | null =
      towards === 1
        ? (neighbours?.next ?? null)
        : neighbours?.previous
          ? { kind: 'section', section: neighbours.previous }
          : null;
    if (!target) return;

    const index = deck.at + towards;

    if (target.kind === 'section' && target.section.kind === 'article') {
      const { id, ref } = target.section;
      // Taken straight from the cache when it is there, which is what lets a press land while the
      // last one is still moving: a promise, however fast it settles, would put the turn a tick
      // behind the finger and break the run of them.
      const ready = documents.current.get(ref);
      if (ready) {
        place({ index, sectionId: id, slug: ref, document: ready, arriving: true });
        return;
      }

      // A genuine miss — a chapter is cached whole, so this is the network. The press waits, and
      // `busy` holds the deck still meanwhile so `index` is still the right one on the way back.
      busy.current = true;
      load(ref).then(
        (document) => {
          busy.current = false;
          place({ index, sectionId: id, slug: ref, document, arriving: true });
        },
        () => {
          busy.current = false;
        },
      );

      return;
    }

    // Unlike a page, a hand-over cannot be joined mid-flight: the bar travels a screen's width of
    // its own while the content covers whatever is left of the track, and the two only stay
    // together if they set off together.
    if (deck.moving) return;

    const hop = { chapterTitle: placement.chapter.title };
    const href =
      target.kind === 'section'
        ? sectionHref(treeSlug, target.section, hop)
        : checkpointHref(target.chapter, hop);

    if (href) leave(towards, deck.at, href);
  }

  // Warm the neighbours so a press has nothing to wait for. A read that hits the cache costs one
  // synchronous query; the point is the miss, which fetches now rather than under a finger. This
  // follows the destination, so a turn has the section after it on the device before it lands.
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
    leaving || !placement || placement.position === 0
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
            // Keyed by track position rather than laid out in order, so that when a turn ends and
            // the pane arriving becomes the pane being read, React matches it and keeps the list it
            // has already mounted — at the top of the new article, where it was put. Reconciled by
            // position instead, it would be torn down and rebuilt on the last frame of the slide.
            reader.deck.panes.map((pane) => (
              <ArticlePane
                key={pane.index}
                index={pane.index}
                track={track}
                width={width}
                document={pane.document}
                sectionId={pane.sectionId}
                reading={!reader.deck.moving && pane.index === reader.deck.at}
                crossing={pane.arriving}
                onRead={markSection}
              />
            ))
          )}
        </View>

        {placement && deck ? (
          <AnimatedView style={barStyle}>
            <SectionBar
              complete={complete}
              fadeMs={CHROME_FADE_MS}
              paging={deck.moving || leaving !== null}
              // Only from a page that has stopped. Mid-turn the control is a beat away from
              // becoming Next again, and a reader drumming through completed sections should not
              // be able to mark the unread one they land on by catching it on the way past.
              onMarkComplete={() => !deck.moving && focusId && markSection(focusId)}
              onPrevious={neighbours?.previous ? () => step(-1) : undefined}
              onNext={neighbours?.next ? () => step(1) : undefined}
            />
          </AnimatedView>
        ) : null}
      </View>
    </View>
  );
}
