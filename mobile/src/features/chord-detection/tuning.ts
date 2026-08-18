// Neck geometry moved down into @/lib/theory, where it can be shared with the app's other boards
// and with the voicing generator. Re-exported here so the detector's components keep importing
// their neck from one place.
//
// What a fret *sounds* is no longer here, and no longer a constant: it depends on how the user has
// their guitar tuned, so it is read per board from `useTuning` and resolved through
// `soundingPitchClass` (`@/lib/tuning`).
export { FRET_COUNT, STRING_COUNT } from '@/lib/theory';
