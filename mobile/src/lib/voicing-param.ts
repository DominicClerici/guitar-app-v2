import type { FretboardNote } from '@/lib/chord-analysis';
import { FRET_COUNT, STRING_COUNT } from '@/lib/theory';

/**
 * A voicing carried between screens as one route param.
 *
 * Navigation params are strings, and a shape is small enough that a legible list
 * of string.fret pairs — `5.3-4.2-3.0` — beats JSON in a URL. Decoding rejects
 * the whole param rather than part of it: half a chord is a worse thing to open
 * a screen on than an empty neck.
 */
export function encodeVoicing(voicing: FretboardNote[]): string {
  return voicing.map((note) => `${note.string}.${note.fret}`).join('-');
}

export function decodeVoicing(encoded: string | undefined): FretboardNote[] {
  if (!encoded) return [];

  const voicing: FretboardNote[] = [];
  for (const pair of encoded.split('-')) {
    const [string, fret] = pair.split('.').map(Number);
    const onNeck =
      Number.isInteger(string) &&
      Number.isInteger(fret) &&
      string >= 0 &&
      string < STRING_COUNT &&
      fret >= 0 &&
      fret <= FRET_COUNT;
    if (!onNeck) return [];
    voicing.push({ string, fret });
  }
  return voicing;
}
