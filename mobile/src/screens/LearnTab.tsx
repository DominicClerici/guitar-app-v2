import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CatalogueRow, ContinueCard, type CatalogueState } from '@/features/learning';
import type { ArticleMeta, CurriculumPathway } from '@/lib/content';
import {
  MAX_ACTIVE_PATHWAYS,
  nextStep,
  pathwayHref,
  nextStepHref,
  startPathway,
  touchPathway,
  useArticleLibrary,
  useContentCache,
  useLearning,
} from '@/lib/learning';
import { useToken } from '@/lib/tokens';

// The learning tab: what you are in the middle of, what else there is, and the reading library.
//
// Continue comes first and is the only section that exists conditionally — a learner with nothing
// on the go should meet the catalogue, not an empty shelf where their pathways would be.
//
// This screen is also where the offline content cache is driven from. It is mounted for as long as
// the tabs are, which is what makes it a reasonable home for the reconciler; the moment learning
// gains a route outside the tabs, that hook wants lifting to the layout.

function SectionLabel({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-[12px]">
      <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
        {label}
      </Text>
      <View className="h-px flex-1 bg-line-soft" />
    </View>
  );
}

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

  const learning = useLearning();
  const library = useArticleLibrary();

  useContentCache(learning.cacheTarget);

  const { userId, progress, active } = learning;
  const enrolledIds = new Set(active.map((entry) => entry.enrollment.pathwayId));
  const atCap = active.length >= MAX_ACTIVE_PATHWAYS;
  const articles = library.value;

  const open = (slug: string) => router.push(pathwayHref(slug));

  const openNextStep = (slug: string, pathwayId: string, pathway: CurriculumPathway) => {
    const step = nextStep(pathway, progress);
    if (!step) {
      open(slug);
      return;
    }

    if (userId) touchPathway(userId, pathwayId);
    router.push(nextStepHref(slug, step));
  };

  const start = (pathwayId: string, slug: string) => {
    if (!userId) return;
    startPathway(userId, pathwayId);
    open(slug);
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-[20px] px-[18px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        {active.length > 0 ? (
          <View className="mb-[34px]">
            <SectionLabel label="Continue" />
            <View className="mt-[14px] gap-[10px]">
              {active.map((entry) => (
                <ContinueCard
                  key={entry.enrollment.pathwayId}
                  meta={entry.meta}
                  pathway={entry.pathway}
                  progress={progress}
                  onOpen={() => open(entry.meta.slug)}
                  onContinue={() => {
                    if (entry.pathway) {
                      openNextStep(entry.meta.slug, entry.enrollment.pathwayId, entry.pathway);
                    } else {
                      open(entry.meta.slug);
                    }
                  }}
                />
              ))}
            </View>
          </View>
        ) : null}

        <SectionLabel label="All pathways" />
        <View className="mt-[2px]">
          {learning.index?.pathways.map((meta, index, all) => {
            const state: CatalogueState = enrolledIds.has(meta.id)
              ? 'enrolled'
              : atCap
                ? 'capped'
                : 'available';

            return (
              <CatalogueRow
                key={meta.id}
                meta={meta}
                state={state}
                last={index === all.length - 1}
                onOpen={() => open(meta.slug)}
                onStart={() => start(meta.id, meta.slug)}
              />
            );
          })}
          {learning.index?.pathways.length === 0 ? (
            <Text className="py-[24px] text-center font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              No pathways yet
            </Text>
          ) : null}
          {learning.index === null && learning.indexError !== null ? (
            <Text className="py-[24px] text-center text-[12.5px] leading-[18px] text-ink-muted">
              {learning.indexError}
            </Text>
          ) : null}
        </View>

        <View className="mt-[34px]">
          <SectionLabel label="Articles" />
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
        </View>
      </ScrollView>
    </View>
  );
}
