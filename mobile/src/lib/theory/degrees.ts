// Degree labels — the vocabulary chords are written in.
//
// A degree label carries more information than a semitone count: `#9` and `m3`
// are both three semitones above the root but spell D# and Eb over C, and `b5`
// and `#11` are both six but spell Gb and F#. Chord formulas are therefore
// written as degree labels, and semitones are derived from them here. Going the
// other way loses the spelling.
//
// The labels are the ones getNotesFromIntervals already understands. Two are
// easy to misread: `7` is the minor/dominant seventh (Bb over C) and `dim7` is
// the diminished seventh (Bbb over C).

export type Degree =
  | '1'
  | 'b9'
  | 'sus2'
  | '9'
  | '#9'
  | 'm3'
  | '3'
  | 'sus4'
  | '11'
  | 'b5'
  | '#11'
  | '5'
  | '#5'
  | 'b13'
  | '6'
  | '13'
  | 'dim7'
  | '7'
  | 'maj7';

export const DEGREE_SEMITONES: Record<Degree, number> = {
  '1': 0,
  b9: 1,
  sus2: 2,
  '9': 2,
  '#9': 3,
  m3: 3,
  '3': 4,
  sus4: 5,
  '11': 5,
  b5: 6,
  '#11': 6,
  '5': 7,
  '#5': 8,
  b13: 8,
  '6': 9,
  '13': 9,
  dim7: 9,
  '7': 10,
  maj7: 11,
};

// The degrees a UI should colour as tensions rather than chord tones.
export const ALTERED_DEGREES: ReadonlySet<Degree> = new Set<Degree>([
  'b5',
  '#5',
  'b9',
  '#9',
  '#11',
  'b13',
]);

/** Semitones above the root, 0–11. */
export function degreeSemitones(degree: Degree): number {
  return DEGREE_SEMITONES[degree];
}
