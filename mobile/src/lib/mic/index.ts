/**
 * Ownership of the one native microphone session.
 *
 * The tuner, the intonation checker and anything else that listens are all consumers of
 * this — none of them owns the session, because two owners calling the native `start()`
 * would fight over it (it is idempotent by tearing down first, so the second caller
 * would silently stop the first).
 */
export {
  acquire,
  getStatus,
  isAvailable,
  release,
  subscribeStatus,
  type MicStatus,
} from './session';

export { configureOnsets, subscribeOnsets, subscribeRawFrames } from './events';

export type { OnsetConfig, OnsetEvent, PitchEvent } from '@modules/expo-pitch-detector';
