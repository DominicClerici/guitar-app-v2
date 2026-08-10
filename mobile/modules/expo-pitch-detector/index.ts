import { EventEmitter, requireOptionalNativeModule } from 'expo';

export type PitchEvent = {
  frequency: number;
  clarity: number;
  rms: number;
  timestamp: number;
};

type PitchDetectorModule = {
  start(opts?: { sampleRate?: number }): Promise<void>;
  stop(): Promise<void>;
};

const Native = requireOptionalNativeModule<PitchDetectorModule>('ExpoPitchDetector');

/** False on web and in any build where the native module was not linked. */
export const isAvailable = Native !== null;

export const PitchEvents = Native
  ? new EventEmitter<{ onPitch: (e: PitchEvent) => void }>(Native as any)
  : new EventEmitter<{ onPitch: (e: PitchEvent) => void }>();

export const start = async (opts?: { sampleRate?: number }) => {
  if (!Native) throw new Error('ExpoPitchDetector is unavailable on this platform');
  await Native.start(opts);
};

export const stop = async () => {
  if (!Native) return;
  await Native.stop();
};
