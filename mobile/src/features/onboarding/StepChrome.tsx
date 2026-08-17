import { useEffect, type ReactNode } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';

/**
 * A piece of the frame that not every step has, fading where it stands.
 *
 * The button and the progress rail live outside the step that needs them, which is what keeps them
 * from moving when a step changes. So the two of them cannot arrive by travelling the way content
 * does — a button that slid in would be the one thing on the screen that had moved, and the whole
 * point of anchoring it was that it does not. It fades instead, and it fades faster than the step
 * it belongs to so the frame has settled by the time the question is readable.
 *
 * Hidden it keeps its space, takes no taps and is not read out: an invisible Continue is still a
 * button as far as a finger and a screen reader are concerned.
 */

const FADE_MS = 150;
const TIMING = { duration: FADE_MS, easing: Easing.out(Easing.quad) };

export function StepChrome({
  shown,
  className,
  children,
}: {
  shown: boolean;
  className?: string;
  children: ReactNode;
}) {
  const fade = useSharedValue(shown ? 1 : 0);

  // In an effect rather than during render: a shared value written while rendering is not a pure
  // render, and the compiler's lint says so.
  useEffect(() => {
    fade.value = withTiming(shown ? 1 : 0, TIMING);
  }, [fade, shown]);

  const style = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <AnimatedView
      className={className}
      style={style}
      pointerEvents={shown ? 'auto' : 'none'}
      accessibilityElementsHidden={!shown}
      importantForAccessibility={shown ? 'auto' : 'no-hide-descendants'}
    >
      {children}
    </AnimatedView>
  );
}
