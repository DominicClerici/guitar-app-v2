import {
  configureOnsets as nativeConfigureOnsets,
  isAvailable,
  OnsetEvents,
  PitchEvents,
  type OnsetConfig,
  type OnsetEvent,
  type PitchEvent,
} from '@modules/expo-pitch-detector';

import { isRunning } from './session';

const frameListeners = new Set<(e: PitchEvent) => void>();
const onsetListeners = new Set<(e: OnsetEvent) => void>();

/**
 * Every raw native pitch frame, ungated. One native stream fanned out to however many
 * features are listening — the tuner's gate, a measurement, a drill — so that none of
 * them has to own the subscription and none can shut it off for the others.
 */
export function subscribeRawFrames(listener: (e: PitchEvent) => void): () => void {
  frameListeners.add(listener);
  return () => {
    frameListeners.delete(listener);
  };
}

export function subscribeOnsets(listener: (e: OnsetEvent) => void): () => void {
  onsetListeners.add(listener);
  return () => {
    onsetListeners.delete(listener);
  };
}

/**
 * Onset detection is off by default and costs nothing while it is. Whoever turns it on
 * owns turning it back off — it is global state on the native side, not per-subscriber.
 */
export function configureOnsets(config: OnsetConfig): Promise<void> {
  return nativeConfigureOnsets(config);
}

// Attached once at module load rather than per subscriber: the native emitter is a
// single process-wide stream, and a subscription per listener would make delivery order
// depend on mount order.
if (isAvailable) {
  PitchEvents.addListener('onPitch', (e: PitchEvent) => {
    // Frames can drain in after stop(); this listener outlives a listening session.
    if (!isRunning()) return;
    frameListeners.forEach((l) => l(e));
  });

  OnsetEvents.addListener('onOnset', (e: OnsetEvent) => {
    if (!isRunning()) return;
    onsetListeners.forEach((l) => l(e));
  });
}
