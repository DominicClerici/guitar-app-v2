import { useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  withDecay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { AnimatedView } from '@/components/AnimatedView';
import { useToken } from '@/lib/tokens';

import type { Intonation } from './intonation';
import { shapeFor, snakePath, underPath, wavesFor } from './waveShape';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** How fast the line drifts left, in points per second. Slow enough to watch. */
const DRIFT_RATE = 62;
/**
 * The drift is one long ramp rather than a loop. A loop would have to travel a
 * whole number of waves to come back to the same picture, and the wave count is
 * fractional between one note and the next — so instead the ramp simply runs for
 * longer than anyone holds a drone: four million points is about eighteen hours.
 */
const DRIFT_SPAN = 4_000_000;
const DRIFT_MS = (DRIFT_SPAN / DRIFT_RATE) * 1000;
/** Stopping is a coast rather than a cut, so the wave settles as the sound falls away. */
const DRIFT_STOP = { velocity: DRIFT_RATE, deceleration: 0.997 };

/** How long a change of note, chord or voice takes to travel through the shape. */
const MORPH = { duration: 520, easing: Easing.inOut(Easing.cubic) };

/** Silence to full, and back. Slower in than out, the way the pad itself is. */
const RISE = { duration: 1100, easing: Easing.out(Easing.cubic) };
const FALL = { duration: 700, easing: Easing.out(Easing.quad) };

/**
 * The breath: the line grows and shrinks while it sounds, so a held note reads as
 * something being sustained rather than as a still picture that happens to slide.
 * Equal temperament breathes deeper — two notes a hair out of tune with each other
 * beat, and that beat is the one thing about the tuning switch you can hear but
 * cannot otherwise see.
 */
const BREATH_HIGH = 1.05;
const BREATH_LOW_EQUAL = 0.86;
const BREATH_LOW_JUST = 0.94;
const BREATH_MS = 2400;

/** Notes drawn at once. Past three the overlay stops reading as depth. */
const LAYERS = 3;
/**
 * Per layer, front first: reach off the line, weight and solidity of the stroke,
 * how heavy the ground under it is, and how fast it drifts. The reach drops away
 * steeply on purpose — the note carrying the chord has to own the outline, or the
 * tighter waves of the notes above it cross it everywhere and there is no wave left
 * to count. The wash is a fraction of the stroke throughout: the line is the thing
 * being read, and what it holds off the centre is only there to give it a body.
 */
const LAYER_REACH = [1, 0.62, 0.42];
const LAYER_WIDTH = [2.5, 2, 1.5];
const LAYER_OPACITY = [0.85, 0.42, 0.22];
const LAYER_WASH = [0.18, 0.1, 0.055];
const LAYER_RATE = [1, 0.82, 0.66];
/** Offsets, so the layers do not all cross the line in the same places. */
const LAYER_PHASE = [0, 0.31, 0.63];
/** Painted back to front, so the note carrying the chord is the one on top. */
const BACK_TO_FRONT = [2, 1, 0];

interface Props {
  /** MIDI pitches sounding, bottom up. */
  pitches: number[];
  /** The pitch the shape is built around when there is nothing sounding yet. */
  rootMidi: number;
  voiceId: string;
  intonation: Intonation;
  running: boolean;
  /** The line's full swing, breath included. */
  height?: number;
}

/**
 * The drone, drawn. Flat while nothing is sounding, and swelling out of that line
 * into a run of waves crossing back and forth over it — a line per note, as many
 * waves across the screen as the pitch is high, in the shape the voice makes.
 *
 * Nothing is read back off the audio thread, so this is a picture of the drone
 * rather than an analysis of it. What it costs is a path per note rebuilt on the
 * UI thread while the sound is running, and nothing at all once it has stopped.
 */
export function DroneWave({
  pitches,
  rootMidi,
  voiceId,
  intonation,
  running,
  height = 116,
}: Props) {
  const { width } = useWindowDimensions();
  const accent = useToken('--accent', '#5ec8c2');

  const shape = shapeFor(voiceId);
  const sounding = pitches.length > 0 ? pitches : [rootMidi];
  const notes = layerNotes(sounding);

  // Fuller chords swing wider, so a single note reads as the quietest thing on the
  // screen and a thirteenth as the busiest. The ceiling is divided down by the
  // breath so that the top of a breath is still inside the canvas, and the margin
  // covers the half of the widest stroke that sits outside the curve itself.
  const ceiling = (height / 2 - 4) / BREATH_HIGH;
  const reach = ceiling * Math.min(0.62 + sounding.length * 0.1, 1) * shape.rise;

  const drift = useDerivedValue(
    () =>
      running
        ? withTiming(DRIFT_SPAN, { duration: DRIFT_MS, easing: Easing.linear })
        : withDecay(DRIFT_STOP),
    [running],
  );

  const trough = intonation === 'equal' ? BREATH_LOW_EQUAL : BREATH_LOW_JUST;

  const swell = useAnimatedStyle(
    () => ({
      transform: [
        {
          scaleY: running
            ? withSequence(
                withTiming(BREATH_HIGH, RISE),
                withRepeat(
                  withTiming(trough, { duration: BREATH_MS, easing: Easing.inOut(Easing.sin) }),
                  -1,
                  true,
                ),
              )
            : withTiming(0, FALL),
        },
      ],
    }),
    [running, trough],
  );

  return (
    <View className="w-full justify-center overflow-hidden" style={{ height }} pointerEvents="none">
      <View className="absolute h-[1.5px] w-full bg-accent-line opacity-45" />

      <AnimatedView className="h-full w-full" style={swell}>
        {BACK_TO_FRONT.map((layer) => (
          <WaveLayer
            key={layer}
            // A layer with no note of its own keeps drawing the one in front of it
            // while it goes: a chord thinning to a single note collapses into the
            // wave it is left with rather than fading out beside it.
            pitch={notes[layer] ?? sounding[0]}
            amplitude={notes[layer] === null ? 0 : reach * LAYER_REACH[layer]}
            width={width}
            height={height}
            color={accent}
            weight={LAYER_WIDTH[layer]}
            opacity={LAYER_OPACITY[layer]}
            wash={LAYER_WASH[layer]}
            drift={drift}
            rate={LAYER_RATE[layer]}
            offset={LAYER_PHASE[layer]}
            third={shape.third}
            tilt={shape.tilt}
          />
        ))}
      </AnimatedView>
    </View>
  );
}

/**
 * Which notes get a wave. One each up to three, taken across the chord rather than
 * off the bottom of it, so a wide voicing reads as wide — the bass, something in
 * the middle, and the top. A single note gets a single wave and nothing behind it.
 */
function layerNotes(pitches: readonly number[]): (number | null)[] {
  const sorted = [...pitches].sort((a, b) => a - b);
  const notes: (number | null)[] = [];

  for (let layer = 0; layer < LAYERS; layer += 1) {
    if (layer >= sorted.length) {
      notes.push(null);
      continue;
    }

    notes.push(sorted[Math.round((layer * (sorted.length - 1)) / (LAYERS - 1))]);
  }

  return notes;
}

interface LayerProps {
  pitch: number;
  amplitude: number;
  width: number;
  height: number;
  color: string;
  weight: number;
  opacity: number;
  /** Opacity of the ground between the line and the centre. */
  wash: number;
  /** Points the line has drifted. Shared, so the layers keep their offsets from each other. */
  drift: SharedValue<number>;
  rate: number;
  offset: number;
  third: number;
  tilt: number;
}

/**
 * One note's wave: the line, and the ground it holds off the centre. Every number
 * the shape is built from is a spring of its own, so a change of note, chord or
 * voice is travelled through rather than cut to — the path is rebuilt from wherever
 * those numbers have reached on the frame it is drawn, which is the only way a wave
 * count can be halfway between two notes.
 */
function WaveLayer({
  pitch,
  amplitude,
  width,
  height,
  color,
  weight,
  opacity,
  wash,
  drift,
  rate,
  offset,
  third,
  tilt,
}: LayerProps) {
  const waves = useDerivedValue(() => withTiming(wavesFor(pitch), MORPH), [pitch]);
  const band = useDerivedValue(() => withTiming(amplitude, MORPH), [amplitude]);
  const partial = useDerivedValue(() => withTiming(third, MORPH), [third]);
  const lean = useDerivedValue(() => withTiming(tilt, MORPH), [tilt]);

  // Built once and drawn twice: the fill is the same line closed back along the
  // centre, so the two can never disagree about where the curve went.
  const line = useDerivedValue(() => {
    const count = waves.value;
    // The drift is measured in points, so all three layers move across the screen
    // at a speed of their own choosing; how much of a wave that is depends on how
    // wide this layer's waves have become.
    const phase = (drift.value * rate * count) / width + offset;

    return snakePath(width, count, band.value, phase, partial.value, lean.value);
  }, [width, rate, offset]);

  const stroked = useAnimatedProps(() => ({ d: line.value }));
  const filled = useAnimatedProps(() => ({ d: underPath(line.value, width) }), [width]);

  return (
    <View className="absolute left-0 top-0">
      <Svg width={width} height={height} viewBox={`0 ${-height / 2} ${width} ${height}`}>
        <AnimatedPath animatedProps={filled} fill={color} fillOpacity={wash} stroke="none" />
        <AnimatedPath
          animatedProps={stroked}
          fill="none"
          stroke={color}
          strokeWidth={weight}
          strokeOpacity={opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
