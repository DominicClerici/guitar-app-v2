import { useEffect } from 'react';
import { View } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';

import { PROFILE_STEPS, type ProfileStep } from './steps';

/**
 * How far along the profile questions someone is.
 *
 * Only the four steps after the account are counted. The two before them are deliberately left
 * uncounted: at that point nobody has agreed to anything yet, and answering "create your account"
 * with "1 of 6" is a reason to close the app rather than a reassurance.
 *
 * It reads as a rail rather than a row of equal dots — the step you are on is a stretched pill, the
 * ones behind it are settled accent, the ones ahead are hairline. So the shape says where you are
 * without a number, and the fact that the rail is short is the reassurance.
 */

const DOT = 5;
const CURRENT = 18;
const TIMING = { duration: 260, easing: Easing.out(Easing.cubic) };

/** Behind, on, or ahead — which is the whole of what a dot has to say. */
type Position = 'past' | 'current' | 'future';

const INK: Record<Position, string> = {
  past: 'bg-accent-muted',
  current: 'bg-accent',
  future: 'bg-line',
};

function Dot({ position }: { position: Position }) {
  const width = useSharedValue(position === 'current' ? CURRENT : DOT);

  // In an effect rather than during render: a shared value written while rendering is not a pure
  // render, and it is deliberately absent from the dependencies — one listed there is one the
  // compiler then refuses to let this effect write to.
  useEffect(() => {
    width.value = withTiming(position === 'current' ? CURRENT : DOT, TIMING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  const style = useAnimatedStyle(() => ({ width: width.value }));

  return <AnimatedView style={style} className={`h-[5px] rounded-full ${INK[position]}`} />;
}

export function StepDots({ step, className = '' }: { step: ProfileStep; className?: string }) {
  const at = PROFILE_STEPS.indexOf(step);

  return (
    <View
      className={`flex-row items-center gap-[6px] ${className}`}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${at + 1} of ${PROFILE_STEPS.length}`}
    >
      {PROFILE_STEPS.map((name, index) => (
        <Dot
          key={name}
          position={index === at ? 'current' : index < at ? 'past' : 'future'}
        />
      ))}
    </View>
  );
}
