// Chromatic note tables and the mixolydian spelling skeleton.
// Indices and order are load-bearing: downstream code reads these arrays
// positionally (pitch class 0 = C). Do not reorder or dedupe.

export const notesFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export const notesSharp = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export const notesEnhFlat = [
  'Dbb',
  'Db',
  'Ebb',
  'Fbb',
  'Fb',
  'Gbb',
  'Gb',
  'Abb',
  'Ab',
  'Bbb',
  'Cbb',
  'Cb',
] as const;

export const notesEnhSharp = [
  'B#',
  'B##',
  'C##',
  'D#',
  'D##',
  'E#',
  'E##',
  'F##',
  'G#',
  'G##',
  'A#',
  'A##',
] as const;

export const mixolydian: Record<string, readonly string[]> = {
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
  'C#': ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B'],
  Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'Cb'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C'],
  'D#': ['D#', 'E#', 'F##', 'G#', 'A#', 'B#', 'C#'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'Db'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'Eb'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E'],
  Gb: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'Fb'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F'],
  'G#': ['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'F#'],
  Ab: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'Gb'],
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G'],
  'A#': ['A#', 'B#', 'C##', 'D#', 'E#', 'F##', 'G#'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'Ab'],
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A'],
};

// String-index-to-pitch-class for OPEN strings of standard tuning, where
// fretboard convention is string 5 = low E and string 0 = high e.
// Indices: 0 = high e, 1 = B, 2 = G, 3 = D, 4 = A, 5 = low E.
export const OPEN_PITCHES = [4, 11, 7, 2, 9, 4] as const;

// Same string ordering, but as MIDI pitches at fret 0 (low E2 = MIDI 40).
export const OPEN_PITCHES_MIDI = [64, 59, 55, 50, 45, 40] as const;
