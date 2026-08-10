// Layer A — note names → semitone offsets. Pitch-class lookups and the
// "halfSteps" array (offsets relative to a given root) the rest of the engine
// is built on.

import { notesEnhFlat, notesEnhSharp, notesFlat, notesSharp } from './constants';

/**
 * Returns the pitch class (0..11) of a note name. Throws if the name is not
 * found in any of the four chromatic arrays.
 *
 * Used by the engine internally and by progressions/page.tsx to derive
 * rootPitchClass safely for both flat-side and sharp-side root spellings.
 */
export function noteToSemitone(note: string): number {
  for (let i = 0; i < 12; i += 1) {
    if (
      notesFlat[i] === note ||
      notesSharp[i] === note ||
      notesEnhFlat[i] === note ||
      notesEnhSharp[i] === note
    ) {
      return i;
    }
  }
  throw new Error(`noteToSemitone: unknown note "${note}"`);
}

/**
 * Returns an array of semitone offsets parallel to `notes`, with `root`
 * mapping to 0. Notes that are below the root in chromatic order are wrapped
 * up an octave (offset += 12) before subtraction.
 *
 * If a note isn't found in the chromatic arrays it leaves the slot
 * undefined — same behavior as the source. Callers should filter upstream.
 */
export function getHalfSteps(root: string, notes: string[]): number[] {
  let s: number | undefined;
  for (let i = 0; i < 12; i += 1) {
    if (
      notesFlat[i] === root ||
      notesSharp[i] === root ||
      notesEnhFlat[i] === root ||
      notesEnhSharp[i] === root
    ) {
      s = i;
      break;
    }
  }
  if (s === undefined) throw new Error(`getHalfSteps: unknown root "${root}"`);

  const out: number[] = [];
  for (let a = 0; a < notes.length; a += 1) {
    if (notes[a] === root) {
      out[a] = 0;
      continue;
    }
    for (let i = 0; i < 12; i += 1) {
      if (
        notesFlat[i] === notes[a] ||
        notesSharp[i] === notes[a] ||
        notesEnhFlat[i] === notes[a] ||
        notesEnhSharp[i] === notes[a]
      ) {
        const wrapped = i < s ? i + 12 : i;
        out[a] = wrapped - s;
        break;
      }
    }
  }
  return out;
}
