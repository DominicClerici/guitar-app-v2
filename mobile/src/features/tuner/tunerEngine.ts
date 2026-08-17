import { makeMutable } from 'react-native-reanimated';

import {
  getStatus as getMicStatus,
  subscribeRawFrames,
  subscribeStatus,
  type MicStatus,
  type PitchEvent,
} from '@/lib/mic';

import { type NoteInfo } from './freqToNote';
import { TunerGate } from './tunerGate';

const TEXT_THROTTLE_MS = 100;

/**
 * The native tick period, mirrored from the module's own timer. Anything downstream that
 * measures in frames rather than milliseconds — the seismograph's scroll rate — derives
 * its own constants from this, so changing the native cadence rescales those instead of
 * silently changing what they display.
 */
export const FRAME_PERIOD_MS = 15;

// The mic session is owned by `@/lib/mic`; the tuner is one of its readers. Leasing it
// is still done through here so consumers of this feature never have to know that.
export { acquire, release } from '@/lib/mic';

export type TunerStatus = MicStatus;

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
// Ticks once per native frame (FRAME_PERIOD_MS). The seismograph advances off this rather
// than off `centsSV`, so it keeps scrolling through a silence that holds cents at 0.
export const frameSV = makeMutable(0);

/**
 * One gated reading, delivered at the native frame rate (FRAME_PERIOD_MS) rather than at
 * the snapshot's 100ms throttle. `frequency` is the raw detected pitch after the octave
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

// Constructed bare on purpose: the gate's own DEFAULTS are the single source of truth for
// the filter constants. Passing them from here shadowed them silently — an `emaAlpha`
// edited in TunerGate had no effect while this file re-supplied the old value.
const gate = new TunerGate();
const listeners = new Set<() => void>();
const frameListeners = new Set<(frame: TunerFrame) => void>();

let lastTextAt = 0;

let snapshot: TunerSnapshot = {
  status: getMicStatus(),
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

function clearReadout() {
  centsSV.value = 0;
  claritySV.value = 0;
  rmsSV.value = 0;
  presenceSV.value = 0;
  gate.reset();
  lastTextAt = 0;
  emit({ note: null, frequency: 0 });
}

subscribeRawFrames((e: PitchEvent) => {
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

let lastStatus: TunerStatus = snapshot.status;

subscribeStatus(() => {
  const next = getMicStatus();
  const wasListening = lastStatus === 'listening';
  lastStatus = next;
  // The readout has to go down with the session — left up, a held note would read as
  // though it were still being heard. Cleared before the status lands so a subscriber
  // never observes 'idle' next to a live note.
  if (wasListening && next !== 'listening') clearReadout();
  if (snapshot.status !== next) emit({ status: next });
});
