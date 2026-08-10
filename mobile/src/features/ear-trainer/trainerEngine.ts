import {
  AudioContext,
  AudioManager,
  type AudioNode,
  type ConvolverNode,
  type GainNode,
  type OscillatorNode,
} from 'react-native-audio-api';

import { voiceById, waveFor } from '@/features/drone/droneVoices';
import { equalFrequency } from '@/features/drone/intonation';
import { buildImpulse } from '@/features/drone/reverb';

// The trainer's whole sound, on one context: the drone underneath and the
// tones over it. One clock is what makes their timing exact, and one graph is
// what lets a key change and a question tone never fight over the session.
//
// Same shape as the other audio engines — module scope, external store — but
// the drone here is deliberately simpler than the drone feature's: one tonic,
// one voice, no chords. What is shared (the voice's harmonic table, the
// synthesised room, the tuning math) is imported from there rather than copied.

/** The drone's timbre. Warm is the one that holds for minutes without tiring. */
const DRONE_VOICE = voiceById('warm');

/** Level of the single drone note. The root's weight from the drone engine's table. */
const DRONE_PEAK = DRONE_VOICE.gain * 1.25;

/** How a running drone hands one tonic to the next. */
const SWAP_ATTACK = 0.55;
const SWAP_RELEASE = 0.5;

/** Room to schedule an edit rather than chase it. */
const LEAD_IN = 0.03;

/** The slow drift that keeps the drone alive rather than clinical. */
const BREATH_HZ = 0.055;

/** Bounds on the drone's lowpass. */
const CUTOFF_FLOOR = 220;
const CUTOFF_CEILING = 11000;

// The tone voice: struck, bright, and two octaves over the drone, so a
// question reads as a separate instrument rather than the drone moving.
const TONE_ATTACK = 0.006;
const TONE_DECAY = 1.6;
const TONE_STRIKE = 0.3;
/** The octave-up partial that makes it read as plucked rather than blown. */
const TONE_PARTIAL = 0.3;
const TONE_CUTOFF_FLOOR = 700;
const TONE_CUTOFF_CEILING = 9000;
/** How much of a tone goes to the room. A struck note needs less than a held one. */
const TONE_WET = 0.14;

export interface TrainerEngineSnapshot {
  running: boolean;
}

interface DroneNote {
  sources: OscillatorNode[];
  env: GainNode;
  nodes: AudioNode[];
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;

let running = false;
let droneMidi = 36;
let drone: DroneNote | null = null;

const listeners = new Set<() => void>();

let snapshot: TrainerEngineSnapshot = { running: false };

export function getSnapshot(): TrainerEngineSnapshot {
  return snapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(next: Partial<TrainerEngineSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();

    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);

    reverb = ctx.createConvolver();
    reverb.buffer = buildImpulse(ctx);
    reverb.connect(master);
  }
  return ctx;
}

/**
 * One drone note: the drone feature's warm voice reduced to a single tonic.
 * Two detuned layers whose beating keeps it alive, the sine an octave under
 * for floor, and a breath LFO so a note held for minutes never quite holds still.
 */
function buildDrone(midi: number, at: number, attack: number): DroneNote {
  const context = ensureContext();
  const out = master;
  const room = reverb;
  if (!out || !room) throw new Error('ear-trainer: master chain missing');

  const frequency = equalFrequency(midi);
  const wave = waveFor(context, DRONE_VOICE);

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.7;
  filter.frequency.value = Math.min(
    CUTOFF_CEILING,
    Math.max(CUTOFF_FLOOR, frequency * DRONE_VOICE.brightness),
  );

  const blend = context.createGain();
  blend.gain.value = 0.5;
  blend.connect(filter);

  const sources: OscillatorNode[] = [];
  for (const cents of [-DRONE_VOICE.detune, DRONE_VOICE.detune]) {
    const osc = context.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = frequency;
    osc.detune.value = cents;
    osc.connect(blend);
    sources.push(osc);
  }

  const sub = context.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = frequency / 2;
  const subGain = context.createGain();
  subGain.gain.value = DRONE_VOICE.sub;
  sub.connect(subGain);
  subGain.connect(filter);
  sources.push(sub);

  const env = context.createGain();
  env.gain.setValueAtTime(0, at);
  // Two segments rather than one: heard arriving, then easing into place.
  env.gain.linearRampToValueAtTime(DRONE_PEAK * 0.72, at + attack * 0.42);
  env.gain.linearRampToValueAtTime(DRONE_PEAK, at + attack);
  filter.connect(env);

  const breath = context.createGain();
  breath.gain.value = 1;
  env.connect(breath);

  const lfo = context.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = BREATH_HZ;
  const depth = context.createGain();
  depth.gain.value = DRONE_VOICE.breath;
  lfo.connect(depth);
  depth.connect(breath.gain);
  sources.push(lfo);

  breath.connect(out);

  const send = context.createGain();
  send.gain.value = DRONE_VOICE.wet;
  breath.connect(send);
  send.connect(room);

  for (const source of sources) source.start(at);

  return { sources, env, nodes: [blend, filter, env, breath, send, subGain, depth] };
}

