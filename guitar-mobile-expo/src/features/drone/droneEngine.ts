import {
  AudioContext,
  AudioManager,
  type AudioNode,
  type ConvolverNode,
  type GainNode,
  type OscillatorNode,
  type StereoPannerNode,
} from 'react-native-audio-api';

import { DEFAULT_VOICE, voiceById, waveFor, type DroneVoice } from './droneVoices';
import { frequencyFor, type Intonation } from './intonation';
import { buildImpulse } from './reverb';

/** Gap between one note blooming and the next, when the drone starts from silence. */
const BLOOM_STAGGER = 0.07;
/** Attack and release used when the chord changes under a running drone. */
const SWAP_ATTACK = 0.55;
const SWAP_RELEASE = 0.5;
/** How long a kept note takes to settle into its new weight in a changed chord. */
const REWEIGHT = 0.3;
/** Room to schedule an edit rather than chase it. */
const LEAD_IN = 0.03;
/** Slowest and fastest a note's level drifts, in Hz. Below hearing — this is motion, not vibrato. */
const BREATH_BASE = 0.055;
const BREATH_SPREAD = 0.019;
/** How far a note is pushed off centre. Modest: a drone should sit in front of you, not around you. */
const PAN_WIDTH = 0.6;
/** Bounds on the lowpass, so a bass note keeps its harmonics and a high one loses its edge. */
const CUTOFF_FLOOR = 220;
const CUTOFF_CEILING = 11000;

export interface DroneSnapshot {
  running: boolean;
  voiceId: string;
  intonation: Intonation;
  /** 0–1, as the user set it. The curve into actual gain is applied here, not there. */
  level: number;
  /** MIDI pitches currently assigned to the drone, sounding or not. */
  pitches: number[];
}

