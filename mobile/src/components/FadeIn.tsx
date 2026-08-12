import { useEffect, type ReactNode } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedView } from './AnimatedView';

/**
 * Content that arrives by fading up, once, on mount.
 *
 * For a screen the reader paged into: the stack brought it in with no animation of its own, so what
 * makes the change of screen readable is the body appearing under a header that never moved.
 * Inactive it is an ordinary wrapper — a screen opened the usual way has already been animated by
 * the stack and should not be faded a second time.
 */
export function FadeIn({
  active,
  durationMs = 200,
  className,
  children,
}: {
  active: boolean;
  durationMs?: number;
  className?: string;
  children: ReactNode;
}) {
  const fade = useSharedValue(active ? 0 : 1);

  useEffect(() => {
    if (active) fade.value = withTiming(1, { duration: durationMs });
  }, [active, durationMs, fade]);

  const style = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <AnimatedView className={className} style={style}>
      {children}
    </AnimatedView>
  );
}
