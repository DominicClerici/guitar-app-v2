/**
 * The accessibility settings the device itself holds, as a preference default can read them.
 *
 * Only Reduce Motion is here, because only Reduce Motion is actually askable: iOS publishes it
 * through `AccessibilityInfo` and nothing else on this list. There is no public reading of whether
 * a phone is set to play haptics — which is why the haptics preference simply starts on, rather
 * than pretending to follow a device setting it cannot see.
 */
import { useSyncExternalStore } from 'react';
import { AccessibilityInfo } from 'react-native';

const listeners = new Set<() => void>();

let enabled = false;
let watching = false;

function publish(next: boolean): void {
  if (next === enabled) return;

  enabled = next;
  for (const listener of listeners) listener();
}

/**
 * One OS subscription for the whole app, kept for the whole run.
 *
 * It is never torn down: this answers a question about the device rather than about any screen, so
 * the last component to unmount is not a reason to stop knowing it — and the first read is
 * asynchronous, so dropping the listener would mean paying for that read again on the next mount
 * and showing one frame of the wrong answer each time.
 */
function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  if (!watching) {
    watching = true;
    AccessibilityInfo.addEventListener('reduceMotionChanged', publish);
    void AccessibilityInfo.isReduceMotionEnabled().then(publish);
  }

  return () => {
    listeners.delete(listener);
  };
}

function read(): boolean {
  return enabled;
}

/** Whether the device is set to reduce motion. False until the first read comes back. */
export function useSystemReduceMotion(): boolean {
  return useSyncExternalStore(subscribe, read, read);
}
