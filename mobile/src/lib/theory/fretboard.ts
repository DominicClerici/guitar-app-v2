// Where a note lives on a six-string neck in standard tuning.
//
// String indices run 0 = high e … 5 = low E throughout the app. Chord charts are
// written the other way round, low E first, so anything that *prints* a voicing
// reverses at the display boundary — see voicingChart and ChordDiagram. Nothing
// upstream of those should.
//
// STANDARD TUNING, AND WHY THAT IS STILL A USEFUL ANSWER.
//
// The user has a tuning of their own, and what a fret *sounds* on it is
// `soundingMidi` / `soundingPitchClass` in @/lib/tuning. These two are the other
// question — what a fret sounds on the neck a lesson was written for — and the
// callers left on them are the ones that mean it: the CAGED windows and the
// triad ladders (both a consequence of standard tuning being all fourths but
// the one G-B major third, per docs/pathways), the article diagrams built on
// them, the progression shapes an author pinned, and the voicing engine's own
// invariant script.
//
// So neither is a fallback for the other, and neither should grow an optional
// tuning argument defaulting to the other's answer. Reach for these when the
// music was authored in standard tuning; reach for @/lib/tuning when the
// question is about the guitar in the user's hands.

import { OPEN_PITCHES, OPEN_PITCHES_MIDI } from './constants';

export const STRING_COUNT = 6;
/** Playable frets beyond the nut. Matches the neck the fretboard UI draws. */
export const FRET_COUNT = 15;

/** Pitch class (0–11, C = 0) sounding at a position. Fret 0 is open. */
export function pitchClassAt(string: number, fret: number): number {
  return (OPEN_PITCHES[string] + fret) % 12;
}

/**
 * MIDI pitch sounding at a position — the register, not just the pitch class.
 * Low E open is 40. Needed wherever two notes have to be compared as sounds
 * rather than as names: a minor ninth low on the neck is mud, the same interval
 * an octave up is a colour.
 */
export function midiAt(string: number, fret: number): number {
  return OPEN_PITCHES_MIDI[string] + fret;
}
