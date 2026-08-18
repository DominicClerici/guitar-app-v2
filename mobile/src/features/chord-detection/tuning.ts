// Neck geometry moved down into @/lib/theory, where the tuning constants already
// lived and where the voicing generator can reach it too. Re-exported here so
// the detector's components keep importing their neck from one place.
export { FRET_COUNT, pitchClassAt, STRING_COUNT } from '@/lib/theory';
