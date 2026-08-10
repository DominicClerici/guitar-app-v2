import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArticleRenderer, articleRepository } from '@/features/articles';
import type { ArticleDocument } from '@/lib/articles';
import { useToken } from '@/lib/tokens';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; document: ArticleDocument };

export function ArticleScreen({ slug }: { slug: string | undefined }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const muted = useToken('--ink-muted', '#9aa0aa');

  const [state, setState] = useState<LoadState>(
    slug ? { status: 'loading' } : { status: 'error', message: 'No article specified.' },
  );
  // Bumped by Retry; re-runs the load effect. The handler also resets the
  // visible state, so the effect body never has to set state synchronously.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    articleRepository.getArticle(slug).then(
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
            <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">Article</Text>
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
          <ArticleRenderer document={state.document} />
        )}
      </View>
    </View>
  );
}
