import { useRouter, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { openBrowserAsync } from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { contentRepository } from '@/features/articles';
import { ArticleLinkProvider } from '@/features/articles/links';
import { useSession } from '@/lib/auth';
import type { Link, QuizDocument } from '@/lib/content';
import { useLearnerId, useProgress } from '@/lib/learning';
import { useToken } from '@/lib/tokens';

import { QuizRunner } from './QuizRunner';

// The shell around an attempt: fetch the document, then hand it to the runner. It lives in the
// feature rather than in `src/screens` so that everything a quiz needs is in one directory.

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; document: QuizDocument };

interface Props {
  slug: string | undefined;
  /** From `?section=` — the id the result is recorded under. */
  sectionId?: string;
  /** From `?threshold=` — overrides the document's own `passThresholdPct`. */
  thresholdPct?: number;
}

/**
 * Where this attempt's result is stored.
 *
 * A checkpoint's id is derived from the *chapter* (`checkpointSectionId`), not from the quiz, so
 * there is nothing to fall back to: opened without a `section` the result is shown and not
 * recorded, because recording it under any id we could guess here would leave the chapter locked
 * while looking like it had been passed. An ordinary quiz falls back to its own slug — a section
 * id it may not match, but a stable, honest handle for the attempt.
 */
function resolveSectionId(document: QuizDocument, sectionId: string | undefined): string | null {
  if (sectionId) return sectionId;
  return document.meta.kind === 'checkpoint' ? null : document.meta.slug;
}

export function QuizScreen({ slug, sectionId, thresholdPct }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const muted = useToken('--ink-muted', '#9aa0aa');
  const { data: session } = useSession();
  const learnerId = useLearnerId();
  const progress = useProgress(learnerId);

  const [state, setState] = useState<LoadState>(
    slug ? { status: 'loading' } : { status: 'error', message: 'No quiz specified.' },
  );
  // Bumped by Retry; re-runs the load effect. The handler also resets the visible state, so the
  // effect body never has to set state synchronously.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    contentRepository.getQuiz(slug).then(
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

  const handleLink = useCallback(
    (link: Link) => {
      switch (link.kind) {
        case 'article':
          router.push({ pathname: '/article/[slug]', params: { slug: link.slug } });
          break;
        case 'screen':
          router.push(link.href as Href);
          break;
        case 'url':
          void openBrowserAsync(link.url);
          break;
        case 'footnote':
          // A quiz has no footnote list to scroll to; the mark still reads as emphasis.
          break;
      }
    },
    [router],
  );

  const title =
    state.status === 'ready' && state.document.meta.kind === 'checkpoint' ? 'Chapter Quiz' : 'Quiz';

  const recordUnder = state.status === 'ready' ? resolveSectionId(state.document, sectionId) : null;
  // Read before the attempt writes anything, so the results screen can say what this go changed.
  // `useProgress` is live, but the runner keeps its own copy of this the moment it finishes.
  const previousBestPct = recordUnder ? (progress.get(recordUnder)?.bestScorePct ?? null) : null;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[42px] flex-row items-center px-[18px]">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="-ml-[4px] flex-row items-center gap-[6px] py-[6px] pr-[8px] active:opacity-60"
        >
          <SymbolView name="chevron.left" size={15} weight="semibold" tintColor={muted} />
          <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">{title}</Text>
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
            accessibilityLabel="Try loading the quiz again"
            className="rounded-full bg-surface-raised px-[16px] py-[8px] active:opacity-70"
          >
            <Text className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-ink">
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        <ArticleLinkProvider value={handleLink}>
          <QuizRunner
            document={state.document}
            sectionId={recordUnder}
            thresholdPct={thresholdPct ?? state.document.meta.passThresholdPct}
            previousBestPct={previousBestPct}
            userId={session?.user.id ?? null}
            onDone={() => router.back()}
          />
        </ArticleLinkProvider>
      )}
    </View>
  );
}
