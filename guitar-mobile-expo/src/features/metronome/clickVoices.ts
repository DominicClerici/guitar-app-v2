import type { AudioNode, BaseAudioContext, OscillatorType } from 'react-native-audio-api';

/** Which of the three sounds a voice makes is being asked for. */
export type ClickRole = 'accent' | 'beat' | 'subdivision';

interface Tone {
  type: OscillatorType;
  freq: number;
  /** What the pitch falls to across the decay, as a multiple of `freq`. 1 holds it. */
  sweep: number;
  gain: number;
  /** Seconds from strike to silence. */
  decay: number;
}

export interface ClickVoice {
  id: string;
  label: string;
  tones: Record<ClickRole, Tone>;
}

/**
 * Three voices, all synthesised — no sample files ship with the app. Each is the
 * same shape at three weights, because a bar only reads as a bar if the downbeat,
 * the beat and the subdivision are recognisably one instrument.
 */
export const VOICES: ClickVoice[] = [
  {
    id: 'click',
    label: 'Click',
    tones: {
      accent: { type: 'sine', freq: 1800, sweep: 1, gain: 0.9, decay: 0.04 },
      beat: { type: 'sine', freq: 1200, sweep: 1, gain: 0.6, decay: 0.04 },
      subdivision: { type: 'sine', freq: 1200, sweep: 1, gain: 0.2, decay: 0.025 },
    },
  },
  {
    id: 'wood',
    label: 'Wood',
    // The downward pitch sweep is what reads as a struck block rather than a tone.
    tones: {
      accent: { type: 'triangle', freq: 1050, sweep: 0.45, gain: 1, decay: 0.06 },
      beat: { type: 'triangle', freq: 720, sweep: 0.45, gain: 0.7, decay: 0.06 },
      subdivision: { type: 'triangle', freq: 720, sweep: 0.5, gain: 0.24, decay: 0.035 },
    },
  },
  {
    id: 'beep',
    label: 'Beep',
    tones: {
      accent: { type: 'sine', freq: 880, sweep: 1, gain: 0.8, decay: 0.09 },
      beat: { type: 'sine', freq: 587, sweep: 1, gain: 0.55, decay: 0.08 },
      subdivision: { type: 'sine', freq: 587, sweep: 1, gain: 0.18, decay: 0.05 },
    },
  },
];

export const DEFAULT_VOICE = VOICES[0];

/** Long enough that the envelope does not step from zero and pop, short enough to stay a transient. */
const ATTACK = 0.0015;
/** Exponential ramps cannot reach zero; this is close enough to be inaudible. */
const FLOOR = 0.0001;

/**
 * Builds one click and hands it to the audio thread to play at `time`. Everything
 * is scheduled ahead — nothing here has to run at the moment the click sounds, which
 * is the whole reason the beat holds while JS is busy.
 */
export function renderClick(
  ctx: BaseAudioContext,
  destination: AudioNode,
  tone: Tone,
  time: number,
): void {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = tone.type;
  osc.frequency.setValueAtTime(tone.freq, time);
  if (tone.sweep !== 1) {
    osc.frequency.exponentialRampToValueAtTime(tone.freq * tone.sweep, time + tone.decay);
  }

  env.gain.setValueAtTime(0, time);
  env.gain.linearRampToValueAtTime(tone.gain, time + ATTACK);
  env.gain.exponentialRampToValueAtTime(FLOOR, time + tone.decay);

  osc.connect(env);
  env.connect(destination);

  osc.start(time);
  // A hair past the envelope's end, so the stop never truncates the tail audibly.
  osc.stop(time + tone.decay + 0.02);
}
