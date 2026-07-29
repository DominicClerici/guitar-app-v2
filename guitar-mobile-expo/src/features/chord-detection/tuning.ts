import { notesFlat, notesSharp } from '@/lib/theory';

// Neck geometry moved down into @/lib/theory, where the tuning constants already
// lived and where the voicing generator can reach it too. Re-exported here so
// the detector's components keep importing their neck from one place.
export { FRET_COUNT, pitchClassAt, STRING_COUNT } from '@/lib/theory';

/**
 * Neutral chromatic spelling, used as a fallback before a chord reading exists.
 * With no chord context a black key is a genuine sharp/flat choice.
 */
export function chromaticName(pitchClass: number, preference: 'sharp' | 'flat'): string {
  return preference === 'flat' ? notesFlat[pitchClass] : notesSharp[pitchClass];
}
