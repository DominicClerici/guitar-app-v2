import {
  formatTuning,
  parseTuning,
  STANDARD_TUNING,
  type AccidentalPreference,
} from '@guitar/shared';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import { notesFlat, notesSharp } from '@/lib/theory';

/**
 * Reading and writing the stored tuning, as the settings show it.
 *
 * The stored value indexes 0 = high e, like every other six-element array about a neck. A tuning is
 * *read* the other way up — "E A D G B E" is the sixth string first — so the reversal happens here,
 * at the display boundary, and once: `stringsLowToHigh` is what the sheet lays out and what the row
 * prints, and neither of them ever indexes the stored array directly.
 */

/** The stored tuning as six pitches, falling back to standard for a value that cannot be read. */
export function tuningFrom(stored: string): number[] {
  return parseTuning(stored) ?? [...STANDARD_TUNING];
}

/** The same six pitches in the order they are read out and laid out: sixth string first. */
export function stringsLowToHigh(tuning: readonly number[]): number[] {
  return [...tuning].reverse();
}

/** Where a low-to-high position sits in the stored tuning. */
export function storedIndexOf(position: number): number {
  return STANDARD_TUNING.length - 1 - position;
}

/** A tuning written the way it is read — sixth string first — as the stored value. */
export function tuningFromLowToHigh(pitches: readonly number[]): string {
  return formatTuning(stringsLowToHigh(pitches));
}

/** The stored value for `tuning` with one string moved, ready to write. */
export function tuningWithString(
  tuning: readonly number[],
  storedIndex: number,
  pitch: number,
): string {
  return formatTuning(tuning.map((current, index) => (index === storedIndex ? pitch : current)));
}

/**
 * How a pitch is spelled, as a note name with no octave on it.
 *
 * `auto` defers to the key a passage is in, and a tuning has no key — so it falls to flats rather
 * than to sharps, because a lowered string is named for the lowering: a guitar is tuned to E flat
 * standard, never to D sharp standard.
 */
export function noteNameOf(pitch: number, accidentals: AccidentalPreference): string {
  const pitchClass = ((pitch % 12) + 12) % 12;
  const name = accidentals === 'sharp' ? notesSharp[pitchClass] : notesFlat[pitchClass];

  return toAccidentalGlyphs(name);
}

/** The whole tuning as one line — what the settings row shows without opening anything. */
export function describeTuning(
  tuning: readonly number[],
  accidentals: AccidentalPreference,
): string {
  return stringsLowToHigh(tuning)
    .map((pitch) => noteNameOf(pitch, accidentals))
    .join(' ');
}

export interface TuningPreset {
  id: string;
  /** The tuning's own name, spelled the way it is always spelled — not the accidental setting. */
  name: string;
  /** The stored value it sets. */
  tuning: string;
}

/**
 * The tunings worth a tap, written low string first, the way they are named and played.
 *
 * They are shortcuts rather than modes: nothing records which one was pressed, so a preset is
 * "active" exactly when the six strings say it is — reached by chip or walked to a half step at a
 * time, which is the same tuning either way. That is also why standard is not among them. It is
 * every string at rest rather than a tuning you go to, and it already has the reset under the row.
 */
export const TUNING_PRESETS: readonly TuningPreset[] = [
  { id: 'drop-d', name: 'Drop D', tuning: tuningFromLowToHigh([38, 45, 50, 55, 59, 64]) },
  { id: 'eb-standard', name: 'E♭ standard', tuning: tuningFromLowToHigh([39, 44, 49, 54, 58, 63]) },
  { id: 'open-g', name: 'Open G', tuning: tuningFromLowToHigh([38, 43, 50, 55, 59, 62]) },
  { id: 'dadgad', name: 'DADGAD', tuning: tuningFromLowToHigh([38, 45, 50, 55, 57, 62]) },
];

/** The preset a tuning happens to be, or `null` for one that is nobody's. */
export function presetMatching(stored: string): TuningPreset | null {
  return TUNING_PRESETS.find((preset) => preset.tuning === stored) ?? null;
}
