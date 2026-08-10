import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChapterCard, ProgressTrack } from '@/features/learning';
import type { CurriculumPathway, CurriculumSection, PathwayDifficulty } from '@/lib/content';
import {
  chapterProgress,
  chapterStatus,
  checkpointHref,
  currentChapter,
  dropPathway,
  MAX_ACTIVE_PATHWAYS,
  nextStep,
  nextStepHref,
  pathwayProgress,
  sectionHref,
  startPathway,
  touchPathway,
  useActiveEnrollments,
  useLearnerId,
  usePathway,
  useProgress,
  type ChapterAt,
  type ProgressBySection,
} from '@/lib/learning';
import { useToken } from '@/lib/tokens';

// A pathway as a map: chapters down the page, the one you are in already open, everything before it
// folded away and everything after it locked with the reason on show.
//
// Two taps to content — chapter, then section — and no third. Within an open chapter the order is
// the learner's; only the checkpoint gates.

const DIFFICULTY: Record<PathwayDifficulty, string> = {
  intro: 'Intro',
  core: 'Core',
  advanced: 'Advanced',
};

/**
 * Why a later chapter cannot be opened yet, in terms of the one thing standing in the way.
 *
 * Always the *current* chapter, never the immediate predecessor: locking is transitive, so the
 * chapter actually blocking chapter 4 may well be chapter 1, and naming chapter 3 would send the
 * learner somewhere that is itself locked.
 */
function lockReason(current: ChapterAt | null, progress: ProgressBySection): string {
  if (!current) return 'Locked';

  const tally = chapterProgress(current.chapter, progress);
  const ordinal = current.index + 1;

  return tally.completed < tally.total
    ? `Finish Chapter ${ordinal} first`
    : `Pass the Chapter ${ordinal} checkpoint`;
}

function Strap({ pathway }: { pathway: CurriculumPathway }) {
  const parts = [
    DIFFICULTY[pathway.difficulty],
    `${pathway.chapters.length} chapters`,
    `${pathway.estimatedMin} min`,
  ];

  return (
    <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
      {parts.join(' · ')}
    </Text>
  );
}

