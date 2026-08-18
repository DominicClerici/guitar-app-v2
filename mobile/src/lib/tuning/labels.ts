/**
 * String names, as a board prints them down its side.
 *
 * `STRING_LABELS` in `@/lib/theory` is the standard-tuning answer and stays where it is: a board
 * drawing authored standard-tuning content is naming the strings that content was written for. This
 * is for the boards that draw the user's own neck, where the sixth string may not be an E at all.
 *
 * The first string keeps its lowercase spelling. That is the one piece of the old table that is a
 * convention rather than a pitch — the thin string is written small so the two E's of a standard
 * neck can be told apart at a glance — and it goes on being true of whatever that string is tuned
 * to.
 */
import { chromaticName, toAccidentalGlyphs, type AccidentalSide } from '@/lib/accidentals';

import type { Tuning } from './tuning';

/**
 * What `auto` means for a string name: flats.
 *
 * A tuning has no key to defer to, and a lowered string is named for the lowering — a guitar is
 * tuned to E flat standard, never to D sharp standard.
 */
export const TUNING_FALLBACK: AccidentalSide = 'flat';

/** The thinnest string, written small. */
const HIGH = 0;

let cached: { tuning: Tuning; side: AccidentalSide; labels: readonly string[] } | null = null;

/**
 * The six open-string names, high string first, memoised on the tuning and the spelling together.
 *
 * Two boards on screen at once ask for the same pair and get the same array, which is what keeps
 * this out of the render path of anything that draws a label per string per fret row.
 */
export function stringLabels(tuning: Tuning, side: AccidentalSide): readonly string[] {
  if (cached && cached.tuning === tuning && cached.side === side) return cached.labels;

  const labels = Object.freeze(
    tuning.openPitchClasses.map((pitchClass, index) => {
      const name = toAccidentalGlyphs(chromaticName(pitchClass, side));

      return index === HIGH ? name.toLowerCase() : name;
    }),
  );

  cached = { tuning, side, labels };

  return labels;
}
