import { qualityOf } from './extract';
import { ROMAN_NUMERALS, degreeMap, degreeQualities } from './scales';
import type { KeyCandidate, ProgressionChord, Quality, RomanLabel } from './types';

const LOWERCASE_QUALITIES = new Set<Quality>([
  'min',
  'min7',
  'minMaj7',
  'dim',
  'dim7',
  'min7b5',
]);

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

function suffixFor(quality: Quality): string {
  switch (quality) {
    case 'dim':
      return '°';
    case 'dim7':
      return '°7';
    case 'min7b5':
      return 'ø7';
    case 'aug':
      return '+';
    case 'dom7':
      return '7';
    case 'maj7':
      return 'maj7';
    case 'min7':
      return '7';
    case 'minMaj7':
      return 'maj7';
    case 'sus':
      return 'sus';
    case 'power':
      return '5';
    case 'unknown':
      return '?';
    default:
      return '';
  }
}

function romanString(degree: number, accidental: string, quality: Quality): string {
  let base: string = ROMAN_NUMERALS[degree - 1];
  if (LOWERCASE_QUALITIES.has(quality)) base = base.toLowerCase();
  return accidental + base + suffixFor(quality);
}

/**
 * Roman numeral per chord, relative to a chosen key. Index-aligned with `chords`.
 * Independent of estimateKey — pass any candidate to relabel without re-estimating.
 */
export function romanLabelsFor(chords: ProgressionChord[], key: KeyCandidate): RomanLabel[] {
  const map = degreeMap(key.mode);
  const expected = degreeQualities(key.mode);
  return chords.map((c) => {
    const offset = mod12(c.feature.rootPc - key.tonicPc);
    const { degree, accidental } = map[offset];
    const quality = qualityOf(c.feature);
    const roman = romanString(degree, accidental, quality);
    const isDiatonic = accidental === '' && expected[degree - 1].has(quality);
    return { roman, degree, accidental, isDiatonic };
  });
}
