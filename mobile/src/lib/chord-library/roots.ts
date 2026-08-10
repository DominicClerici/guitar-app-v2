import type { RootName } from './types';

/**
 * Every root the library offers, in chromatic order with the enharmonic pairs
 * adjacent. These are exactly the keys of the mixolydian skeleton, which is
 * what bounds the set: a root outside it has no spelling table.
 */
export const ROOTS: readonly RootName[] = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
];

/**
 * The other way to spell the same pitch, where the library offers one. The
 * naturals have no partner here — B# and Cb are real spellings but no chord in
 * this catalogue is better off rooted on them.
 */
const ENHARMONIC_ROOTS: Partial<Record<RootName, RootName>> = {
  'C#': 'Db',
  Db: 'C#',
  'D#': 'Eb',
  Eb: 'D#',
  'F#': 'Gb',
  Gb: 'F#',
  'G#': 'Ab',
  Ab: 'G#',
  'A#': 'Bb',
  Bb: 'A#',
};

export function enharmonicRoot(root: RootName): RootName | undefined {
  return ENHARMONIC_ROOTS[root];
}

const ROOT_SET = new Set<string>(ROOTS);

export function isRootName(value: string): value is RootName {
  return ROOT_SET.has(value);
}
