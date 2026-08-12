import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
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
} from '@/lib/learning';
import { useToken } from '@/lib/tokens';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; document: ArticleDocument };

/**
 * An article, either on its own or as a step in a pathway.
 *
 * The pathway case is the same screen with a context: where this sits, in the header, and a bar
 * carrying the completion the gating rules read plus the step either side of it.
 *
 * Completion has two sources and they agree on purpose. Reading to the end is the only signal a
 * reading screen has that is about reading rather than about opening, and the renderer reports it
 * (see `onReachedEnd`); Mark Complete is the reader saying so directly, for the article they
 * skimmed or already knew. Both write the same row, and it only ever moves one way.
 */
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
  const muted = useToken('--ink-muted', '#9aa0aa');

  const userId = useLearnerId();
  const progress = useProgress(userId);
  // Only when there is a section to place: a standalone read has no pathway to load and should not
  // pay for one.
  const pathway = usePathway(sectionId ? pathwaySlug : undefined);

  const [state, setState] = useState<LoadState>(
    slug ? { status: 'loading' } : { status: 'error', message: 'No article specified.' },
  );
  // Bumped by Retry; re-runs the load effect. The handler also resets the
  // visible state, so the effect body never has to set state synchronously.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    contentRepository.getArticle(slug).then(
      (document) => {
        if (!cancelled) setState({ status: 'ready', document });
      },
      (error: unknown) => {
        if (!cancelled)
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Something went wrong.',
          });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  const placement = pathway.value && sectionId ? locateSection(pathway.value, sectionId) : null;
  const complete = sectionId !== undefined && sectionComplete(progress.get(sectionId));

  const markComplete = useCallback(() => {
    if (!userId || !sectionId || complete) return;
    // Both the renderer and the button lead here, more than once each, and the row this writes
    // folds on the earliest `completedAt` — so a repeat costs nothing but a write.
    recordSectionComplete(userId, sectionId);
  }, [userId, sectionId, complete]);

  // Where Previous and Next go. `replace` rather than `push`: reading a chapter end to end would
  // otherwise leave a screen on the stack per section, and Back should always be the pathway.
  const treeSlug = pathway.value?.slug;
  const neighbours =
    placement && sectionId && treeSlug ? sectionNeighbours(placement.chapter, sectionId) : null;

  const previousHref =
    neighbours?.previous && treeSlug ? sectionHref(treeSlug, neighbours.previous) : null;
  const nextHref = !neighbours?.next
    ? null
    : neighbours.next.kind === 'section'
      ? treeSlug
        ? sectionHref(treeSlug, neighbours.next.section)
        : null
      : checkpointHref(neighbours.next.chapter);

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-1" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
        <View className="h-[42px] flex-row items-center gap-[6px] px-[18px]">
          <BackLink />
          <Text
            numberOfLines={1}
            className="flex-1 text-[15px] font-medium tracking-[-0.2px] text-ink"
          >
            {placement?.chapter.title ?? pathway.value?.title ?? 'Article'}
          </Text>
          {placement && placement.position > 0 ? (
            <Text className="font-mono text-[13px] tracking-[0.5px] text-ink-muted">
              {`${placement.position}/${placement.total}`}
            </Text>
          ) : null}
        </View>

        {state.status === 'loading' ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={muted} />
          </View>
        ) : state.status === 'error' ? (
          <View className="flex-1 items-center justify-center gap-[16px] px-[32px]">
            <Text className="text-center text-[13px] leading-[19px] text-ink-muted">
              {state.message}
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
          <View className="flex-1">
            <ArticleRenderer
              document={state.document}
              onReachedEnd={sectionId ? markComplete : undefined}
            />
          </View>
        )}

        {placement && state.status === 'ready' ? (
          <SectionBar
            // Keyed so that Next, which replaces the route rather than pushing one, cannot leave
            // the bar showing the last section's finished face over an unread one.
            key={sectionId}
            complete={complete}
            onMarkComplete={markComplete}
            onPrevious={previousHref ? () => router.replace(previousHref) : undefined}
            onNext={nextHref ? () => router.replace(nextHref) : undefined}
          />
        ) : null}
      </View>
    </View>
  );
}
