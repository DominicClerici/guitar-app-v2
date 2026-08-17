import { useEffect, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';

/**
 * One step replacing another, without a navigator.
 *
 * The flow is state, not routes, so nothing pushes — but a wizard still has to say which way it
 * went, and a plain crossfade says neither. So the outgoing step leaves the way the flow is
 * travelling and the incoming one arrives from the opposite side: forward leaves left, back leaves
 * right.
 *
 * The two never overlap. The old step slides out and fades, and only once it is gone is the new
 * one mounted and brought in — the same reasoning as `Swap`, which this is the directional cousin
 * of: two steps of different heights crossfading would leave the taller one showing through the
 * shorter, and a form dissolving into another form is unreadable however brief it is.
 *
 * `render` rather than `children` for exactly that reason: the slot has to go on drawing the step
 * the caller has already left while it sees it out.
 */

const SLIDE_MS = 190;
/** How far a step travels. Short: this is a change of question, not a change of place. */
const TRAVEL = 28;

/** Out on a decelerating curve, in on an accelerating one, so the pair reads as one movement. */
const OUT = { duration: SLIDE_MS, easing: Easing.in(Easing.cubic) };
const IN = { duration: SLIDE_MS, easing: Easing.out(Easing.cubic) };

export function StepSlide({
  step,
  direction,
  render,
  className = '',
}: {
  /** What is on show. Any change starts a slide; the value is handed back to `render`. */
  step: string;
  /** Which way the flow is going, which is the only thing the animation says. */
  direction: 'forward' | 'back';
  render: (step: string) => ReactNode;
  className?: string;
}) {
  const [shown, setShown] = useState(step);
  const offset = useSharedValue(0);
  const fade = useSharedValue(1);

  /** The newest step, which is not always the one the slide under way set off for. */
  const landing = useRef(step);
  /** The slide under way, if there is one, waiting at the empty point in the middle of it. */
  const sliding = useRef<ReturnType<typeof setTimeout> | null>(null);

  // In an effect rather than at render: a ref written while rendering is not a pure render, and
  // the compiler's lint says so. The timeout below is 190ms away, so this is long since current.
  useEffect(() => {
    landing.current = step;
  }, [step]);

  useEffect(() => {
    if (step === shown || sliding.current) return;

    // The direction the slide *began* in, held by this closure. A caller reversing mid-flight
    // should not have the movement already on screen turn around under it.
    const away = direction === 'forward' ? -TRAVEL : TRAVEL;
    offset.value = withTiming(away, OUT);
    fade.value = withTiming(0, OUT);

    sliding.current = setTimeout(() => {
      sliding.current = null;
      // Whatever the newest step is by now, not the one this slide left for — a caller that
      // changed its mind mid-slide gets one movement to where it ended up, not a stutter.
      setShown(landing.current);

      // Placed on the far side before anything is drawn, so the arrival is never seen starting
      // from where the departure ended.
      offset.value = -away;
      offset.value = withTiming(0, IN);
      fade.value = withTiming(1, IN);
    }, SLIDE_MS);
    // `offset` and `fade` are deliberately absent: a shared value listed as a dependency is one
    // the compiler then refuses to let this effect write to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, shown, direction]);

  useEffect(() => {
    return () => {
      if (sliding.current) clearTimeout(sliding.current);
    };
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateX: offset.value }],
  }));

  return (
    <View className={className}>
      <AnimatedView style={style}>{render(shown)}</AnimatedView>
    </View>
  );
}
