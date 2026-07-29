/** How loud a beat is, and whether it sounds at all. */
export type BeatAccent = 'accent' | 'normal' | 'silent';

export const MIN_BPM = 20;
export const MAX_BPM = 300;
export const DEFAULT_BPM = 100;

export const MIN_BEATS = 1;
export const MAX_BEATS = 12;
export const DEFAULT_BEATS = 4;

export function clampBpm(bpm: number): number {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));
}

export function clampBeats(beats: number): number {
  return Math.min(MAX_BEATS, Math.max(MIN_BEATS, Math.round(beats)));
}

export function defaultPattern(beats: number): BeatAccent[] {
  return Array.from({ length: beats }, (_, i) => (i === 0 ? 'accent' : 'normal'));
}

/**
 * Grows or shrinks a bar to `beats`, keeping every accent the player already set.
 * Going 4 → 7 → 4 gets you back what you had, which matters when the meter control
 * is one stepper away from the accents it renumbers.
 */
export function resizePattern(pattern: BeatAccent[], beats: number): BeatAccent[] {
  if (beats <= pattern.length) return pattern.slice(0, beats);
  const added: BeatAccent[] = Array.from({ length: beats - pattern.length }, () => 'normal');
  return [...pattern, ...added];
}

const CYCLE: BeatAccent[] = ['accent', 'normal', 'silent'];

export function cycleAccent(accent: BeatAccent): BeatAccent {
  return CYCLE[(CYCLE.indexOf(accent) + 1) % CYCLE.length];
}

export interface Subdivision {
  id: string;
  /** Clicks per beat. The beat itself is the first of them. */
  perBeat: number;
  label: string;
}

export const SUBDIVISIONS: Subdivision[] = [
  { id: 'quarter', perBeat: 1, label: 'Quarter notes' },
  { id: 'eighth', perBeat: 2, label: 'Eighth notes' },
  { id: 'triplet', perBeat: 3, label: 'Triplets' },
  { id: 'sixteenth', perBeat: 4, label: 'Sixteenth notes' },
];
