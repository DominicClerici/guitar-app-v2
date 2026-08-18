import type { ColorVision } from '@guitar/shared';

import type { HueRole } from '@/lib/color-vision';

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
 * The shape the preview lights up: E minor pentatonic in the first three frets, one note per
 * string.
 *
 * It is a real fingering rather than an arrangement of swatches, because that is the thing being
 * previewed — not whether four colours differ side by side, which any two do, but whether they
 * still differ at the size of a dot, spread across a neck, with a note name printed over them.
 *
 * All four hues appear, and both D's are left plain: the palette codes what a note *is* to the
 * scale, so the same note twice is the same colour twice, and the notes it has nothing to say
 * about stay out of the comparison entirely.
 */
export const PREVIEW_NOTES: readonly PreviewNote[] = [
  { string: 0, fret: 3, label: 'G', role: 'amber' },
  { string: 1, fret: 3, label: 'D', role: null },
  { string: 2, fret: 2, label: 'A', role: 'rose' },
  { string: 3, fret: 0, label: 'D', role: null },
  { string: 4, fret: 2, label: 'B', role: 'violet' },
  // The root, and the only note the app fills in solid.
  { string: 5, fret: 0, label: 'E', role: 'accent' },
];
