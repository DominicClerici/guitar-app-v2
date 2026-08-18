// Where a set of pitch classes lands on the neck. The one place this module
// walks the whole board, so the string-index convention (0 = high e, 5 = low E,
// per @/lib/theory) is stated once and read from here by everything else.
//
// The board walked is the user's own: a scale tone is wherever it sounds, which
// on a retuned guitar is not where it sits on a standard one. The tuning comes
// in as an argument rather than being read here, so this stays pure and the
// caller stays the one thing that knows whose neck is being drawn.

import { FRET_COUNT, STRING_COUNT } from '@/lib/theory';
import { soundingMidi, soundingPitchClass, type Tuning } from '@/lib/tuning';

export function positionKey(string: number, fret: number): string {
  return `${string}-${fret}`;
}

/** Every position on the neck sounding one of `pitchClasses`. */
export function scaleKeys(tuning: Tuning, pitchClasses: readonly number[]): Set<string> {
  return scaleKeysInSpan(tuning, pitchClasses, 0, FRET_COUNT);
}

/** The same, restricted to a fret span (inclusive). */
export function scaleKeysInSpan(
  tuning: Tuning,
  pitchClasses: readonly number[],
  from: number,
  to: number,
): Set<string> {
  const wanted = new Set(pitchClasses);
  const keys = new Set<string>();

  for (let string = 0; string < STRING_COUNT; string += 1) {
    for (let fret = from; fret <= to; fret += 1) {
      if (wanted.has(soundingPitchClass(tuning, string, fret))) keys.add(positionKey(string, fret));
    }
  }
  return keys;
}

/**
 * The scale tones on one string, as MIDI pitches, ascending. Used to seed the
 * three-notes-per-string walk from the low E.
 */
export function stringPitches(
  tuning: Tuning,
  pitchClasses: readonly number[],
  string: number,
): number[] {
  const wanted = new Set(pitchClasses);
  const pitches: number[] = [];

  for (let fret = 0; fret <= FRET_COUNT; fret += 1) {
    if (wanted.has(soundingPitchClass(tuning, string, fret)))
      pitches.push(soundingMidi(tuning, string, fret));
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
