import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { BottomDock } from '@/components/BottomDock';
import { Button } from '@/components/Button';
import { TrackCard } from '@/features/ear-trainer';
import { ProgressRing } from '@/features/learning';
import {
  EAR_PASS_PCT,
  EAR_SESSIONS,
  EAR_TRACKS,
  nextSession,
  pathwayProgress,
  trackProgress,
  trackStatus,
  type EarSession,
} from '@/lib/ear-training';
import { useLearnerId, useProgress, type ProgressBySection } from '@/lib/learning';

// The ear pathway as a map: three tracks down the page, the one you are in
// already open, everything before it folded away and everything after it locked
// with the reason on show. The same shape as `PathwayScreen`, because it answers
// the same question.
//
// The one difference from a curriculum chapter is the important one: sessions
// inside a track are ordered and gated. There is no "every section is open in
// any order" here, because each session is defined by what it adds to the last.

/** Mirror of the back row's `h-[42px]`, needed in JS to place the scroll view on the screen. */
const HEADER_H = 42;

/** How far the in-page action has to have scrolled before the docked copy takes over. */
const DOCK_LINE = 0.05;

/** What `BottomDock` costs the page: 12px above the buttons, the 50px buttons, 8px below. */
const DOCK_H = 70;

/**
 * Why a later track cannot be opened yet, in terms of the one thing standing in
 * the way. Always the track the learner is actually in, never the immediate
 * predecessor: locking is transitive, so the track blocking the chromatic one
 * may well be the major one.
 */
function lockReason(progress: ProgressBySection): string {
  const next = nextSession(progress);
  if (!next) return 'Locked';

  const tally = trackProgress(next.track, progress);

  return `Pass the ${next.track.title.toLowerCase()} track first — ${tally.passed} of ${tally.total} done`;
}

/** Where each track's first session sits in the flattened seventeen. */
const TRACK_OFFSETS = EAR_TRACKS.map((track) => EAR_SESSIONS.indexOf(track.sessions[0]));

export function EarPathwayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const userId = useLearnerId();
  const progress = useProgress(userId);

  // Which track the accordion is showing. Null means "nobody has chosen", which
  // falls through to the track the learner is in — so the screen is right on its
  // first frame, with no effect to set it. The empty string is the other end of
  // that: chosen, and chosen to be nothing.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tally = pathwayProgress(progress);
  const next = nextSession(progress);
  const expanded = expandedId ?? next?.track.id ?? EAR_TRACKS[EAR_TRACKS.length - 1].id;

  const openSession = (session: EarSession) => {
    router.push({ pathname: '/ear-session/[id]', params: { id: session.id } });
  };

  const { height: screenH } = useWindowDimensions();
  const scrollY = useSharedValue(0);
  // Content offset at which the in-page action crosses the dock line, and so the
  // offset past which the dock shows itself. Out of reach until it is laid out.
  const dockAfter = useSharedValue(Number.POSITIVE_INFINITY);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const scrollTop = Math.max(insets.top - 6, 0) + HEADER_H;

  const measureAction = (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    dockAfter.value = y + height + scrollTop - screenH * DOCK_LINE;
  };

  const action = next ? (
    <Button
      variant="primary"
      size="lg"
      icon="play.fill"
      className="flex-1"
      accessibilityLabel={`${tally.passed === 0 ? 'Begin' : 'Continue'} — ${next.session.title}`}
      onPress={() => openSession(next.session)}
    >
      {tally.passed === 0 ? 'Begin' : 'Continue'}
    </Button>
  ) : (
    <Button
      variant="soft"
      size="lg"
      icon="arrow.counterclockwise"
      className="flex-1"
      accessibilityLabel="Practise the full wheel again"
      onPress={() => openSession(EAR_SESSIONS[EAR_SESSIONS.length - 1])}
    >
      Practise again
    </Button>
  );

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-1" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
        <View className="h-[42px] flex-row items-center px-[18px]">
          <BackLink title="Ear" />
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerClassName="px-[18px] pt-[8px]"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 40, DOCK_H + 24) }}
        >
          <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
            {EAR_TRACKS.length} tracks · {tally.total} sessions · 10 questions each
          </Text>
          <Text className="mt-[10px] text-[30px] leading-[34px] font-semibold tracking-[-0.8px] text-ink">
            The degree circle
          </Text>
          <Text className="mt-[8px] text-[13.5px] leading-[20px] text-ink-muted">
            One degree at a time, over a held drone. Each session adds a degree to the last and asks
            ten questions; pass at {EAR_PASS_PCT}% to open the next.
          </Text>

          <View className="mt-[22px] flex-row items-center">
            <View className="flex-1 items-center px-[6px]">
              <Text className="font-mono text-[22px] leading-[24px] font-medium tracking-[0.5px] text-ink">
                {next ? next.track.title : 'Done'}
              </Text>
              <Text
                numberOfLines={2}
                className="mt-[6px] text-center text-[12px] leading-[16px] text-ink-muted"
              >
                {next ? next.session.title : 'Every session passed'}
              </Text>
            </View>
            <View className="flex-1 items-end">
              <ProgressRing pct={tally.pct} />
            </View>
          </View>

          <View className="mt-[20px] flex-row" onLayout={measureAction}>
            {action}
          </View>

          <View className="mt-[30px] gap-[10px]">
            {EAR_TRACKS.map((track, index) => (
              <TrackCard
                key={track.id}
                track={track}
                index={index}
                firstSessionIndex={TRACK_OFFSETS[index]}
                status={trackStatus(index, progress)}
                progress={progress}
                expanded={expanded === track.id}
                lockReason={lockReason(progress)}
                nextSectionId={next?.session.sectionId ?? null}
                onToggle={() => setExpandedId(expanded === track.id ? '' : track.id)}
                onOpenSession={openSession}
              />
            ))}
          </View>
        </Animated.ScrollView>
      </View>

      <BottomDock scrollY={scrollY} threshold={dockAfter}>
        <View className="flex-row">{action}</View>
      </BottomDock>
    </View>
  );
}
