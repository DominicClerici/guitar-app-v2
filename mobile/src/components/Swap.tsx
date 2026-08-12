import { useEffect, useState, type ReactNode } from 'react';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from './AnimatedView';

/**
 * A slot whose contents change without moving: the old fades out, the new is put in place while
 * nothing is visible, and it fades in.
 *
 * The swap happens in the dark rather than as a true crossfade so the two never overlap — which is
 * what lets one control replace another of a different width in a row that must not reflow, and
 * what stops a button appearing to mutate under the finger that just pressed it.
 *
 * Contents come from `render` rather than `children` so the slot can go on drawing the *previous*
 * state for the first half of the swap while its caller has already moved on to the next one.
 * `id` is that state, named: equal ids mean nothing has to happen.
 */
export function Swap({
  id,
  render,
  fadeMs = 150,
  holdMs = 50,
  className,
}: {
  /** What is on show. Any change starts a swap; the value is handed back to `render`. */
  id: string;
  render: (id: string) => ReactNode;
  fadeMs?: number;
  /** The gap at zero opacity between the two halves. */
  holdMs?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(id);
  const fade = useSharedValue(1);

  useEffect(() => {
    if (id === shown) return;

    fade.value = withSequence(
      withTiming(0, { duration: fadeMs }),
      withDelay(holdMs, withTiming(1, { duration: fadeMs })),
    );
    const timer = setTimeout(() => setShown(id), fadeMs + holdMs);

    return () => clearTimeout(timer);
  }, [id, shown, fade, fadeMs, holdMs]);

  const style = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    // Mid-swap the slot is showing a control the caller has already replaced, so a press landing on
    // it would run the new state's handler against the old label.
    <AnimatedView pointerEvents={id === shown ? 'auto' : 'none'} className={className} style={style}>
      {render(shown)}
    </AnimatedView>
  );
}
