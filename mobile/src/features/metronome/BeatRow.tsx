import { Pressable, View } from 'react-native';
import {
  Easing,
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { ALWAYS_ANIMATE } from '@/lib/motion';
import { useToken } from '@/lib/tokens';

import type { BeatAccent } from './patterns';

// Reduce motion does not reach these: the flash *is* the metronome's visual beat, and one that
// lands on its final value instantly is a pip that never lights at all.
const STRIKE = { duration: 40, ...ALWAYS_ANIMATE };
const RELEASE = { duration: 300, easing: Easing.out(Easing.quad), ...ALWAYS_ANIMATE };

interface Props {
  pattern: BeatAccent[];
  beatSV: SharedValue<number>;
  tickSV: SharedValue<number>;
  onCycle: (index: number) => void;
}

/**
 * The bar. One pip per beat, tall for an accent and hollow for a rest, lighting as
 * the beat sounds — so a glance tells you both where you are and what the pattern is.
 * Tapping a pip cycles it.
 */
export function BeatRow({ pattern, beatSV, tickSV, onCycle }: Props) {
  const flash = useSharedValue(0);

  // Driven off the tick counter rather than off `beatSV`, which does not change on a
  // one-beat bar and would leave it unlit.
  useAnimatedReaction(
    () => tickSV.value,
    (_current, previous) => {
      if (previous === null) return;
      flash.value = withSequence(withTiming(1, STRIKE), withTiming(0, RELEASE));
    },
  );

  return (
    <View className="h-[58px] flex-row items-end gap-[6px]">
      {pattern.map((accent, index) => (
        <Pip
          key={index}
          index={index}
          accent={accent}
          beatSV={beatSV}
          flash={flash}
          onPress={() => onCycle(index)}
        />
      ))}
    </View>
  );
}

const HEIGHT: Record<BeatAccent, string> = {
  accent: 'h-[38px]',
  normal: 'h-[24px]',
  silent: 'h-[24px]',
};

const DESCRIPTION: Record<BeatAccent, string> = {
  accent: 'accented',
  normal: 'normal',
  silent: 'muted',
};

interface PipProps {
  index: number;
  accent: BeatAccent;
  beatSV: SharedValue<number>;
  flash: SharedValue<number>;
  onPress: () => void;
}

function Pip({ index, accent, beatSV, flash, onPress }: PipProps) {
  const line = useToken('--line', '#2a2e36');
  const muted = useToken('--ink-muted', '#9aa0aa');
  const accentColor = useToken('--accent', '#5ec8c2');
  const bright = useToken('--accent-bright', '#86e0da');
  const accentLine = useToken('--accent-line', 'rgba(94, 200, 194, 0.5)');

  const silent = accent === 'silent';
  const rest = accent === 'accent' ? muted : line;
  const lit = accent === 'accent' ? bright : accentColor;

  const style = useAnimatedStyle(() => {
    const on = beatSV.value === index ? flash.value : 0;
    return {
      // A muted beat lights its outline only — the beat passes, the bar stays quiet.
      backgroundColor: silent ? 'transparent' : interpolateColor(on, [0, 1], [rest, lit]),
      borderColor: interpolateColor(on, [0, 1], [line, accentLine]),
      transform: [{ scaleY: 1 + 0.1 * on }],
      boxShadow: `0px 0px ${16 * on}px ${accentLine}`,
    };
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Beat ${index + 1}, ${DESCRIPTION[accent]}`}
      accessibilityHint="Cycles this beat between accented, normal and muted"
      className="h-full flex-1 justify-end active:opacity-60"
    >
      <AnimatedView
        className={`w-full origin-bottom rounded-[4px] ${HEIGHT[accent]} ${silent ? 'border' : ''}`}
        style={style}
      />
    </Pressable>
  );
}
