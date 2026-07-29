import { notesFlat, notesSharp, OPEN_PITCHES } from '@/lib/theory';

export const STRING_COUNT = 6;
export const FRET_COUNT = 15; // playable frets beyond the nut

/** Pitch class (0–11, C = 0) sounding at a position. String 0 = high e, 5 = low E; fret 0 = open. */
export function pitchClassAt(string: number, fret: number): number {
  return (OPEN_PITCHES[string] + fret) % 12;
}

/**
 * Neutral chromatic spelling, used as a fallback before a chord reading exists.
 * With no chord context a black key is a genuine sharp/flat choice.
 */
export function chromaticName(pitchClass: number, preference: 'sharp' | 'flat'): string {
  return preference === 'flat' ? notesFlat[pitchClass] : notesSharp[pitchClass];
}
