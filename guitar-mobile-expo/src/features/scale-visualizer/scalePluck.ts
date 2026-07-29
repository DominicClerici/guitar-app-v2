import { AudioContext, AudioManager, type GainNode } from 'react-native-audio-api';

// A plucked note, for hearing what a dot on the neck actually sounds like.
//
// Same shape as the metronome and drone engines — one module-scope context,
// created on the first note and handed back when the screen goes away — but far
// simpler than either, because nothing here sustains or has to stay in step. A
// note is two oscillators and an envelope, and then it is gone.

/** A2 = 110Hz at MIDI 45, the reference the fret maths hangs off. */
const A4_MIDI = 69;
const A4_HZ = 440;

const ATTACK = 0.006;
const DECAY = 1.4;
/** Level one note is struck at. Two of these overlapping must not clip. */
const STRIKE = 0.32;
/** The octave-up partial that makes it read as plucked rather than blown. */
const PARTIAL_GAIN = 0.3;
/** Bounds on the lowpass, so a low note keeps its harmonics and a high one loses its edge. */
const CUTOFF_FLOOR = 700;
const CUTOFF_CEILING = 9000;
/** Room to schedule a note rather than chase it. */
const LEAD_IN = 0.02;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
/** Whether the session has already been asked for, so tapping dots doesn't re-ask. */
let sessionReady = false;

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  return ctx;
}

export function frequencyOf(midi: number): number {
  return A4_HZ * 2 ** ((midi - A4_MIDI) / 12);
}

/** Takes the audio session. Call before the screen's first note. */
export async function prepare(): Promise<void> {
  const context = ensureContext();

  if (!sessionReady) {
    sessionReady = true;
    try {
      // Playback rather than record, mixing rather than solo, so a note sits over
      // whatever else is playing instead of stopping it.
      AudioManager.setAudioSessionOptions({
        iosCategory: 'playback',
        iosMode: 'default',
        iosOptions: ['mixWithOthers'],
      });
      await AudioManager.setAudioSessionActivity(true);
    } catch {
      // A session the system refused still leaves the context worth trying.
    }
  }

  if (context.state !== 'running') await context.resume();
}

/** Where the audio clock is now, so a caller can schedule a run of notes against it. */
export function now(): number {
  return ensureContext().currentTime + LEAD_IN;
}

/**
 * Sounds one note. `at` is a time on the audio clock — pass `now()` for
 * immediately, or offsets from it to lay out a phrase in advance.
 */
export function pluck(midi: number, at?: number): void {
  const context = ensureContext();
  const out = master;
  if (!out) return;

  const start = at ?? now();
  const frequency = frequencyOf(midi);
  const end = start + DECAY;

  const env = context.createGain();
  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(STRIKE, start + ATTACK);
  env.gain.exponentialRampToValueAtTime(0.0001, end);

  const tone = context.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = Math.min(CUTOFF_CEILING, Math.max(CUTOFF_FLOOR, frequency * 6));

  env.connect(tone);
  tone.connect(out);

  // The fundamental carries the pitch; the octave above it carries the attack.
  const fundamental = context.createOscillator();
  fundamental.type = 'triangle';
  fundamental.frequency.value = frequency;

  const partial = context.createOscillator();
  partial.type = 'sine';
  partial.frequency.value = frequency * 2;

  const partialGain = context.createGain();
  partialGain.gain.value = PARTIAL_GAIN;

  fundamental.connect(env);
  partial.connect(partialGain);
  partialGain.connect(env);

  fundamental.start(start);
  partial.start(start);
  fundamental.stop(end);
  partial.stop(end);
}

/** Hands the audio session back. Called when the screen goes away. */
export function release(): void {
  sessionReady = false;
  void AudioManager.setAudioSessionActivity(false).catch(() => {});
}
