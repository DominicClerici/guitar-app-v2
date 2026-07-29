import * as Haptics from 'expo-haptics';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { useToken } from '@/lib/tokens';

/** How long a ring takes to travel out and fade. */
const RIPPLE_MS = 450;
/** How far past the pad's edge a ring gets before it is gone. */
const RIPPLE_SCALE = 0.35;
/** Rings in the pool. Three overlap comfortably at any tempo a ripple outlives. */
const RINGS = 3;

const PRESS_IN = { duration: 70 };
const PRESS_OUT = { damping: 13, stiffness: 260 };

/**
 * The UI thread's clock. Lives out here because the purity rule reads the gesture
 * callback as render-time code and `performance.now()` as something that must not
 * run there — true of a render, but this only ever runs on a touch.
 */
function uiNow(): number {
  'worklet';
  return performance.now();
}

interface Props {
  /** Records the tap and answers whether it began a new session. */
  onTap: (at: number) => boolean;
}

/**
 * The tap zone. Every touch does three things at once: springs the pad, sends a
 * ring outward, and fires a haptic — a heavier one when the tap starts a fresh
 * count, so beginning again feels different from carrying on.
 *
 * The timestamp is taken in the gesture's worklet, off `performance.now()` on the
 * UI thread, and only then handed to JS. Reading the clock after the hop would
 * fold whatever the JS thread was busy with into the interval, and 20ms of that
 * is four BPM at a moderate tempo.
 */
export function TapPad({ onTap }: Props) {
  const accentLine = useToken('--accent-line', 'rgba(94, 200, 194, 0.5)');
  const accentBright = useToken('--accent-bright', '#86e0da');

  const press = useSharedValue(0);

  // A fixed pool cycled by `cursor`: a ring still travelling is left to finish
  // while the next tap starts the one behind it.
  const r0 = useSharedValue(0);
  const r1 = useSharedValue(0);
  const r2 = useSharedValue(0);
  const cursor = useSharedValue(0);

  const handleTap = (at: number) => {
    const fresh = onTap(at);
    void Haptics.impactAsync(
      fresh ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    );
  };

  // `onBegin` rather than `onEnd`: the beat is where the finger lands, and waiting
  // for the lift would put every reading at the mercy of how long you hold.
  const tap = Gesture.Tap().onBegin(() => {
    const at = uiNow();

    press.value = withSequence(withTiming(1, PRESS_IN), withSpring(0, PRESS_OUT));

    const i = cursor.value;
    cursor.value = (i + 1) % RINGS;
    const ring = i === 0 ? r0 : i === 1 ? r1 : r2;
    // Reset before animating so a ring caught mid-flight restarts from the pad
    // rather than easing back to it.
    ring.value = 0;
    ring.value = withTiming(1, { duration: RIPPLE_MS, easing: Easing.out(Easing.cubic) });

    runOnJS(handleTap)(at);
  });

  const padStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.04 * press.value }],
    borderColor: interpolateColor(press.value, [0, 1], [accentLine, accentBright]),
  }));

  // The gesture takes the whole region rather than the circle: nothing else in the
  // middle of the sheet is tappable, so a beat landing wide of the disc should
  // still count. The circle is the target you aim at, not the edge you must hit.
  return (
    <GestureDetector gesture={tap}>
      <View
        accessibilityRole="button"
        accessibilityLabel="Tap in time to find the tempo"
        className="w-full flex-1 items-center justify-center"
      >
        <View className="aspect-square w-full max-w-[280px] items-center justify-center">
          <Ring progress={r0} />
          <Ring progress={r1} />
          <Ring progress={r2} />

          <AnimatedView
            className="absolute inset-0 items-center justify-center rounded-full border-[2px] bg-accent-wash"
            style={padStyle}
          >
            <Text className="font-mono text-[13px] uppercase tracking-[6px] text-accent">Tap</Text>
          </AnimatedView>
        </View>
      </View>
    </GestureDetector>
  );
}

/** One ring of the pool, drawn at the pad's size and pushed outward from it. */
function Ring({ progress }: { progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + RIPPLE_SCALE * progress.value }],
    opacity: 0.45 * (1 - progress.value),
  }));

  return (
    <AnimatedView
      className="pointer-events-none absolute inset-0 rounded-full border border-accent"
      style={style}
    />
  );
}
