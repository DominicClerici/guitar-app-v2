// Shared music-theory core: the chromatic tables, the note-name ↔ pitch-class
// maps, the degree vocabulary, and the one function that decides whether a
// pitch class is spelled F# or Gb.
//
// Two modules build on this and point in opposite directions:
//   chord-analysis — notes on a fretboard → chord names (the decoder)
//   chord-library  — a chord identity → its tones (the encoder)
//
// Keeping the spelling logic here means both tools agree that Gb7 is
// Gb Bb Db Fb. Pure string/number math — no React, no native modules.

export {
  mixolydian,
  notesEnhFlat,
  notesEnhSharp,
  notesFlat,
  notesSharp,
  OPEN_PITCHES,
  OPEN_PITCHES_MIDI,
} from './constants';
export { ALTERED_DEGREES, DEGREE_SEMITONES, degreeSemitones, type Degree } from './degrees';
export { FRET_COUNT, midiAt, pitchClassAt, STRING_COUNT } from './fretboard';
export { getHalfSteps, noteToSemitone } from './half-steps';
export {
  DOUBLE_INLAY_FRET,
  SINGLE_INLAY_FRETS,
  STRING_GAUGE_CLASS,
  STRING_LABELS,
  stringIndexFromWire,
  wireStringFromIndex,
} from './neck';
export { getNotesFromIntervals } from './notes-from-intervals';
