import { useKeepAwake } from 'expo-keep-awake';
import { useRouter, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { openBrowserAsync } from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { contentRepository } from '@/features/articles';
import { ArticleLinkProvider } from '@/features/articles/links';
import { useSession } from '@/lib/auth';
import type { ActivityDocument, Link } from '@/lib/content';
import { useToken } from '@/lib/tokens';

import { ActivityUnavailable } from './ActivityUnavailable';
import { runnerFor } from './registry';

// The shell around a run: fetch the document, then hand it to the runner its kind names. Same
// shape as `features/quiz/QuizScreen` — the two screens do the same job and there is no reason for
// a learner to meet two different loading states.

/** Named so this screen's lock is released independently of anything else holding one. */
const KEEP_AWAKE_TAG = 'activity';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; document: ActivityDocument };

interface Props {
  slug: string | undefined;
  /**
   * From `?section=` — the id the completion is recorded under, and the tree's id rather than the
   * document slug. Absent when the activity was opened outside a pathway, which is a run that
   * records nothing; there is no fallback because an activity has no gate to leave hanging, so
   * inventing an id would only write a row nothing reads.
   */
  sectionId?: string;
}

export function ActivityScreen({ slug, sectionId }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const muted = useToken('--ink-muted', '#9aa0aa');
  const { data: session } = useSession();

  // An activity is played with both hands on a guitar and the phone propped up somewhere. Letting
  // the display sleep mid-round would end the run, so the lock covers the whole screen rather than
  // one phase of it — it costs nothing while the intro card is up, and there is no moment during a
  // run when it would be safe to let go.
  useKeepAwake(KEEP_AWAKE_TAG);

  const [state, setState] = useState<LoadState>(
    slug ? { status: 'loading' } : { status: 'error', message: 'No activity specified.' },
  );
  // Bumped by Retry; re-runs the load effect. The handler also resets the visible state, so the
  // effect body never has to set state synchronously.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    contentRepository.getActivity(slug).then(
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
          // An activity has no footnote list to scroll to; the mark still reads as emphasis.
          break;
      }
    },
    [router],
  );

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
          <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">Activity</Text>
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
            accessibilityLabel="Try loading the activity again"
            className="rounded-full bg-surface-raised px-[16px] py-[8px] active:opacity-70"
          >
            <Text className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-ink">
              Retry
            </Text>
          </Pressable>
        </View>
      ) : (
        // Prompts carry the same rich text an article does, links included, so they need the same
        // handler in context.
        <ArticleLinkProvider value={handleLink}>
          <Run
            document={state.document}
            sectionId={sectionId ?? null}
            userId={session?.user.id ?? null}
            onDone={() => router.back()}
          />
        </ArticleLinkProvider>
      )}
    </View>
  );
}

function Run({
  document,
  sectionId,
  userId,
  onDone,
}: {
  document: ActivityDocument;
  sectionId: string | null;
  userId: string | null;
  onDone: () => void;
}) {
  const activity = document.activity;
  // Two ways to have nothing to run — a kind this build has never heard of, and a known kind whose
  // every round is newer than this build — and one answer to both.
  if (activity.kind === 'unknown') return <ActivityUnavailable />;

  const entry = runnerFor(activity);
  if (!entry) return <ActivityUnavailable />;

  const Runner = entry.Component;

  return (
    <Runner
      document={document}
      activity={activity}
      sectionId={sectionId}
      userId={userId}
      onDone={onDone}
    />
  );
}
