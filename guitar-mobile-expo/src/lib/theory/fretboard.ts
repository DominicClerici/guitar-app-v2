// Where a note lives on a six-string neck in standard tuning.
//
// String indices run 0 = high e … 5 = low E throughout the app. Chord charts are
// written the other way round, low E first, so anything that *prints* a voicing
// reverses at the display boundary — see voicingChart and ChordDiagram. Nothing
// upstream of those should.

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
