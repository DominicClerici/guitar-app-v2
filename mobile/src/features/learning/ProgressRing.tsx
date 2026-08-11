import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useToken } from '@/lib/tokens';

// The headline share of a pathway, as one closed figure.
//
// A ring rather than the segmented track next to it: this reads as a single quantity at a glance
// and pairs with the chapter number beside it, whereas `ProgressTrack` is for the places that want
// section-by-section granularity. Both are on the pathway screen's budget of one glanceable number.

const SIZE = 74;
const STROKE = 6;

const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ pct }: { pct: number }) {
  const track = useToken('--line', '#2a2e36');
  const accent = useToken('--accent', '#5ec8c2');

  const clamped = Math.max(0, Math.min(100, pct));
  // A pathway barely started still shows a mark, so the ring never reads as broken — but only once
  // something is actually done, or an untouched pathway would claim credit.
  const swept = clamped === 0 ? 0 : Math.max(CIRCUMFERENCE * (clamped / 100), STROKE);

  return (
    <View
      className="items-center justify-center"
      accessibilityLabel={`${clamped}% complete`}
      style={{ width: SIZE, height: SIZE }}
    >
      <View className="pointer-events-none absolute inset-0" accessible={false}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={track}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Rotated so the arc starts at twelve o'clock rather than three, and rounded so a short
              one still has a shape. */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={accent}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${swept} ${CIRCUMFERENCE}`}
            fill="none"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
      </View>
      <Text className="font-mono text-[17px] font-medium tracking-[-0.5px] text-ink">
        {clamped}
        <Text className="text-[10px] text-ink-muted">%</Text>
      </Text>
    </View>
  );
}
