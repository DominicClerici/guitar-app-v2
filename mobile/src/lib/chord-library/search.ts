import { CHORD_TYPES, chordTypeById } from './catalog';
import { isRootName, ROOTS } from './roots';
import type { ChordType, RootName } from './types';

// Punctuation that only ever decorates a symbol: "m7(b5)" and "m7b5" are the
// same chord, as are "6/9" and "69". A hyphen is left alone — "-7" means minor
// seventh, and stripping it would turn it into a dominant.
function strip(value: string): string {
  return value.replace(/[\s()/]/g, '');
}

function normalize(value: string): string {
  return strip(value).toLowerCase();
}

/**
 * Chord types matching a free-text query against name, symbol, id and aliases.
 * Exact matches rank above prefixes, prefixes above substrings, so typing "m7"
 * offers the minor seventh before the half-diminished.
 */
export function findChordTypes(query: string): ChordType[] {
  const needle = normalize(query);
  if (!needle) return [...CHORD_TYPES];

  const scored: { type: ChordType; score: number }[] = [];

  for (const type of CHORD_TYPES) {
    const haystacks = [type.symbol, type.id, type.name, ...type.aliases].map(normalize);

    let best = 0;
    for (const hay of haystacks) {
      if (!hay) continue;
      if (hay === needle) best = Math.max(best, 3);
      else if (hay.startsWith(needle)) best = Math.max(best, 2);
      else if (hay.includes(needle)) best = Math.max(best, 1);
    }

    if (best > 0) scored.push({ type, score: best });
  }

  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.type);
}

/**
 * "Cmaj7" → { root: 'C', type: <major seventh> }. Tries the two-character root
 * first so "C#m" reads as C# minor rather than C with a nonsense suffix.
 * Returns null when either half fails to resolve.
 */
export function parseChordSymbol(input: string): { root: RootName; type: ChordType } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  for (const length of [2, 1]) {
    const candidate = trimmed.slice(0, length);
    if (!isRootName(candidate)) continue;

    const suffix = trimmed.slice(length);
    const type = chordTypeForSuffix(suffix);
    if (type) return { root: candidate, type };
  }

  return null;
}

function chordTypeForSuffix(suffix: string): ChordType | undefined {
  const exact = strip(suffix);

  // An empty suffix is a plain major triad.
  if (!exact) return chordTypeById('maj');

  const names = (type: ChordType) => [type.symbol, type.id, ...type.aliases];

  // Case matters here and nowhere else: "M7" is a major seventh and "m7" is a
  // minor one. Match case-sensitively first so the two can't collide, and only
  // then fall back to a forgiving match for input like "MAJ7".
  const cased = CHORD_TYPES.find((type) => names(type).some((name) => strip(name) === exact));
  if (cased) return cased;

  const needle = normalize(suffix);
  return CHORD_TYPES.find((type) => names(type).some((name) => normalize(name) === needle));
}

export { ROOTS };
