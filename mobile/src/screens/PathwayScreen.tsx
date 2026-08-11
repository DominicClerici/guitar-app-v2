import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { BottomDock } from '@/components/BottomDock';
import { Button } from '@/components/Button';
import {
  ChapterCard,
  PathwayActions,
  PathwayMenuSheet,
  ProgressRing,
  type PathwayAction,
  type PathwayMenuSheetRef,
} from '@/features/learning';
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
  stepSectionId,
  stepTitle,
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

/** Mirror of the back row's `h-[42px]`, needed in JS to place the scroll view on the screen. */
const HEADER_H = 42;

/**
 * How far down the screen the controls have to have scrolled before the docked copy takes over.
 * A twentieth is barely off the top edge — by the time the row is that high it is on its way out.
 */
const DOCK_LINE = 0.05;

/** What `BottomDock` costs the page: 12px above the buttons, the 50px buttons, 8px below. */
const DOCK_H = 70;

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
    : `Pass the Chapter ${ordinal} quiz`;
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
  const menu = useRef<PathwayMenuSheetRef>(null);

  const current = pathway ? currentChapter(pathway, progress) : null;
  const expanded = expandedId ?? current?.chapter.id ?? null;
  const tally = pathway ? pathwayProgress(pathway, progress) : null;
  const step = pathway ? nextStep(pathway, progress) : null;
  const nextSectionId = stepSectionId(step);
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

  // The one thing to do on this pathway, which is a matter of where the learner stands. Built once
  // and rendered twice — in the page, and docked at the bottom once the page's copy has gone.
  const action: PathwayAction | null = !pathway
    ? null
    : enrolled
      ? step
        ? {
            kind: 'continue',
            label: tally && tally.completed === 0 ? 'Begin' : 'Continue',
            onPress: () => router.push(nextStepHref(pathway.slug, step)),
          }
        : { kind: 'complete' }
      : atCap
        ? { kind: 'capped' }
        : {
            kind: 'start',
            title: pathway.title,
            onPress: () => {
              if (userId) startPathway(userId, pathway.id);
            },
          };

  const { height: screenH } = useWindowDimensions();
  const scrollY = useSharedValue(0);
  // Content offset at which the row in the page crosses the dock line, and so the offset past
  // which the dock shows itself. Out of reach until the row has been laid out.
  const dockAfter = useSharedValue(Number.POSITIVE_INFINITY);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Where the top of the scroll view sits on the screen — what turns the row's offset within the
  // content into a position the dock line can be compared against.
  const scrollTop = Math.max(insets.top - 6, 0) + HEADER_H;

  const measureActions = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    dockAfter.value = y + height + scrollTop - screenH * DOCK_LINE;
  };

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-1" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
        <View className="h-[42px] flex-row items-center px-[18px]">
          <BackLink title="Pathway" />
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
            <Button
              variant="secondary"
              size="xs"
              text="mono"
              radius={999}
              accessibilityLabel="Try loading the pathway again"
              onPress={query.reload}
            >
              Retry
            </Button>
          </View>
        ) : (
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerClassName="px-[18px] pt-[8px]"
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 40, DOCK_H + 24) }}
          >
            <Strap pathway={pathway} />
            <Text className="mt-[10px] text-[30px] leading-[34px] font-semibold tracking-[-0.8px] text-ink">
              {pathway.title}
            </Text>
            <Text className="mt-[8px] text-[13.5px] leading-[20px] text-ink-muted">
              {pathway.summary}
            </Text>

            {tally ? (
              <View className="mt-[22px] flex-row items-center">
                <View className="flex-1 items-center px-[6px]">
                  <Text className="font-mono text-[22px] leading-[24px] font-medium tracking-[0.5px] text-ink">
                    {step ? `Ch. ${step.index + 1}` : 'Done'}
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="mt-[6px] text-center text-[12px] leading-[16px] text-ink-muted"
                  >
                    {step ? stepTitle(step) : 'Every chapter complete'}
                  </Text>
                </View>
                <View className="flex-1 items-end">
                  <ProgressRing pct={tally.pct} />
                </View>
              </View>
            ) : null}

            {action ? (
              <View className="mt-[20px]" onLayout={measureActions}>
                <PathwayActions action={action} onMenu={() => menu.current?.present()} />
              </View>
            ) : null}

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
                  nextSectionId={nextSectionId}
                  onToggle={() => setExpandedId(expanded === chapter.id ? '' : chapter.id)}
                  onOpenSection={openSection}
                  onOpenCheckpoint={() => openCheckpoint(index)}
                />
              ))}
            </View>
          </Animated.ScrollView>
        )}
      </View>

      {/* The capped state is a paragraph rather than a control, and there is nothing to keep in
          reach — so that one pathway is the one screen with no dock. */}
      {action && action.kind !== 'capped' ? (
        <BottomDock scrollY={scrollY} threshold={dockAfter}>
          <PathwayActions action={action} onMenu={() => menu.current?.present()} docked />
        </BottomDock>
      ) : null}

      {pathway ? (
        <PathwayMenuSheet
          ref={menu}
          enrolled={enrolled}
          onDrop={() => {
            menu.current?.dismiss();
            if (userId) dropPathway(userId, pathway.id);
          }}
        />
      ) : null}
    </View>
  );
}
