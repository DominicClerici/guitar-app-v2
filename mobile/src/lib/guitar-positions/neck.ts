// Where a set of pitch classes lands on the neck. The one place this module
// walks the whole board, so the string-index convention (0 = high e, 5 = low E,
// per @/lib/theory) is stated once and read from here by everything else.

import { FRET_COUNT, pitchClassAt, STRING_COUNT, midiAt } from '@/lib/theory';

export function positionKey(string: number, fret: number): string {
  return `${string}-${fret}`;
}

/** Every position on the neck sounding one of `pitchClasses`. */
export function scaleKeys(pitchClasses: readonly number[]): Set<string> {
  return scaleKeysInSpan(pitchClasses, 0, FRET_COUNT);
}

/** The same, restricted to a fret span (inclusive). */
export function scaleKeysInSpan(
  pitchClasses: readonly number[],
  from: number,
  to: number,
): Set<string> {
  const wanted = new Set(pitchClasses);
  const keys = new Set<string>();

  for (let string = 0; string < STRING_COUNT; string += 1) {
    for (let fret = from; fret <= to; fret += 1) {
      if (wanted.has(pitchClassAt(string, fret))) keys.add(positionKey(string, fret));
    }
  }
  return keys;
}

/**
 * The scale tones on one string, as MIDI pitches, ascending. Used to seed the
 * three-notes-per-string walk from the low E.
 */
export function stringPitches(pitchClasses: readonly number[], string: number): number[] {
  const wanted = new Set(pitchClasses);
  const pitches: number[] = [];

  for (let fret = 0; fret <= FRET_COUNT; fret += 1) {
    if (wanted.has(pitchClassAt(string, fret))) pitches.push(midiAt(string, fret));
  }
  return pitches;
}

/** The next pitch above `midi` belonging to the scale. */
export function nextScalePitch(pitchClasses: readonly number[], midi: number): number {
  const wanted = new Set(pitchClasses);
  let next = midi + 1;
  while (!wanted.has(((next % 12) + 12) % 12)) next += 1;
  return next;
}
