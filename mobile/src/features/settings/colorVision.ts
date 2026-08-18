import type { ColorVision } from '@guitar/shared';

import { chromaticName, toAccidentalGlyphs, type AccidentalSide } from '@/lib/accidentals';
import type { HueRole } from '@/lib/color-vision';
import { soundingPitchClass, type Tuning } from '@/lib/tuning';

/**
 * The colour vision setting as the settings screen states it: what to call each mode, and what to
 * draw under them so a choice can be seen rather than guessed at.
 */

export interface ColorVisionOption {
  id: ColorVision;
  /**
   * The condition's own name, not a description of the palette.
   *
   * Someone who needs this setting knows the word for their own vision and will find it in a list
   * immediately; "warmer" or "high contrast" would leave them trying each one to see which is
   * theirs. `normal` is the exception — nobody looks for the absence of a condition by name, so it
   * is the off position it actually is.
   */
  name: string;
}

export const COLOR_VISION_OPTIONS: readonly ColorVisionOption[] = [
  { id: 'normal', name: 'Off' },
  { id: 'protanopia', name: 'Protanopia' },
  { id: 'deuteranopia', name: 'Deuteranopia' },
  { id: 'tritanopia', name: 'Tritanopia' },
];

/** What the settings row reads without the sheet having to be opened. */
export function describeColorVision(mode: ColorVision): string {
  return COLOR_VISION_OPTIONS.find((option) => option.id === mode)?.name ?? 'Off';
}

/** Frets the preview board draws, `0` being the nut. */
export const PREVIEW_FRETS = 5;

export interface PreviewNote {
  /** Indexed the app's way: 0 = high e, 5 = low E. */
  string: number;
  fret: number;
  label: string;
  /** The hue this note is drawn in, or `null` for a note the palette says nothing about. */
  role: HueRole | null;
}

/**
 * The shape the preview lights up: on a standard neck, E minor pentatonic in the first three
 * frets, one note per string.
 *
 * It is a real fingering rather than an arrangement of swatches, because that is the thing being
 * previewed — not whether four colours differ side by side, which any two do, but whether they
 * still differ at the size of a dot, spread across a neck, with a note name printed over them.
 *
 * The hues belong to the positions. What is being judged is a palette, and moving the dots about
 * to keep the shape spelling one particular scale would change the picture under someone who only
 * came here to compare colours — so a retune leaves the fingering exactly where it is and renames
 * it, which is what the guitar itself does.
 */
const PREVIEW_SHAPE: readonly { string: number; fret: number; role: HueRole | null }[] = [
  { string: 0, fret: 3, role: 'amber' },
  { string: 1, fret: 3, role: null },
  { string: 2, fret: 2, role: 'rose' },
  { string: 3, fret: 0, role: null },
  { string: 4, fret: 2, role: 'violet' },
  // The root on a standard neck, and the only note the app fills in solid.
  { string: 5, fret: 0, role: 'accent' },
];

let cached: { tuning: Tuning; side: AccidentalSide; notes: readonly PreviewNote[] } | null = null;

/**
 * The shape, named for the strings the user actually has.
 *
 * Only the labels move. On a standard neck this is the E minor pentatonic it has always been, and
 * every note the palette codes is a different letter; drop the sixth string and that dot reads D,
 * where a board that went on printing E would be teaching the wrong thing to sell a palette.
 *
 * Two dots can therefore end up sharing a letter and not a hue — the dropped sixth and the open
 * fourth are both D. That is honest rather than sloppy: the hue is saying which of four colours
 * this is, and on a neck that is no longer spelling one scale there is nothing left for it to mean
 * about the note.
 */
export function previewNotes(tuning: Tuning, side: AccidentalSide): readonly PreviewNote[] {
  if (cached && cached.tuning === tuning && cached.side === side) return cached.notes;

  const notes = PREVIEW_SHAPE.map(({ string, fret, role }) => ({
    string,
    fret,
    label: toAccidentalGlyphs(chromaticName(soundingPitchClass(tuning, string, fret), side)),
    role,
  }));

  cached = { tuning, side, notes };

  return notes;
}
