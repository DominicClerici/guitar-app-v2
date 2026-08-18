import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AnimatedView } from '@/components/AnimatedView';
import { useToken } from '@/lib/tokens';

import { PLAY_MS } from './moment';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 88;
const STROKE = 2;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** How long one ring takes to ring out, and where in the run each of the two starts. */
const RIPPLE_MS = 520;
const RIPPLES = [0, 180] as const;
const RIPPLE_LAST = 180;

/** The strike, in two halves: past its size, then settling back onto it. */
const STRIKE_MS = 240;

interface Direction {
  /**
   * Backwards: the ring un-draws, the note is drawn back into itself and the rings that rang out
   * come home. Every curve is the mirror of the one it undoes, which is what makes it read as the
   * same movement rather than as a second, sadder one.
   */
  reverse: boolean;
  /** When it starts, which is when the curtain owns the screen. */
  delayMs: number;
}

/**
 * One ring travelling outwards and fading as it goes, or inwards and gathering.
 *
 * Its own component because each needs its own clock, and hooks cannot be handed out across a map.
 */
function Ripple({ delay, reverse }: { delay: number; reverse: boolean }) {
  const spread = useSharedValue(reverse ? 1 : 0);

  useEffect(() => {
    spread.value = withDelay(
      delay,
      withTiming(reverse ? 0 : 1, {
        duration: RIPPLE_MS,
        easing: reverse ? Easing.in(Easing.quad) : Easing.out(Easing.quad),
      }),
    );
  }, [delay, reverse, spread]);

  // Gone before it reaches the ring drawn around it, so the two never touch.
  const style = useAnimatedStyle(() => ({
    opacity: (1 - spread.value) * 0.5,
    transform: [{ scale: 0.45 + spread.value * 0.72 }],
  }));

  return (
    <AnimatedView
      pointerEvents="none"
      className="absolute size-[64px] rounded-full border border-accent-line"
      style={style}
    />
  );
}

/**
 * The mark the curtain is built around: a note struck, ringing out, inside a ring that closes.
 *
 * Not a tick and not a guitar. A tick would be reporting that a form submitted successfully, which
 * is the least interesting thing that just happened, and a guitar would be telling someone holding
 * one what they already know. What is left is the app's own vocabulary — the stopped-note dot it
 * draws on every fretboard — given the one thing a still diagram never has, which is the sound.
 *
 * Played backwards it is the same mark being put away, which is what signing out is. Everything
 * runs once from mount: the curtain plays the mark and is then taken down over it.
 */
export function CurtainMark({ reverse = false, delayMs = 0 }: Partial<Direction>) {
  const accent = useToken('--accent', '#5ec8c2');
  const line = useToken('--line-soft', '#23262d');

  // Backwards starts from where forwards ends, so the whole mark is on screen and readable for the
  // length of the fade that brought the curtain down before any of it moves.
  const sweep = useSharedValue(reverse ? 0 : CIRCUMFERENCE);
  const strike = useSharedValue(reverse ? 1 : 0);

  useEffect(() => {
    // The ring is the longest thing here and sets the run's length: it is still moving for a moment
    // after everything else has settled, which is what stops the mark landing all at once.
    sweep.value = withDelay(
      delayMs,
      withTiming(reverse ? CIRCUMFERENCE : 0, {
        duration: PLAY_MS,
        easing: reverse ? Easing.in(Easing.cubic) : Easing.out(Easing.cubic),
      }),
    );

    // Struck rather than grown — past its size and back, in the time a plucked string takes to stop
    // moving. Backwards it swells once more before it goes, which is the same two halves read from
    // the other end.
    strike.value = withDelay(
      // Forwards the note follows the ring in a little late; backwards it is the first thing to go.
      delayMs + (reverse ? 0 : 60),
      reverse
        ? withSequence(
            withTiming(1.12, { duration: STRIKE_MS, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: STRIKE_MS, easing: Easing.in(Easing.cubic) }),
          )
        : withSequence(
            withTiming(1.12, { duration: STRIKE_MS, easing: Easing.out(Easing.cubic) }),
            withTiming(1, { duration: STRIKE_MS, easing: Easing.inOut(Easing.quad) }),
          ),
    );
  }, [delayMs, reverse, strike, sweep]);

  const ring = useAnimatedProps(() => ({ strokeDashoffset: sweep.value }));
  const dot = useAnimatedStyle(() => ({ transform: [{ scale: strike.value }] }));

  return (
    <View className="items-center justify-center">
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={line}
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={accent}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          // Rotated so it closes from twelve o'clock rather than three. The offset the sweep drives
          // is set on mount, so the initial value here only matters for the frame before it runs.
          strokeDashoffset={reverse ? 0 : CIRCUMFERENCE}
          originX={SIZE / 2}
          originY={SIZE / 2}
          rotation={-90}
          animatedProps={ring}
        />
      </Svg>

      {RIPPLES.map((at) => (
        <Ripple
          key={at}
          // The order of the two is mirrored as well: the ring that rang out first is the last one
          // home.
          delay={delayMs + (reverse ? RIPPLE_LAST - at : at)}
          reverse={reverse}
        />
      ))}

      <AnimatedView className="absolute size-[15px] rounded-full bg-accent" style={dot} />
    </View>
  );
}