function releaseDrone(note: DroneNote, at: number, over: number) {
  note.env.gain.cancelAndHoldAtTime(at);
  note.env.gain.linearRampToValueAtTime(0, at + over);

  const end = at + over + 0.05;
  for (const source of note.sources) source.stop(end);

  const context = ctx;
  const wait = context ? Math.max(0, end - context.currentTime) : over;
  setTimeout(
    () => {
      for (const source of note.sources) source.disconnect();
      for (const node of note.nodes) node.disconnect();
    },
    wait * 1000 + 60,
  );
}

async function begin() {
  const context = ensureContext();

  try {
    // Playback and mixing, not record and solo — the trainer should sit over a
    // backing track rather than silence it.
    AudioManager.setAudioSessionOptions({
      iosCategory: 'playback',
      iosMode: 'default',
      iosOptions: ['mixWithOthers'],
    });
    await AudioManager.setAudioSessionActivity(true);
  } catch {
    // A session the system refused still leaves the context worth trying.
  }

  if (context.state !== 'running') await context.resume();
  // Stopped while the session was being set up.
  if (!running) return;

  drone = buildDrone(droneMidi, context.currentTime + LEAD_IN, DRONE_VOICE.attack);
}

export function start(midi: number): void {
  if (running) return;
  running = true;
  droneMidi = midi;
  emit({ running: true });
  void begin();
}

export function stop(): void {
  if (!running) return;
  running = false;

  if (ctx && drone) releaseDrone(drone, ctx.currentTime + LEAD_IN, DRONE_VOICE.release);
  drone = null;
  emit({ running: false });
}

/**
 * Moves the drone to a new tonic. Under a running drone the old note releases
 * as the new one swells — a change of ground, not a restart.
 */
export function setDroneMidi(midi: number): void {
  if (midi === droneMidi) return;
  droneMidi = midi;

  const context = ctx;
  if (!running || !context) return;

  const at = context.currentTime + LEAD_IN;
  if (drone) releaseDrone(drone, at, SWAP_RELEASE);
  drone = buildDrone(midi, at, SWAP_ATTACK);
}

/**
 * Sounds one tone over the drone — a question, a tap on the circle, or a
 * feedback comparison. All three are the same voice on purpose: comparing two
 * degrees is only fair when the only difference is the degree.
 */
export function playTone(midi: number): void {
  const context = ensureContext();
  const out = master;
  const room = reverb;
  if (!out || !room) return;

  const at = context.currentTime + LEAD_IN;
  const frequency = equalFrequency(midi);
  const end = at + TONE_DECAY;

  const env = context.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(TONE_STRIKE, at + TONE_ATTACK);
  env.gain.exponentialRampToValueAtTime(0.0001, end);

  const tone = context.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = Math.min(TONE_CUTOFF_CEILING, Math.max(TONE_CUTOFF_FLOOR, frequency * 6));

  env.connect(tone);
  tone.connect(out);

  const send = context.createGain();
  send.gain.value = TONE_WET;
  tone.connect(send);
  send.connect(room);

  // The fundamental carries the pitch; the octave above it carries the attack.
  const fundamental = context.createOscillator();
  fundamental.type = 'triangle';
  fundamental.frequency.value = frequency;

  const partial = context.createOscillator();
  partial.type = 'sine';
  partial.frequency.value = frequency * 2;

  const partialGain = context.createGain();
  partialGain.gain.value = TONE_PARTIAL;

  fundamental.connect(env);
  partial.connect(partialGain);
  partialGain.connect(env);

  fundamental.start(at);
  partial.start(at);
  fundamental.stop(end);
  partial.stop(end);
}

/** Stops and hands the audio session back. Called when the screen goes away. */
export function release(): void {
  stop();
  void AudioManager.setAudioSessionActivity(false).catch(() => {});
}
