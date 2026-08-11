import { EventEmitter, requireOptionalNativeModule } from 'expo';

export type PitchEvent = {
  frequency: number;
  clarity: number;
  rms: number;
  timestamp: number;
};

export type OnsetEvent = {
  /**
   * Epoch ms of the onset itself, derived from the sample index rather than from
   * when the event was delivered. Delivery may be up to a tick late; this number
   * must not be.
   */
  at: number;
  /** Peak short-window RMS of the transient. */
  peak: number;
};

export type OnsetConfig = {
  enabled: boolean;
  /** Short-window RMS the envelope must cross for an onset to open. */
  threshold: number;
  /** Minimum gap between successive onsets, ms. */
  refractoryMs: number;
};

type PitchDetectorModule = {
  start(opts?: { sampleRate?: number }): Promise<void>;
  stop(): Promise<void>;
  configureOnsets(config: OnsetConfig): Promise<void>;
};

const Native = requireOptionalNativeModule<PitchDetectorModule>('ExpoPitchDetector');

/** False on web and in any build where the native module was not linked. */
export const isAvailable = Native !== null;

export const PitchEvents = Native
  ? new EventEmitter<{ onPitch: (e: PitchEvent) => void }>(Native as any)
  : new EventEmitter<{ onPitch: (e: PitchEvent) => void }>();

export const OnsetEvents = Native
  ? new EventEmitter<{ onOnset: (e: OnsetEvent) => void }>(Native as any)
  : new EventEmitter<{ onOnset: (e: OnsetEvent) => void }>();

export const start = async (opts?: { sampleRate?: number }) => {
  if (!Native) throw new Error('ExpoPitchDetector is unavailable on this platform');
  await Native.start(opts);
};

export const stop = async () => {
  if (!Native) return;
  await Native.stop();
};

/**
 * Detection state lives outside the capture session, so this is valid before `start`,
 * while running, and after `stop`. Onsets are off until something asks for them: the
 * detector short-circuits when disabled, so the tuner path pays nothing for it.
 */
export const configureOnsets = async (config: OnsetConfig) => {
  if (!Native) return;
  await Native.configureOnsets(config);
};
