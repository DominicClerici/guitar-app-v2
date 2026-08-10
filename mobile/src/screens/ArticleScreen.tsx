import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleRenderer, contentRepository } from '@/features/articles';
import { SectionStrip } from '@/features/learning';
import type { ArticleDocument } from '@/lib/content';
import {
  locateSection,
  recordSectionComplete,
  sectionComplete,
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
 * The pathway case is the same screen with a context: a strip saying where this sits, and a
 * completion the gating rules read. Completion is "scrolled to the end" — the only signal a reading
 * screen has that is about reading rather than about opening — and the renderer reports it from
 * both of the paths that can produce it (see `onReachedEnd`).
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

  const reachedEnd = useCallback(() => {
    if (!userId || !sectionId || complete) return;
    // The renderer may say this twice — once from the scroll and once from the height check — and
    // the row it writes folds on the earliest `completedAt`, so a repeat costs nothing but a write.
    recordSectionComplete(userId, sectionId);
  }, [userId, sectionId, complete]);

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-1" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
        <View className="h-[42px] flex-row items-center px-[18px]">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Back"
            className="-ml-[4px] flex-row items-center gap-[6px] py-[6px] pr-[8px] active:opacity-60"
          >
            <SymbolView name="chevron.left" size={15} weight="semibold" tintColor={muted} />
            <Text numberOfLines={1} className="text-[15px] font-medium tracking-[-0.2px] text-ink">
              {pathway.value?.title ?? 'Article'}
            </Text>
          </Pressable>
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
            <Pressable
              onPress={retry}
              accessibilityRole="button"
              accessibilityLabel="Try loading the article again"
              className="rounded-full bg-surface-raised px-[16px] py-[8px] active:opacity-70"
            >
              <Text className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-ink">
                Retry
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1">
            <ArticleRenderer
              document={state.document}
              onReachedEnd={sectionId ? reachedEnd : undefined}
            />
          </View>
        )}

        {placement && state.status === 'ready' ? (
          <SectionStrip
            chapterTitle={placement.chapter.title}
            position={placement.position}
            total={placement.total}
            complete={complete}
          />
        ) : null}
      </View>
    </View>
  );
}