export function PathwayScreen({ slug }: { slug: string | undefined }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const muted = useToken('--ink-muted', '#9aa0aa');
  const onAccent = useToken('--on-accent', '#04211f');

  const userId = useLearnerId();
  const progress = useProgress(userId);
  const enrollments = useActiveEnrollments(userId);
  const query = usePathway(slug);
  const pathway = query.value;

  const pathwayId = pathway?.id ?? null;
  const enrolled = pathwayId !== null && enrollments.some((row) => row.pathwayId === pathwayId);

  // Opening a pathway you are enrolled in is activity, and activity is what orders the Continue
  // list and decides which three enrollments survive the cap. Browsing one you are not enrolled in
  // writes nothing — `touchPathway` refuses to enroll on your behalf.
  useEffect(() => {
    if (userId && pathwayId) touchPathway(userId, pathwayId);
  }, [userId, pathwayId]);

  // Which chapter the accordion is showing. Null means "nobody has chosen", which falls through to
  // the chapter the learner is in — so the screen is right on its first frame, with no effect to
  // set it. The empty string is the other end of that: chosen, and chosen to be nothing.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Dropping is one tap away from undoing weeks of ordering, so it asks once.
  const [confirmingDrop, setConfirmingDrop] = useState(false);

  const current = pathway ? currentChapter(pathway, progress) : null;
  const expanded = expandedId ?? current?.chapter.id ?? null;
  const tally = pathway ? pathwayProgress(pathway, progress) : null;
  const step = pathway ? nextStep(pathway, progress) : null;
  const atCap = enrollments.length >= MAX_ACTIVE_PATHWAYS;

  const openSection = (section: CurriculumSection) => {
    if (!pathway) return;
    router.push(sectionHref(pathway.slug, section));
  };

  const openCheckpoint = (chapterIndex: number) => {
    if (!pathway) return;
    const href = checkpointHref(pathway.chapters[chapterIndex]);
    if (href) router.push(href);
  };

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
            <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">Pathway</Text>
          </Pressable>
        </View>

        {query.loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={muted} />
          </View>
        ) : !pathway ? (
          <View className="flex-1 items-center justify-center gap-[16px] px-[32px]">
            <Text className="text-center text-[13px] leading-[19px] text-ink-muted">
              {query.error ?? 'No pathway specified.'}
            </Text>
            <Pressable
              onPress={query.reload}
              accessibilityRole="button"
              accessibilityLabel="Try loading the pathway again"
              className="rounded-full bg-surface-raised px-[16px] py-[8px] active:opacity-70"
            >
              <Text className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-ink">
                Retry
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-[18px] pt-[8px]"
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          >
            <Strap pathway={pathway} />
            <Text className="mt-[10px] text-[30px] leading-[34px] font-semibold tracking-[-0.8px] text-ink">
              {pathway.title}
            </Text>
            <Text className="mt-[8px] text-[13.5px] leading-[20px] text-ink-muted">
              {pathway.summary}
            </Text>

            {tally ? (
              <View className="mt-[22px]">
                <View className="flex-row items-baseline justify-between">
                  <Text className="font-mono text-[22px] leading-[24px] font-medium tracking-[0.5px] text-ink">
                    {tally.completed}/{tally.total}
                  </Text>
                  <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
                    {tally.pct}% complete
                  </Text>
                </View>
                <View className="mt-[12px]">
                  <ProgressTrack completed={tally.completed} total={tally.total} />
                </View>
              </View>
            ) : null}

            <View className="mt-[20px]">
              {enrolled ? (
                step ? (
                  <Pressable
                    onPress={() => router.push(nextStepHref(pathway.slug, step))}
                    accessibilityRole="button"
                    accessibilityLabel="Continue this pathway"
                    className="h-[50px] flex-row items-center justify-center gap-[9px] rounded-[10px] border border-x-transparent border-t-[rgba(255,255,255,0.4)] border-b-[rgba(0,0,0,0.28)] bg-accent active:opacity-80"
                  >
                    <SymbolView name="play.fill" size={13} tintColor={onAccent} />
                    <Text className="text-[15px] font-bold tracking-[0.3px] text-on-accent">
                      {tally && tally.completed === 0 ? 'Begin' : 'Continue'}
                    </Text>
                  </Pressable>
                ) : (
                  <View className="h-[50px] flex-row items-center justify-center rounded-[10px] border border-accent-line bg-accent-wash">
                    <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2px] text-accent">
                      Pathway complete
                    </Text>
                  </View>
                )
              ) : atCap ? (
                <View className="rounded-[10px] border border-line-soft bg-surface-raised px-[14px] py-[13px]">
                  <Text className="text-[12.5px] leading-[18px] text-ink-muted">
                    You already have {MAX_ACTIVE_PATHWAYS} pathways on the go. Drop one to start
                    this — nothing you have finished is lost either way.
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    if (userId) startPathway(userId, pathway.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Start ${pathway.title}`}
                  className="h-[50px] flex-row items-center justify-center gap-[9px] rounded-[10px] border border-x-transparent border-t-[rgba(255,255,255,0.4)] border-b-[rgba(0,0,0,0.28)] bg-accent active:opacity-80"
                >
                  <Text className="text-[15px] font-bold tracking-[0.3px] text-on-accent">
                    Start pathway
                  </Text>
                </Pressable>
              )}

              {enrolled ? (
                <Pressable
                  onPress={() => {
                    if (!confirmingDrop) {
                      setConfirmingDrop(true);
                      return;
                    }
                    setConfirmingDrop(false);
                    if (userId) dropPathway(userId, pathway.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Drop this pathway"
                  className="mt-[12px] self-center px-[12px] py-[8px] active:opacity-60"
                >
                  <Text
                    className={`font-mono text-[10px] uppercase tracking-[2px] ${
                      confirmingDrop ? 'text-rose' : 'text-ink-faint'
                    }`}
                  >
                    {confirmingDrop ? 'Tap again to drop' : 'Drop pathway'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View className="mt-[30px] gap-[10px]">
              {pathway.chapters.map((chapter, index) => (
                <ChapterCard
                  key={chapter.id}
                  index={index}
                  chapter={chapter}
                  status={chapterStatus(pathway, index, progress)}
                  progress={progress}
                  expanded={expanded === chapter.id}
                  lockReason={lockReason(current, progress)}
                  onToggle={() => setExpandedId(expanded === chapter.id ? '' : chapter.id)}
                  onOpenSection={openSection}
                  onOpenCheckpoint={() => openCheckpoint(index)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