interface Note {
  midi: number;
  sources: OscillatorNode[];
  env: GainNode;
  panner: StereoPannerNode;
  /** Everything to disconnect once the note has finished releasing. */
  nodes: AudioNode[];
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;

let running = false;
let voice: DroneVoice = DEFAULT_VOICE;
let intonation: Intonation = 'equal';
let level = 0.75;
let pitches: number[] = [];
let rootMidi = 40;

const notes = new Map<number, Note>();

const listeners = new Set<() => void>();

let snapshot: DroneSnapshot = {
  running: false,
  voiceId: voice.id,
  intonation,
  level,
  pitches,
};

export function getSnapshot(): DroneSnapshot {
  return snapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(next: Partial<DroneSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

/** Perceptual rather than linear: the bottom of the rail has to be usably quiet. */
function masterGain(): number {
  return level ** 1.7;
}

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();

    master = ctx.createGain();
    master.gain.value = masterGain();
    master.connect(ctx.destination);

    reverb = ctx.createConvolver();
    reverb.buffer = buildImpulse(ctx);
    reverb.connect(master);
  }
  return ctx;
}

/**
 * How loud one note is within a chord. Equal-power against the note count, so a
 * six-note chord and a single held note land at the same loudness; the root
 * carries extra, and each note above it a little less, which is what stops the
 * top of a wide voicing from sounding like the melody.
 */
function weightFor(index: number, count: number): number {
  const roll = index === 0 ? 1.25 : 1 - Math.min(0.3, 0.05 * index);
  return roll / Math.sqrt(count);
}

function panFor(index: number, count: number): number {
  if (count < 2) return 0;
  return -PAN_WIDTH / 2 + PAN_WIDTH * (index / (count - 1));
}

/**
 * Builds one note and hands it to the audio thread to begin at `at`. Two layers
 * detuned against each other are what keep it alive: the beating between them
 * is slow, uneven and never repeats, which is the difference between a held
 * chord and a test tone. The LFO on top moves the whole note at a rate no other
 * note shares, so the chord never settles into one shape.
 */
function buildNote(midi: number, index: number, count: number, at: number, attack: number): Note {
  const context = ensureContext();
  const out = master;
  const room = reverb;
  if (!out || !room) throw new Error('drone: master chain missing');

  const frequency = frequencyFor(midi, rootMidi, intonation);
  const peak = voice.gain * weightFor(index, count);
  const wave = waveFor(context, voice);

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.7;
  const cutoff = Math.min(CUTOFF_CEILING, Math.max(CUTOFF_FLOOR, frequency * voice.brightness));
  if (voice.openFrom < 1) {
    filter.frequency.setValueAtTime(cutoff * voice.openFrom, at);
    filter.frequency.exponentialRampToValueAtTime(cutoff, at + attack * 1.5);
  } else {
    filter.frequency.value = cutoff;
  }

  const blend = context.createGain();
  blend.gain.value = 0.5;
  blend.connect(filter);

  const sources: OscillatorNode[] = [];
  for (const cents of [-voice.detune, voice.detune]) {
    const osc = context.createOscillator();
    osc.setPeriodicWave(wave);
    osc.frequency.value = frequency;
    osc.detune.value = cents;
    osc.connect(blend);
    sources.push(osc);
  }

  const extra: AudioNode[] = [];

  // Only the root gets the octave beneath it. Under every note it would be a
  // second chord an octave down, and the bottom would turn to mud.
  if (index === 0 && voice.sub > 0) {
    const sub = context.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = frequency / 2;
    const subGain = context.createGain();
    subGain.gain.value = voice.sub;
    sub.connect(subGain);
    subGain.connect(filter);
    sources.push(sub);
    extra.push(subGain);
  }

  const env = context.createGain();
  env.gain.setValueAtTime(0, at);
  // Two segments rather than one: the level arrives quickly enough to be heard
  // starting, then eases into place instead of stopping dead at the top.
  env.gain.linearRampToValueAtTime(peak * 0.72, at + attack * 0.42);
  env.gain.linearRampToValueAtTime(peak, at + attack);
  filter.connect(env);

  const breath = context.createGain();
  breath.gain.value = 1;
  env.connect(breath);

  const lfo = context.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = BREATH_BASE + index * BREATH_SPREAD;
  const depth = context.createGain();
  depth.gain.value = voice.breath;
  lfo.connect(depth);
  depth.connect(breath.gain);
  sources.push(lfo);
  extra.push(depth);

  const panner = context.createStereoPanner();
  panner.pan.value = panFor(index, count);
  breath.connect(panner);
  panner.connect(out);

  const send = context.createGain();
  send.gain.value = voice.wet;
  panner.connect(send);
  send.connect(room);

  for (const source of sources) source.start(at);

  return {
    midi,
    sources,
    env,
    panner,
    nodes: [blend, filter, env, breath, panner, send, ...extra],
  };
}

function teardown(note: Note) {
  for (const source of note.sources) source.disconnect();
  for (const node of note.nodes) node.disconnect();
}

function releaseNote(note: Note, at: number, over: number) {
  note.env.gain.cancelAndHoldAtTime(at);
  note.env.gain.linearRampToValueAtTime(0, at + over);

  const end = at + over + 0.05;
  for (const source of note.sources) source.stop(end);

  const context = ctx;
  const wait = context ? Math.max(0, end - context.currentTime) : over;
  setTimeout(() => teardown(note), wait * 1000 + 60);
}

function releaseAll(at: number, over: number) {
  for (const note of notes.values()) releaseNote(note, at, over);
  notes.clear();
}

/**
 * Brings what is sounding into line with what is selected. Notes the two have in
 * common keep sounding and are only re-weighted — changing C to Am holds the C
 * and the E right through, which is what makes a chord change feel like a change
 * rather than a restart.
 *
 * `rebuild` forces the whole chord to cross-fade instead. Anything that alters
 * every frequency or every timbre at once needs it: a new voice, or a new root
 * in just intonation, where every ratio is measured from that root.
 */
function applyPitches(rebuild: boolean, attack: number, release: number) {
  const context = ctx;
  if (!context || !running) return;

  const at = context.currentTime + LEAD_IN;
  const count = pitches.length;

  if (rebuild) {
    releaseAll(at, release);
    pitches.forEach((midi, index) => {
      notes.set(midi, buildNote(midi, index, count, at, attack));
    });
    return;
  }

  const wanted = new Set(pitches);
  for (const [midi, note] of notes) {
    if (wanted.has(midi)) continue;
    releaseNote(note, at, release);
    notes.delete(midi);
  }

  pitches.forEach((midi, index) => {
    const held = notes.get(midi);
    if (!held) {
      notes.set(midi, buildNote(midi, index, count, at, attack));
      return;
    }
    // A note that survives is now one of a different number, in a different
    // place in the stack. Slide it to the weight and position it should have.
    held.env.gain.cancelAndHoldAtTime(at);
    held.env.gain.linearRampToValueAtTime(voice.gain * weightFor(index, count), at + REWEIGHT);
    held.panner.pan.setTargetAtTime(panFor(index, count), at, REWEIGHT / 3);
  });
}

async function begin() {
  const context = ensureContext();

  try {
    // Playback and mixing, not record and solo — the drone should sit over a
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

  const out = master;
  if (!out) return;

  const now = context.currentTime;
  out.gain.cancelScheduledValues(now);
  out.gain.setValueAtTime(masterGain(), now);

  const at = now + LEAD_IN;
  const count = pitches.length;
  // Staggered rather than struck together: the chord arrives from the bass up,
  // which is how a hand or a bow would give it to you.
  pitches.forEach((midi, index) => {
    notes.set(midi, buildNote(midi, index, count, at + index * BLOOM_STAGGER, voice.attack));
  });
}

export function start(): void {
  if (running || pitches.length === 0) return;
  running = true;
  emit({ running: true });
  void begin();
}

export function stop(): void {
  if (!running) return;
  running = false;

  if (ctx) releaseAll(ctx.currentTime + LEAD_IN, voice.release);
  emit({ running: false });
}

export function toggle(): void {
  if (running) stop();
  else start();
}

/**
 * The pitches to hold, and the one just intonation measures from. Both move
 * together — a chord and the root its ratios are built on cannot disagree, even
 * for a frame.
 */
export function setPitches(given: number[], root: number): void {
  // One note per pitch is an invariant, not a convenience: `notes` is keyed by
  // pitch, and a repeat would overwrite its own entry and leave an oscillator
  // running that nothing can reach to stop.
  const next = given.length > 1 ? [...new Set(given)] : given;

  const sameNotes =
    next.length === pitches.length && next.every((midi, index) => midi === pitches[index]);
  const sameRoot = root === rootMidi;
  if (sameNotes && sameRoot) return;

  // Just intonation puts every frequency in the chord in terms of the root, so a
  // new root means every note is retuned even where the pitch itself survives.
  const retuned = intonation === 'just' && !sameRoot;

  pitches = next;
  rootMidi = root;
  emit({ pitches: next });

  if (next.length === 0) {
    if (running) stop();
    return;
  }
  applyPitches(retuned, SWAP_ATTACK, SWAP_RELEASE);
}

export function setVoiceId(id: string): void {
  const next = voiceById(id);
  if (next.id === voice.id) return;
  voice = next;
  emit({ voiceId: voice.id });
  applyPitches(true, SWAP_ATTACK, SWAP_RELEASE);
}

export function setIntonation(mode: Intonation): void {
  if (mode === intonation) return;
  intonation = mode;
  emit({ intonation: mode });
  applyPitches(true, SWAP_ATTACK, SWAP_RELEASE);
}

export function setLevel(next: number): void {
  const value = Math.max(0, Math.min(1, next));
  if (value === level) return;
  level = value;
  emit({ level: value });

  if (ctx && master) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(masterGain(), now, 0.03);
  }
}

/** Stops and hands the audio session back. Called when the screen goes away. */
export function release(): void {
  stop();
  void AudioManager.setAudioSessionActivity(false).catch(() => {});
}
