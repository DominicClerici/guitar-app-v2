import * as Haptics from 'expo-haptics';
import { AudioContext, AudioManager, type GainNode } from 'react-native-audio-api';
import { makeMutable } from 'react-native-reanimated';

import { DEFAULT_VOICE, renderClick, VOICES, type ClickVoice } from './clickVoices';
import {
  clampBpm,
  DEFAULT_BEATS,
  DEFAULT_BPM,
  defaultPattern,
  SUBDIVISIONS,
  type BeatAccent,
} from './patterns';

/**
 * How far ahead of the audio clock clicks are committed. Everything inside this
 * window is already on the audio thread, so a JS stall shorter than it is inaudible.
 * The cost of a longer window is only how stale a tempo change can be.
 */
const LOOKAHEAD = 0.12;
/** Scheduler and display cadence. One timer does both jobs. */
const TICK_MS = 16;
/** Gap between pressing play and the downbeat — room to schedule it rather than chase it. */
const LEAD_IN = 0.06;
/** Fade applied on stop, long enough not to pop and short enough to read as immediate. */
const STOP_FADE = 0.01;
/**
 * How far behind the audio clock the grid may fall before it is moved rather than
 * caught up to. Anything longer than this is a stall or a spell in the background,
 * and stepping through the backlog would fire every missed click at once.
 */
const CATCH_UP_LIMIT = 0.25;

export interface MetronomeSnapshot {
  running: boolean;
  bpm: number;
  pattern: BeatAccent[];
  /** Clicks per beat. 1 is the beat alone. */
  perBeat: number;
  voiceId: string;
  haptics: boolean;
}

// The beat currently sounding, or -1 when stopped. Read on the UI thread so the bar
// animates without a React render per beat.
export const beatSV = makeMutable(-1);
// Ticks once per beat. The pip flash restarts off this rather than off `beatSV`,
// which does not change on a one-beat bar.
export const tickSV = makeMutable(0);

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

let running = false;
let bpm = DEFAULT_BPM;
let pattern: BeatAccent[] = defaultPattern(DEFAULT_BEATS);
let perBeat = SUBDIVISIONS[0].perBeat;
let voice: ClickVoice = DEFAULT_VOICE;
let haptics = true;

// The grid, as a segment: `anchorTime` is when step 0 of the segment sounds and
// `stepsScheduled` counts what has been handed to the audio thread since. Positions
// derive from that integer rather than accumulating, so a segment cannot drift; a
// tempo change starts a fresh segment at the first step it is still free to move.
let anchorTime = 0;
let stepsScheduled = 0;
let nextBeat = 0;
let nextSub = 0;

interface PendingBeat {
  beat: number;
  time: number;
  accent: BeatAccent;
}

// Beats already committed to the audio thread but not yet heard.
let queue: PendingBeat[] = [];

const listeners = new Set<() => void>();

let snapshot: MetronomeSnapshot = {
  running: false,
  bpm,
  pattern,
  perBeat,
  voiceId: voice.id,
  haptics,
};

export function getSnapshot(): MetronomeSnapshot {
  return snapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(next: Partial<MetronomeSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
}

function stepDuration(): number {
  return 60 / bpm / perBeat;
}

function nextStepTime(): number {
  return anchorTime + stepsScheduled * stepDuration();
}

/**
 * Starts a new segment at the earliest step still free to move. Call before changing
 * anything that alters the spacing of the grid: what is already scheduled keeps the
 * old tempo, and the new one takes over from the next click — no restart, no drift,
 * and no beat landing twice.
 */
function rebase() {
  if (!running) return;
  anchorTime = nextStepTime();
  stepsScheduled = 0;
}

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  return ctx;
}

function pump() {
  const context = ctx;
  const out = master;
  if (!context || !out || !running) return;

  const now = context.currentTime;
  const step = stepDuration();

  if (now - nextStepTime() > CATCH_UP_LIMIT) {
    anchorTime = now;
    stepsScheduled = 0;
    // Resume on a beat rather than partway through one.
    nextSub = 0;
    queue = [];
  }

  while (anchorTime + stepsScheduled * step < now + LOOKAHEAD) {
    const time = anchorTime + stepsScheduled * step;
    const accent = pattern[nextBeat] ?? 'normal';
    const onBeat = nextSub === 0;

    if (accent !== 'silent') {
      const role = onBeat ? (accent === 'accent' ? 'accent' : 'beat') : 'subdivision';
      renderClick(context, out, voice.tones[role], time);
    }
    // A muted beat still moves the display: the bar has to stay readable through
    // the gap, which is the whole point of muting one.
    if (onBeat) queue.push({ beat: nextBeat, time, accent });

    stepsScheduled += 1;
    nextSub += 1;
    if (nextSub >= perBeat) {
      nextSub = 0;
      nextBeat = (nextBeat + 1) % pattern.length;
    }
  }

  drain(now);
}

/**
 * Advances the display to whatever has actually been heard. If the JS thread was
 * away long enough to miss beats, the skipped ones are dropped rather than replayed —
 * a burst of four haptics at once is worse than a missing one.
 */
function drain(now: number) {
  let heard = 0;
  while (heard < queue.length && queue[heard].time <= now) heard += 1;
  if (heard === 0) return;

  const last = queue[heard - 1];
  queue = queue.slice(heard);

  beatSV.value = last.beat;
  tickSV.value = tickSV.value + 1;

  if (haptics && last.accent !== 'silent') {
    void Haptics.impactAsync(
      last.accent === 'accent'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light,
    );
  }
}

async function begin() {
  const context = ensureContext();

  try {
    // Playback rather than record, and mixing rather than solo, so the click sits
    // over a backing track instead of stopping it.
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
  out.gain.setValueAtTime(1, now);

  queue = [];
  stepsScheduled = 0;
  nextBeat = 0;
  nextSub = 0;
  anchorTime = now + LEAD_IN;

  timer = setInterval(pump, TICK_MS);
  pump();
}

export function start(): void {
  if (running) return;
  running = true;
  emit({ running: true });
  void begin();
}

export function stop(): void {
  if (!running) return;
  running = false;

  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  queue = [];
  beatSV.value = -1;

  // Up to a lookahead of clicks are already on the audio thread and cannot be
  // recalled. Fading the master out is what makes stop mean stop.
  if (ctx && master) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + STOP_FADE);
  }

  emit({ running: false });
}

export function toggle(): void {
  if (running) stop();
  else start();
}

export function setBpm(next: number): void {
  const value = clampBpm(next);
  if (value === bpm) return;
  rebase();
  bpm = value;
  emit({ bpm });
}

export function setPattern(next: BeatAccent[]): void {
  pattern = next;
  // Keep the count inside the new bar; the downbeat then falls where it wraps
  // rather than cutting the current beat short.
  if (nextBeat >= pattern.length) nextBeat %= pattern.length;
  emit({ pattern });
}

export function setPerBeat(next: number): void {
  if (next === perBeat) return;
  rebase();
  perBeat = next;
  // The current beat's remaining subdivisions belong to the old grid; start the new
  // one cleanly on the next beat.
  nextSub = 0;
  emit({ perBeat });
}

export function setVoiceId(id: string): void {
  voice = VOICES.find((v) => v.id === id) ?? DEFAULT_VOICE;
  emit({ voiceId: voice.id });
}

export function setHaptics(enabled: boolean): void {
  haptics = enabled;
  emit({ haptics });
}

/** Stops and hands the audio session back. Called when the screen goes away. */
export function release(): void {
  stop();
  void AudioManager.setAudioSessionActivity(false).catch(() => {});
}
