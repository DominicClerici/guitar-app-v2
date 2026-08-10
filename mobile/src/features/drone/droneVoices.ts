import type { BaseAudioContext, PeriodicWave } from 'react-native-audio-api';

/**
 * A timbre, as everything that distinguishes one sustained tone from another.
 * No sample files ship with the app — the harmonic content is a table of partial
 * amplitudes compiled into a `PeriodicWave`, which is what lets a single
 * oscillator carry a whole instrument's colour.
 */
export interface DroneVoice {
  id: string;
  label: string;
  /** Amplitude of each harmonic, fundamental first. Relative — the wave is normalised. */
  partials: number[];
  /** Cents each of the two layers is pushed off true pitch. */
  detune: number;
  /** Lowpass cutoff, as a multiple of the fundamental. */
  brightness: number;
  /** Where the filter starts, as a fraction of its cutoff. Below 1 the note swells open. */
  openFrom: number;
  /** Peak level of one note, before the note count is taken into account. */
  gain: number;
  /** How far the slow LFO moves a note's level, as a fraction of it. */
  breath: number;
  /** Seconds from silence to full. */
  attack: number;
  /** Seconds from full to silence. */
  release: number;
  /** Level of the sine an octave under the root. 0 for none. */
  sub: number;
  /** How much of the note is sent to the reverb. */
  wet: number;
}

/**
 * Three voices, from bare to full. The partial tables are what make them
 * different instruments rather than the same one filtered three ways: Pure is
 * effectively a sine, Warm leans on its odd harmonics the way a reed does, and
 * Bowed carries the full stack a string does under a bow.
 */
export const VOICES: DroneVoice[] = [
  {
    id: 'pure',
    label: 'Pure',
    // A sine with just enough second and third to have a body rather than being
    // a test tone. This is the one to tune against.
    partials: [1, 0.06, 0.02],
    detune: 2,
    brightness: 9,
    openFrom: 1,
    gain: 0.3,
    breath: 0.05,
    attack: 0.7,
    release: 1,
    sub: 0,
    wet: 0.1,
  },
  {
    id: 'warm',
    label: 'Warm',
    // Odd harmonics ahead of their even neighbours — the 3rd over the 2nd, the
    // 5th over the 4th — which is the shape a free reed makes and why a
    // harmonium sounds sweet held for minutes rather than tiring.
    partials: [1, 0.3, 0.45, 0.18, 0.2, 0.09, 0.08, 0.04, 0.03],
    detune: 5,
    brightness: 6,
    openFrom: 1,
    gain: 0.26,
    breath: 0.09,
    attack: 1.1,
    release: 1.4,
    sub: 0.18,
    wet: 0.2,
  },
  {
    id: 'bowed',
    label: 'Bowed',
    // A full stack rolling off gently, with the filter opening across the attack
    // so the note arrives the way a bow leans into a string.
    partials: [1, 0.55, 0.36, 0.26, 0.2, 0.15, 0.11, 0.08, 0.06, 0.045],
    detune: 7,
    brightness: 7,
    openFrom: 0.35,
    gain: 0.22,
    breath: 0.12,
    attack: 1.8,
    release: 1.8,
    sub: 0.1,
    wet: 0.28,
  },
];

export const DEFAULT_VOICE = VOICES[1];

export function voiceById(id: string): DroneVoice {
  return VOICES.find((voice) => voice.id === id) ?? DEFAULT_VOICE;
}

const waveCache = new WeakMap<BaseAudioContext, Map<string, PeriodicWave>>();

/**
 * The voice's partial table as a wave the oscillator can play. Built once per
 * context and kept: the table is fixed, and rebuilding it per note would put a
 * Fourier transform on the path of every chord change.
 */
export function waveFor(ctx: BaseAudioContext, voice: DroneVoice): PeriodicWave {
  let byId = waveCache.get(ctx);
  if (!byId) {
    byId = new Map();
    waveCache.set(ctx, byId);
  }

  const cached = byId.get(voice.id);
  if (cached) return cached;

  // Index 0 is DC and stays silent; harmonic n lives at index n. Sine phase
  // (imag) rather than cosine, so every partial starts from zero and the wave
  // has no step at its own boundary.
  const real = new Float32Array(voice.partials.length + 1);
  const imag = new Float32Array(voice.partials.length + 1);
  voice.partials.forEach((amplitude, index) => {
    imag[index + 1] = amplitude;
  });

  const wave = ctx.createPeriodicWave(real, imag);
  byId.set(voice.id, wave);
  return wave;
}
