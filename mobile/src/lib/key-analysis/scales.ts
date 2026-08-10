import type { DegreeSlot, Mode, Quality } from './types';

export const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11] as const;
export const NATURAL_MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10] as const;

// Minor tolerates the raised 6th and 7th (melodic/harmonic minor), so a V7 or a
// IV in a minor key isn't scored as evidence against it.
export function toleranceSet(mode: Mode): Set<number> {
  return mode === 'major' ? new Set(MAJOR_SCALE) : new Set([...NATURAL_MINOR_SCALE, 9, 11]);
}

export const MAJOR_DEGREE_MAP: readonly DegreeSlot[] = [
  { degree: 1, accidental: '' },
  { degree: 2, accidental: '♭' },
  { degree: 2, accidental: '' },
  { degree: 3, accidental: '♭' },
  { degree: 3, accidental: '' },
  { degree: 4, accidental: '' },
  { degree: 4, accidental: '♯' },
  { degree: 5, accidental: '' },
  { degree: 6, accidental: '♭' },
  { degree: 6, accidental: '' },
  { degree: 7, accidental: '♭' },
  { degree: 7, accidental: '' },
];

export const MINOR_DEGREE_MAP: readonly DegreeSlot[] = [
  { degree: 1, accidental: '' },
  { degree: 2, accidental: '♭' },
  { degree: 2, accidental: '' },
  { degree: 3, accidental: '' },
  { degree: 3, accidental: '♯' },
  { degree: 4, accidental: '' },
  { degree: 4, accidental: '♯' },
  { degree: 5, accidental: '' },
  { degree: 6, accidental: '' },
  { degree: 6, accidental: '♯' },
  { degree: 7, accidental: '' },
  { degree: 7, accidental: '' },
];

export function degreeMap(mode: Mode): readonly DegreeSlot[] {
  return mode === 'major' ? MAJOR_DEGREE_MAP : MINOR_DEGREE_MAP;
}

export const MAJOR_DEGREE_QUALITIES: readonly ReadonlySet<Quality>[] = [
  new Set<Quality>(['maj', 'maj7']),
  new Set<Quality>(['min', 'min7']),
  new Set<Quality>(['min', 'min7']),
  new Set<Quality>(['maj', 'maj7']),
  new Set<Quality>(['maj', 'dom7']),
  new Set<Quality>(['min', 'min7']),
  new Set<Quality>(['dim', 'min7b5']),
];

export const MINOR_DEGREE_QUALITIES: readonly ReadonlySet<Quality>[] = [
  new Set<Quality>(['min', 'min7', 'minMaj7']),
  new Set<Quality>(['dim', 'min7b5']),
  new Set<Quality>(['maj', 'maj7']),
  new Set<Quality>(['min', 'min7']),
  new Set<Quality>(['min', 'min7', 'maj', 'dom7']),
  new Set<Quality>(['maj', 'maj7']),
  // Degree 7 here is the *subtonic* only — see MINOR_LEADING_TONE_QUALITIES.
  new Set<Quality>(['maj', 'dom7']),
];

export function degreeQualities(mode: Mode): readonly ReadonlySet<Quality>[] {
  return mode === 'major' ? MAJOR_DEGREE_QUALITIES : MINOR_DEGREE_QUALITIES;
}

// A minor key has two chords on scale degree 7 and only one row in the table
// above to hold them: the subtonic a whole step below the tonic (VII, from
// natural minor) and the leading tone a half step below it (vii°, from
// harmonic minor). Both are conventionally written without an accidental —
// the quality is what tells them apart — so indexing expectations by degree
// merged the two, and a major triad on the leading tone passed as the
// subtonic's VII: fully diatonic, full chord-fit reward, no borrowed marker.
//
// Split by offset instead. A *major* triad a half step below the tonic belongs
// to neither minor scale, and is the one chord at this offset that has to be
// spelled ♯VII.
const MINOR_LEADING_TONE_OFFSET = 11;
const MINOR_LEADING_TONE_QUALITIES = new Set<Quality>(['dim', 'dim7', 'min7b5']);

// No third, so no mode to contradict. On a diatonic root these chords agree
// with the key whatever quality the degree expects.
export const THIRDLESS_QUALITIES = new Set<Quality>(['sus', 'power']);

export interface KeySlot {
  degree: number;
  accidental: '' | '♭' | '♯';
  /** Qualities that read as diatonic here; null when the root itself is not. */
  expected: ReadonlySet<Quality> | null;
}

/**
 * Where a chord sits in a key: its scale degree, how that degree is spelled,
 * and what it would have to be to count as diatonic. Takes the quality because
 * minor's degree 7 is spelled from it (VII / vii° / ♯VII).
 */
export function slotFor(mode: Mode, offset: number, quality: Quality): KeySlot {
  const { degree, accidental } = degreeMap(mode)[offset];

  if (mode === 'minor' && offset === MINOR_LEADING_TONE_OFFSET) {
    return MINOR_LEADING_TONE_QUALITIES.has(quality)
      ? { degree, accidental: '', expected: MINOR_LEADING_TONE_QUALITIES }
      : { degree, accidental: '♯', expected: null };
  }

  return {
    degree,
    accidental,
    expected: accidental === '' ? degreeQualities(mode)[degree - 1] : null,
  };
}

// Chromatic roots common enough to be idiomatic rather than evidence against the
// key: ♭III / ♭VI / ♭VII in major (modal mixture), the ♯IV of a minor Dorian
// inflection.
export const MAJOR_BORROWED_OFFSETS = new Set([3, 8, 10]);
export const MINOR_BORROWED_OFFSETS = new Set([6]);

// Krumhansl–Schmuckler key profiles: the perceived stability of each scale
// degree, measured in probe-tone experiments. Correlating a progression's
// pitch-class histogram against these is what separates a key from its relative
// (both share a scale; they weight its notes differently).
export const KS_MAJOR_PROFILE = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
] as const;
export const KS_MINOR_PROFILE = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
] as const;

export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;
