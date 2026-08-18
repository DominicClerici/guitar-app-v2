import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AnimatedView } from '@/components/AnimatedView';
import { centsTextClass } from '@/features/tuner/tunerColors';
import { useNoteName, type NoteInfo } from '@/features/tuner';
import { ALWAYS_ANIMATE } from '@/lib/motion';
import { useToken } from '@/lib/tokens';

import { RECORD_MS } from './useSampleCapture';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 232;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const EM_DASH = '—';
const MINUS = '−';

interface Props {
  recording: boolean;
  /** Bumps per take, so a fresh recording restarts the sweep. */
  takeId: number;
  note: NoteInfo | null;
  /** Dims the readout when the pitch is not the one being asked for. */
  onPitch: boolean;
}

/**
 * The recording window, drawn as a ring that closes over three seconds. Waiting
 * breathes; recording sweeps. Nothing here is driven by a shared value — the
 * animations read `recording` straight out of the worklet's closure, so a take
 * begins and ends purely on the state change.
 */
export function CaptureDial({ recording, takeId, note, onPitch }: Props) {
  const nameOf = useNoteName();
  const accent = useToken('--accent', '#5ec8c2');
  const line = useToken('--line-soft', '#23262d');

  // `takeId` is in the dependencies rather than the body: two consecutive takes
  // produce an identical worklet, and without it the second would not re-run.
  const sweep = useAnimatedProps(
    () => ({
      strokeDashoffset: recording
        ? // Both halves opt out of reduce motion: this ring is the take's countdown, and a sweep
          // that completes instantly reports a three-second recording as already over.
          withSequence(
            withTiming(CIRCUMFERENCE, { duration: 0, ...ALWAYS_ANIMATE }),
            withTiming(0, { duration: RECORD_MS, easing: Easing.linear, ...ALWAYS_ANIMATE }),
          )
        : withTiming(CIRCUMFERENCE, { duration: 240 }),
    }),
    [recording, takeId],
  );

  const halo = useAnimatedStyle(() => ({
    opacity: recording
      ? withTiming(0, { duration: 200 })
      : withRepeat(
          withSequence(
            withTiming(0.5, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
            withTiming(0.12, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          false,
        ),
  }));

  const centsClass = note && onPitch ? centsTextClass(note.cents) : 'text-ink-faint';

  return (
    <View className="items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <AnimatedView
        className="absolute rounded-full border border-accent-line"
        style={[{ width: SIZE - 26, height: SIZE - 26 }, halo]}
      />

      <View className="absolute inset-0">
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
            // Starts closed and draws in as the take runs. Rotated so it sweeps
            // from twelve o'clock rather than from three.
            strokeDashoffset={CIRCUMFERENCE}
            originX={SIZE / 2}
            originY={SIZE / 2}
            rotation={-90}
            animatedProps={sweep}
          />
        </Svg>
      </View>

      <View className="items-center">
        <View className="flex-row items-end">
          <Text
            className={`text-[64px] font-semibold leading-[70px] tracking-[-2px] ${
              note && onPitch ? 'text-ink' : 'text-ink-faint'
            }`}
          >
            {note ? nameOf(note.midi) : EM_DASH}
          </Text>
          {note ? (
            <Text className="mb-[14px] ml-[2px] text-[18px] font-medium text-ink-muted">
              {note.octave}
            </Text>
          ) : null}
        </View>

        <Text className={`mt-[2px] font-mono text-[11.5px] tracking-[1.5px] ${centsClass}`}>
          {note
            ? `${note.cents >= 0 ? '+' : MINUS}${Math.abs(note.cents).toFixed(1)} ¢`
            : `${EM_DASH} ¢`}
        </Text>
      </View>
    </View>
  );
}
