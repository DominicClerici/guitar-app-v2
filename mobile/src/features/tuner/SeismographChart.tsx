import { memo, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';

import { CENTS_STOPS, MAX_CENTS, centsRamp, useTunerColors, type TunerColors } from './tunerColors';

const ROWS = 60;
const BAR_HEIGHT = 3;
// Bar width scales with pitch error: 12px in tune, +1px per cent off.
const MIN_BAR_WIDTH = 12;
const MAX_BAR_WIDTH = MIN_BAR_WIDTH + MAX_CENTS;

type ChartProps = {
  centsSV: SharedValue<number>;
  presenceSV: SharedValue<number>;
  frameSV: SharedValue<number>;
  width: number;
  height: number;
};

function SeismographChartImpl({ centsSV, presenceSV, frameSV, width, height }: ChartProps) {
  const colors = useTunerColors();
  // One shared array holds the rolling window; NaN marks a row with no reading.
  const samples = useSharedValue<number[]>(new Array(ROWS).fill(NaN));

  // Advance on the engine's frame counter rather than on `centsSV`, so the trace keeps
  // scrolling through a silence that would otherwise hold cents at a constant 0.
  useAnimatedReaction(
    () => frameSV.value,
    () => {
      const value = presenceSV.value > 0 ? centsSV.value : NaN;
      const next = new Array(ROWS);
      const prev = samples.value;
      next[0] = value;
      for (let i = 1; i < ROWS; i++) next[i] = prev[i - 1];
      samples.value = next;
    },
    [],
  );

  const rowHeight = height / ROWS;
  const halfWidth = width / 2;
  // Leave room for the widest bar so ±50 cent rows don't clip at the edges.
  const xMax = halfWidth - MAX_BAR_WIDTH / 2;
  const ramp = centsRamp(colors);

  return (
    <SeismographFrame width={width} height={height} colors={colors}>
      {Array.from({ length: ROWS }).map((_, i) => (
        <Row
          key={i}
          index={i}
          samples={samples}
          xMax={xMax}
          rowHeight={rowHeight}
          halfWidth={halfWidth}
          ramp={ramp}
        />
      ))}
    </SeismographFrame>
  );
}

/**
 * Rolling pitch trace: newest reading at the top, scrolling down and fading out. Memoized
 * so the sheet's ~10Hz note-text updates don't re-reconcile 60 animated rows.
 */
export const SeismographChart = memo(SeismographChartImpl);

/**
 * The static guides with no animated rows. Cheap to mount, so the sheet can render it
 * while the live chart is deferred and the two line up exactly.
 */
export function SeismographFrame({
  width,
  height,
  colors,
  children,
}: {
  width: number;
  height: number;
  colors: TunerColors;
  children?: ReactNode;
}) {
  const halfWidth = width / 2;
  const xMax = halfWidth - MAX_BAR_WIDTH / 2;

  return (
    <View style={{ width, height }}>
      <View className="absolute top-0 w-px bg-line" style={{ left: halfWidth - 0.5, height }} />
      {[-50, -25, 25, 50].map((c) => (
        <View
          key={c}
          className="absolute top-0 w-px bg-line-soft"
          style={{ left: halfWidth + (c / MAX_CENTS) * xMax - 0.5, height }}
        />
      ))}
      {children}
    </View>
  );
}

function Row({
  index,
  samples,
  xMax,
  rowHeight,
  halfWidth,
  ramp,
}: {
  index: number;
  samples: SharedValue<number[]>;
  xMax: number;
  rowHeight: number;
  halfWidth: number;
  ramp: string[];
}) {
  // Older rows fade out; computed once per row rather than per frame.
  const fade = 1 - index / ROWS;

  const animatedStyle = useAnimatedStyle(() => {
    const v = samples.value[index];
    const present = !Number.isNaN(v);
    const clamped = present ? Math.max(-MAX_CENTS, Math.min(MAX_CENTS, v)) : 0;
    const a = Math.abs(clamped);
    // Rendered at MAX_BAR_WIDTH and scaled down on the transform fast-path (no per-frame
    // layout); translateX re-centres it on `clamped`.
    const barWidth = MIN_BAR_WIDTH + a;
    const x = halfWidth - MAX_BAR_WIDTH / 2 + (clamped / MAX_CENTS) * xMax;

    return {
      transform: [
        { translateX: x },
        { translateY: index * rowHeight },
        { scaleX: barWidth / MAX_BAR_WIDTH },
      ],
      backgroundColor: interpolateColor(a, CENTS_STOPS, ramp),
      opacity: present ? fade : 0,
    };
  });

  return (
    <AnimatedView
      className="absolute left-0 top-0 rounded-[1.5px]"
      style={[{ width: MAX_BAR_WIDTH, height: BAR_HEIGHT }, animatedStyle]}
    />
  );
}
