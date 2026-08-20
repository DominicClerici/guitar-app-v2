import { View, type LayoutChangeEvent } from 'react-native';
import { useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { SquircleView } from '@/components/Squircle';
import { useToken } from '@/lib/tokens';

import type { RoundResult, Verdict } from './rhythmGrading';
import { barsOf, describePattern, type GridSlot, type RhythmGrid } from './rhythmGrid';

/**
 * The pattern as it is written, with what actually happened drawn underneath it.
 *
 * Both halves share one horizontal axis — a bar is a bar's width, whether you are reading the
 * plan or reading your own playing — which is the whole point. A learner who is consistently
 * ahead sees every mark sitting to the left of its dot, and does not have to be told.
 *
 * The playhead is driven from a shared value on the UI thread, the way the metronome's
 * `BeatRow` is driven, so a round that lasts eight bars costs no React renders at all beyond
 * the marks that land in it.
 */

export type MarkTone =
  /** Heard during the round, before the round has been graded. */
  'pending' | 'on' | 'off' | 'extra';

export interface PlayedMark {
  id: number;
  /** Milliseconds from the downbeat, latency already taken off. */
  atMs: number;
  tone: MarkTone;
}

const MARK_TONE: Record<MarkTone, string> = {
  pending: 'bg-ink-muted',
  on: 'bg-accent',
  off: 'bg-amber',
  extra: 'bg-rose',
};

interface Props {
  grid: RhythmGrid;
  /** 0 at the downbeat, 1 at the end of the last bar. Owned by the runner. */
  progress: SharedValue<number>;
  marks: readonly PlayedMark[];
  /** Filled in once the round has been graded; null while it is still being played. */
  verdicts: ReadonlyMap<number, Verdict> | null;
}

/** A graded pass as the grid's two inputs: what each written hit was worth… */
export function verdictMap(result: RoundResult): Map<number, Verdict> {
  return new Map(result.hits.map((hit) => [hit.slotIndex, hit.verdict]));
}

/** …and where every stroke actually landed, replacing the live marks once there is a judgement. */
export function gradedMarks(result: RoundResult): PlayedMark[] {
  const marks: PlayedMark[] = [];

  for (const hit of result.hits) {
    if (hit.playedAtMs === null) continue;
    marks.push({
      id: marks.length,
      atMs: hit.playedAtMs,
      tone: hit.verdict === 'on' ? 'on' : 'off',
    });
  }
  for (const extra of result.extras) {
    marks.push({ id: marks.length, atMs: extra, tone: 'extra' });
  }

  return marks;
}

export function SlotGrid({ grid, progress, marks, verdicts }: Props) {
  return (
    <View accessible accessibilityLabel={describePattern(grid)}>
      {barsOf(grid).map((slots, bar) => (
        <BarRow
          key={bar}
          grid={grid}
          bar={bar}
          slots={slots}
          progress={progress}
          marks={marks}
          verdicts={verdicts}
        />
      ))}
    </View>
  );
}

function BarRow({
  grid,
  bar,
  slots,
  progress,
  marks,
  verdicts,
}: Props & { bar: number; slots: GridSlot[] }) {
  // Owned here rather than passed in: the row is the only thing that knows how wide it ended
  // up, and both the playhead and the marks are positioned as a fraction of it.
  const width = useSharedValue(0);
  const surface = useToken('--surface', '#181a1f');

  const playhead = useAnimatedStyle(() => {
    const local = progress.value * grid.bars - bar;
    return {
      opacity: local >= 0 && local <= 1 ? 1 : 0,
      transform: [{ translateX: Math.min(Math.max(local, 0), 1) * width.value }],
    };
  });

  const onLayout = (event: LayoutChangeEvent) => {
    width.value = event.nativeEvent.layout.width;
  };

  return (
    <View className="mt-[10px]" onLayout={onLayout}>
      <SquircleView radius={8} fill={surface} clip className="h-[38px] flex-row items-center">
        {slots.map((slot) => (
          <View
            key={slot.index}
            className={`h-full flex-1 items-center justify-center ${
              // A hairline where each beat starts, so the eye can count the bar without
              // gaps between the cells — gaps would put the marks out of step with the dots.
              slot.sub === 0 && slot.beat > 0 ? 'border-l border-line-soft' : ''
            }`}
          >
            <SlotDot slot={slot} verdict={verdicts?.get(slot.index)} />
          </View>
        ))}

        <AnimatedView className="absolute left-0 top-0 h-full w-[2px] bg-accent" style={playhead} />
      </SquircleView>

      <View className="h-[14px] pt-[3px]">
        {marks.map((mark) => {
          const local = mark.atMs / grid.barMs - bar;
          // Only this bar's marks, with the two edges kept: an onset a hair before the
          // downbeat belongs to the first bar, not to nothing.
          if (local < (bar === 0 ? -0.2 : 0)) return null;
          if (local >= (bar === grid.bars - 1 ? 1.2 : 1)) return null;

          return <Mark key={mark.id} fraction={local} tone={mark.tone} width={width} />;
        })}
      </View>
    </View>
  );
}

function SlotDot({ slot, verdict }: { slot: GridSlot; verdict: Verdict | undefined }) {
  if (!slot.expectsHit) {
    return <View className="h-[6px] w-[6px] rounded-full border border-line" />;
  }

  const size = slot.kind === 'accent' ? 'h-[21px] w-[21px]' : 'h-[14px] w-[14px]';
  const skin =
    verdict === 'missed'
      ? 'border-2 border-rose'
      : verdict === 'early' || verdict === 'late'
        ? 'bg-amber'
        : 'bg-accent';

  return <View className={`rounded-full ${size} ${skin}`} />;
}

function Mark({
  fraction,
  tone,
  width,
}: {
  fraction: number;
  tone: MarkTone;
  width: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: fraction * width.value }],
  }));

  return (
    <AnimatedView
      className={`absolute left-0 top-0 h-[9px] w-[2px] rounded-full ${MARK_TONE[tone]}`}
      style={style}
    />
  );
}
