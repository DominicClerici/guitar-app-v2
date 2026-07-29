import { STRING_COUNT } from '../theory';

const MUTED = 'x';

/**
 * The shorthand every guitarist reads: one entry per string, fret number or x.
 * This is the display boundary where the app's 0 = high e indexing flips to the
 * low-E-first order charts are written in. Nothing upstream of here reverses.
 */
export function chartFor(frets: (number | null)[]): string {
  return Array.from({ length: STRING_COUNT }, (_, i) => {
    const fret = frets[STRING_COUNT - 1 - i];
    return fret === null ? MUTED : String(fret);
  }).join(' ');
}

/** The inverse, for reading hand-written pin patterns like "x 3 2 0 1 0". */
export function fretsFromChart(chart: string): (number | null)[] | null {
  const cells = chart.trim().split(/\s+/);
  if (cells.length !== STRING_COUNT) return null;

  const frets: (number | null)[] = [];
  for (const cell of cells) {
    if (cell.toLowerCase() === MUTED) {
      frets.unshift(null);
      continue;
    }
    const fret = Number(cell);
    if (!Number.isInteger(fret) || fret < 0) return null;
    frets.unshift(fret);
  }

  return frets;
}
