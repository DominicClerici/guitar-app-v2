import { useEffect, useRef, useState, type ReactNode } from 'react';
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
 *
 * A swap already under way is never restarted. Changes arriving while the slot is on its way out
 * are folded into it, and the one still standing when it reaches the dark point is what comes back
 * — so a caller changing its mind several times in a few hundred milliseconds (a reader holding
 * down Next, say) gets one clean fade to the state they ended on rather than a stutter of them.
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
  /** The newest id, which is not always the one the swap under way set off for. */
  const landing = useRef(id);
  /** The swap under way, if there is one, waiting at the dark point in the middle of it. */
  const swapping = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    landing.current = id;
    if (id === shown || swapping.current) return;

    fade.value = withSequence(
      withTiming(0, { duration: fadeMs }),
      withDelay(holdMs, withTiming(1, { duration: fadeMs })),
    );
    swapping.current = setTimeout(() => {
      swapping.current = null;
      setShown(landing.current);
    }, fadeMs + holdMs);
  }, [id, shown, fade, fadeMs, holdMs]);

  useEffect(
    () => () => {
      if (swapping.current) clearTimeout(swapping.current);
    },
    [],
  );

  const style = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    // Mid-swap the slot is showing a control the caller has already replaced, so a press landing on
    // it would run the new state's handler against the old label.
    <AnimatedView pointerEvents={id === shown ? 'auto' : 'none'} className={className} style={style}>
      {render(shown)}
    </AnimatedView>
  );
}
