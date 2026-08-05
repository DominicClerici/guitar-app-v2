import { qualityOf } from './extract';
import { ROMAN_NUMERALS, THIRDLESS_QUALITIES, slotFor } from './scales';
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
  return chords.map((c) => {
    const offset = mod12(c.feature.rootPc - key.tonicPc);
    const quality = qualityOf(c.feature);
    const { degree, accidental, expected } = slotFor(key.mode, offset, quality);
    const roman = romanString(degree, accidental, quality);
    // A thirdless chord on a diatonic root contradicts nothing, so it is not
    // borrowed — it simply declines to say which quality the degree carries.
    const isDiatonic =
      expected !== null && (expected.has(quality) || THIRDLESS_QUALITIES.has(quality));
    return { roman, degree, accidental, isDiatonic };
  });
}
