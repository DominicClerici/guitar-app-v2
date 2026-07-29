import { AppState } from 'react-native';
import { makeMutable } from 'react-native-reanimated';

import {
  isAvailable,
  PitchEvents,
  start as nativeStart,
  stop as nativeStop,
  type PitchEvent,
} from '@modules/expo-pitch-detector';

import { type NoteInfo } from './freqToNote';
import { TunerGate } from './tunerGate';

const TEXT_THROTTLE_MS = 100;
const HOLD_MS = 300;
const EMA_ALPHA = 0.4;

export type TunerStatus = 'idle' | 'starting' | 'listening' | 'denied' | 'unavailable';

export type TunerSnapshot = {
  status: TunerStatus;
  note: NoteInfo | null;
  frequency: number;
};

// Per-frame values live on the UI thread so the needle and the seismograph animate
// without touching React. Module-scoped rather than per-hook: one mic, one stream, so
// every consumer reads the same values.
export const centsSV = makeMutable(0);
export const claritySV = makeMutable(0);
export const rmsSV = makeMutable(0);
// 1 while a note is being read, 0 during silence. Distinguishes "dead on" from
// "nothing there" — both of which leave `centsSV` at 0.
export const presenceSV = makeMutable(0);
// Ticks once per native frame (~30ms). The seismograph advances off this rather than
// off `centsSV`, so it keeps scrolling through a silence that holds cents at 0.
export const frameSV = makeMutable(0);

/**
 * One gated reading, delivered at the native frame rate (~30ms) rather than at the
 * snapshot's 100ms throttle. `frequency` is the raw detected pitch after the octave
 * guard — what a measurement should average, as opposed to `note.cents`, which is
 * smoothed for the display.
 */
export type TunerFrame = {
  frequency: number;
  clarity: number;
  rms: number;
  note: NoteInfo | null;
  timestamp: number;
};

const gate = new TunerGate({ holdMs: HOLD_MS, emaAlpha: EMA_ALPHA });
const listeners = new Set<() => void>();
const frameListeners = new Set<(frame: TunerFrame) => void>();

// `leases` is the desired state: how many mounted consumers want the mic on. `running`
// is the actual native state. Everything funnels through reconcile(), which drives one
// toward the other — so overlapping acquire/release calls can never leave the native
// session out of sync with what the UI is showing.
let leases = 0;
let running = false;
let suspended = false;
let denied = false;
let lastTextAt = 0;

let snapshot: TunerSnapshot = {
  status: isAvailable ? 'idle' : 'unavailable',
  note: null,
  frequency: 0,
};

export function getSnapshot(): TunerSnapshot {
  return snapshot;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Every gated frame, unthrottled. For consumers that measure rather than display —
 * the intonation checker averages a three-second window and needs all of it.
 */
export function subscribeFrames(listener: (frame: TunerFrame) => void): () => void {
  frameListeners.add(listener);
  return () => {
    frameListeners.delete(listener);
  };
}

function emit(next: Partial<TunerSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((l) => l());
}

function setStatus(status: TunerStatus) {
  if (snapshot.status !== status) emit({ status });
}

function clearReadout() {
  centsSV.value = 0;
  claritySV.value = 0;
  rmsSV.value = 0;
  presenceSV.value = 0;
  gate.reset();
  lastTextAt = 0;
  emit({ note: null, frequency: 0 });
}

if (isAvailable) {
  PitchEvents.addListener('onPitch', (e: PitchEvent) => {
    // Frames can drain in after stop(); the listener outlives a listening session.
    if (!running) return;

    const out = gate.push(e);
    rmsSV.value = out.rms;
    claritySV.value = out.clarity;
    centsSV.value = out.cents;
    presenceSV.value = out.note === null ? 0 : 1;
    frameSV.value += 1;

    if (frameListeners.size > 0) {
      const frame: TunerFrame = {
        frequency: out.frequency,
        clarity: out.clarity,
        rms: out.rms,
        note: out.note,
        timestamp: e.timestamp,
      };
      frameListeners.forEach((l) => l(frame));
    }

    if (out.note === null) {
      lastTextAt = 0;
      if (snapshot.note !== null) emit({ note: null, frequency: 0 });
    } else if (e.timestamp - lastTextAt >= TEXT_THROTTLE_MS) {
      lastTextAt = e.timestamp;
      emit({ note: out.note, frequency: out.frequency });
    }
  });
}

// Serializes reconcile() so a release landing mid-start can't interleave with it.
let queue: Promise<void> = Promise.resolve();

function enqueue(): Promise<void> {
  queue = queue.then(reconcile, reconcile);
  return queue;
}

async function reconcile(): Promise<void> {
  const want = isAvailable && leases > 0 && !suspended;
  if (want === running) {
    if (!want) setStatus(denied ? 'denied' : leases > 0 ? 'starting' : 'idle');
    return;
  }

  if (want) {
    setStatus('starting');
    try {
      await nativeStart();
      denied = false;
      running = true;
      setStatus('listening');
    } catch {
      // The only way start() rejects is a refused mic permission, and that can only
      // happen on the 0 -> 1 transition (a granted process never gets refused later).
      // Drop the lease that triggered it so the next tap is a fresh attempt.
      running = false;
      denied = true;
      leases = Math.max(0, leases - 1);
      setStatus('denied');
    }
    return;
  }

  running = false;
  await nativeStop().catch(() => {
    // Best-effort teardown: a failed stop must not wedge the queue.
  });
  clearReadout();
  setStatus(denied ? 'denied' : leases > 0 ? 'starting' : 'idle');
}

/**
 * Register interest in a live mic session. The native session starts on the first
 * lease and stops when the last one is released. Resolves with the resulting status,
 * so a caller can tell whether it actually holds a lease (`denied` means it does not).
 */
export async function acquire(): Promise<TunerStatus> {
  if (!isAvailable) return 'unavailable';
  denied = false;
  leases += 1;
  await enqueue();
  return snapshot.status;
}

export function release(): void {
  if (!isAvailable) return;
  leases = Math.max(0, leases - 1);
  void enqueue();
}

// Releasing the mic on background is not optional: iOS keeps the recording indicator
// lit and holds the audio session otherwise. Leases survive, so returning to the app
// brings the tuner straight back up.
AppState.addEventListener('change', (state) => {
  const next = state === 'background';
  if (next === suspended) return;
  suspended = next;
  void enqueue();
});
