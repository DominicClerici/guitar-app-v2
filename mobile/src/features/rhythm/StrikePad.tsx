import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { Face } from '@/components/Face';
import { haptics } from '@/lib/haptics';

/**
 * The rhythm, played with a finger instead of a pick.
 *
 * It exists because the microphone path asks for a lot before it can judge anything: permission, a
 * quiet room, two bars of calibration, and a guitar. None of that is needed to learn where an
 * upbeat falls, and a tool that cannot be used on a train is a tool that gets used less.
 *
 * THE TIMESTAMP IS THE WHOLE POINT. It is taken inside the gesture's worklet, on the UI thread,
 * and only then handed to JS — reading the clock after the hop would fold whatever the JS thread
 * was busy with into the measurement, and this is a measurement of timing. `Date.now()` rather
 * than `performance.now()` because the grader works in epoch milliseconds, which is the clock the
 * click was scheduled against; the two have to be the same clock or the comparison is meaningless.
 *
 * `onBegin` rather than `onEnd`: the note is where the finger lands, not where it lifts.
 */

/** Lives at module scope because the purity rule reads a gesture callback as render-time code. */
function epochNow(): number {
  'worklet';
  return Date.now();
}

const PRESS_IN = { duration: 60 };
const PRESS_OUT = { damping: 14, stiffness: 300 };
const FLASH_OUT = { duration: 260 };

interface Props {
  /** A strike, in epoch milliseconds. */
  onStrike: (atEpochMs: number) => void;
  /** Nothing is being played, so the pad is a label rather than an instrument. */
  idle: boolean;
}

export function StrikePad({ onStrike, idle }: Props) {
  const press = useSharedValue(0);
  const flash = useSharedValue(0);

  const strike = (at: number) => {
    onStrike(at);
    haptics.light();
  };

  const tap = Gesture.Tap()
    .maxDuration(10000)
    .onBegin(() => {
      const at = epochNow();

      press.value = withSequence(withTiming(1, PRESS_IN), withSpring(0, PRESS_OUT));
      flash.value = 1;
      flash.value = withTiming(0, FLASH_OUT);

      runOnJS(strike)(at);
    });

  const face = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - 0.012 * press.value }],
    opacity: 0.35 + 0.65 * flash.value,
  }));

  return (
    <GestureDetector gesture={tap}>
      <View
        accessibilityRole="button"
        accessibilityLabel="Tap the rhythm"
        className="flex-1 items-center justify-center px-[18px]"
      >
        <AnimatedView className="h-full w-full items-center justify-center" style={face}>
          <Face name="accent" radius={18} />
          <Text className="font-mono text-[13px] uppercase tracking-[6px] text-accent">Tap</Text>
          {idle ? (
            <Text className="mt-[10px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
              Start the drill first
            </Text>
          ) : null}
        </AnimatedView>
      </View>
    </GestureDetector>
  );
}
