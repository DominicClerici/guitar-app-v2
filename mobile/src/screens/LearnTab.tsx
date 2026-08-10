import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { articleRepository } from '@/features/articles';
import type { ArticleMeta } from '@/lib/articles';
import { useToken } from '@/lib/tokens';

// The reading tab: articles from the repository, newest first. One flat list
// for now — sections by tag can come once there's enough content to need them.

function ArticleRow({
  article,
  last,
  onPress,
}: {
  article: ArticleMeta;
  last: boolean;
  onPress: () => void;
}) {
  const faint = useToken('--ink-faint', '#62666e');
  const strap = [...article.tags, `${article.readingTimeMin} min`].join(' · ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Read ${article.title}`}
      className={`flex-row items-center gap-[14px] py-[16px] active:opacity-55 ${
        last ? '' : 'border-b border-b-line-soft'
      }`}
    >
      <View className="flex-1">
        <Text className="font-mono text-[9px] uppercase tracking-[2px] text-ink-faint">
          {strap}
        </Text>
        <Text className="mt-[5px] text-[15px] font-medium tracking-[-0.2px] text-ink">
          {article.title}
        </Text>
        <Text className="mt-[3px] text-[12.5px] leading-[17px] text-ink-muted">
          {article.summary}
        </Text>
      </View>
      <SymbolView name="chevron.right" size={12} weight="semibold" tintColor={faint} />
    </Pressable>
  );
}

export function LearnTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleMeta[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    articleRepository.listArticles().then(
      (list) => {
        if (!cancelled) setArticles(list);
      },
      () => {
        if (!cancelled) setArticles([]);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-[20px] px-[18px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        <View className="flex-row items-center gap-[12px]">
          <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
            Articles
          </Text>
          <View className="h-px flex-1 bg-line-soft" />
        </View>

        <View className="mt-[2px]">
          {articles?.map((article, index) => (
            <ArticleRow
              key={article.id}
              article={article}
              last={index === articles.length - 1}
              onPress={() =>
                router.push({ pathname: '/article/[slug]', params: { slug: article.slug } })
              }
            />
          ))}
          {articles?.length === 0 ? (
            <Text className="py-[24px] text-center font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              No articles yet
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
