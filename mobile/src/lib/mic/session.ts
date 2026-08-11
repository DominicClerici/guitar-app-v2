import { AppState } from 'react-native';

import {
  isAvailable as nativeIsAvailable,
  start as nativeStart,
  stop as nativeStop,
} from '@modules/expo-pitch-detector';

export type MicStatus = 'idle' | 'starting' | 'listening' | 'denied' | 'unavailable';

/** False on web and in any build where the native module was not linked. */
export const isAvailable = nativeIsAvailable;

// `leases` is the desired state: how many mounted consumers want the mic on. `running`
// is the actual native state. Everything funnels through reconcile(), which drives one
// toward the other — so overlapping acquire/release calls can never leave the native
// session out of sync with what the UI is showing.
let leases = 0;
let running = false;
let suspended = false;
let denied = false;

let status: MicStatus = isAvailable ? 'idle' : 'unavailable';

const listeners = new Set<() => void>();

export function getStatus(): MicStatus {
  return status;
}

export function subscribeStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Whether the native session is up *right now*. Frames can drain in after stop(), and
 * the native listener outlives any one session, so the fan-out gates on this.
 */
export function isRunning(): boolean {
  return running;
}

function setStatus(next: MicStatus) {
  if (status === next) return;
  status = next;
  listeners.forEach((l) => l());
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
  setStatus(denied ? 'denied' : leases > 0 ? 'starting' : 'idle');
}

/**
 * Register interest in a live mic session. The native session starts on the first
 * lease and stops when the last one is released. Resolves with the resulting status,
 * so a caller can tell whether it actually holds a lease (`denied` means it does not).
 */
export async function acquire(): Promise<MicStatus> {
  if (!isAvailable) return 'unavailable';
  denied = false;
  leases += 1;
  await enqueue();
  return status;
}

export function release(): void {
  if (!isAvailable) return;
  leases = Math.max(0, leases - 1);
  void enqueue();
}

// Releasing the mic on background is not optional: iOS keeps the recording indicator
// lit and holds the audio session otherwise. Leases survive, so returning to the app
// brings the session straight back up.
AppState.addEventListener('change', (state) => {
  const next = state === 'background';
  if (next === suspended) return;
  suspended = next;
  void enqueue();
});
