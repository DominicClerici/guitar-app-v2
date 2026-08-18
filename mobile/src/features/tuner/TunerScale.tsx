import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { ALWAYS_ANIMATE } from '@/lib/motion';

import {
  CENTS_STOPS,
  MAX_CENTS,
  centsRamp,
  glowRamp,
  useTunerColors,
  withAlpha,
} from './tunerColors';

// 25 graduations: every fifth is major, the rest fine. The centre is the in-tune mark.
const TICKS = Array.from({ length: 25 }, (_, i) => i);
const CENTER = 12;

// Light enough to track a wobbling string, damped enough that a noisy frame doesn't
// make the needle twitch. Damping ratio is the number that matters here, not the three
// constants: at 2*sqrt(stiffness*mass) = 24.5 this sits at 1.02, a hair overdamped, so
// the needle never overshoots and read a hair sharp before settling back. Keep it just
// above 1.0 if you retune — the extra stiffness buys speed, the ratio buys the manner.
// Kept under reduce motion, unlike almost everything else. This spring is not decoration: it is
// what turns a jittery per-frame pitch estimate into a needle you can read. Removing it does not
// calm the needle down, it hands you the jitter raw.
const SPRING = { damping: 25, stiffness: 500, mass: 0.3, ...ALWAYS_ANIMATE } as const;

// Cents error at which the centre mark has fully gone dark again.
const CENTER_LIT_CENTS = 5;

function tickClass(i: number) {
  if (i % 5 === 0) return 'w-px h-[22px] bg-ink-faint';
  return 'w-px h-[12px] bg-line';
}

type TunerScaleProps = {
  centsSV: SharedValue<number>;
  presenceSV: SharedValue<number>;
};

/**
 * Fixed graduations with a glowing needle riding over them. Everything here runs on the
 * UI thread off the engine's shared values — the component never re-renders while the
 * needle moves.
 */
export function TunerScale({ centsSV, presenceSV }: TunerScaleProps) {
  const colors = useTunerColors();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const ramp = centsRamp(colors);
  const glows = glowRamp(colors);
  // Half the travel, less the needle's own half-width so it can't overhang the card.
  const half = Math.max(0, width / 2 - 2);

  const x = useDerivedValue(() => {
    const clamped = Math.max(-MAX_CENTS, Math.min(MAX_CENTS, centsSV.value));
    return withSpring((clamped / MAX_CENTS) * half, SPRING);
  });

  const presence = useDerivedValue(() => withTiming(presenceSV.value, { duration: 180 }));

  const needleStyle = useAnimatedStyle(() => {
    const a = Math.min(MAX_CENTS, Math.abs(centsSV.value));
    return {
      opacity: presence.value,
      transform: [{ translateX: x.value }],
      backgroundColor: interpolateColor(a, CENTS_STOPS, ramp),
      boxShadow: `0px 0px 10px ${interpolateColor(a, CENTS_STOPS, glows)}`,
    };
  });

  const centerStyle = useAnimatedStyle(() => {
    // Full brightness dead-on, dark by the edge of the in-tune band.
    const lit = presence.value * (1 - Math.min(1, Math.abs(centsSV.value) / CENTER_LIT_CENTS));
    return {
      backgroundColor: interpolateColor(lit, [0, 1], [colors.line, colors.accent]),
      boxShadow: `0px 0px ${8 * lit}px ${withAlpha(colors.accent, 0.65 * lit)}`,
    };
  });

  return (
    <View className="h-[40px]" onLayout={onLayout}>
      <View className="absolute inset-0 flex-row items-end justify-between">
        {TICKS.map((i) =>
          i === CENTER ? (
            <AnimatedView key={i} className="h-[26px] w-[2px] rounded-full" style={centerStyle} />
          ) : (
            <View key={i} className={tickClass(i)} />
          ),
        )}
      </View>
      <AnimatedView
        className="absolute bottom-0 left-1/2 -ml-[1.5px] h-[36px] w-[3px] rounded-full"
        style={needleStyle}
      />
    </View>
  );
}
