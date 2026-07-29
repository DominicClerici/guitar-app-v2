import { STRING_COUNT } from './tuning';
import type { PlacedNote } from './useChordDetection';

const MUTED = '×';

/**
 * A voicing as the chord-chart shorthand every guitarist reads: one entry per
 * string, fret number or × for unplayed. Written low E first, which reverses the
 * internal string index (0 = high e).
 */
export function voicingChart(placed: PlacedNote[]): string[] {
  const byString = new Map(placed.map((n) => [n.string, n.fret]));

  return Array.from({ length: STRING_COUNT }, (_, i) => {
    const fret = byString.get(STRING_COUNT - 1 - i);
    return fret === undefined ? MUTED : String(fret);
  });
}
