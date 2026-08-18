import { colorVision, STANDARD_TUNING } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import { notesSharp } from '@/lib/theory';

import {
  COLOR_VISION_OPTIONS,
  PREVIEW_FRETS,
  PREVIEW_NOTES,
  describeColorVision,
} from './colorVision';

describe('the modes on offer', () => {
  it('offers every mode the preference can hold, once', () => {
    expect(COLOR_VISION_OPTIONS.map((option) => option.id)).toEqual([...colorVision.options]);
  });

  it('names the mode a row is set to', () => {
    expect(describeColorVision('normal')).toBe('Off');
    expect(describeColorVision('tritanopia')).toBe('Tritanopia');
  });
});

describe('the preview shape', () => {
  it('is a note per string, on the board it is drawn on', () => {
    expect(PREVIEW_NOTES.map((note) => note.string)).toEqual([0, 1, 2, 3, 4, 5]);

    for (const note of PREVIEW_NOTES) {
      expect(note.fret, note.label).toBeGreaterThanOrEqual(0);
      expect(note.fret, note.label).toBeLessThan(PREVIEW_FRETS);
    }
  });

  it('prints the note that is actually under the finger', () => {
    // A preview of the neck that labelled its own dots wrongly would be teaching the wrong thing
    // to sell a palette.
    for (const note of PREVIEW_NOTES) {
      const pitch = STANDARD_TUNING[note.string] + note.fret;

      expect(notesSharp[pitch % 12], `string ${note.string} fret ${note.fret}`).toBe(note.label);
    }
  });

  it('draws every hue the palette adjusts', () => {
    const roles = PREVIEW_NOTES.map((note) => note.role).filter((role) => role !== null);

    expect(new Set(roles)).toEqual(new Set(['accent', 'amber', 'rose', 'violet']));
  });

  it('gives the same note the same colour twice', () => {
    const byLabel = new Map<string, (typeof PREVIEW_NOTES)[number]['role'][]>();

    for (const note of PREVIEW_NOTES) {
      byLabel.set(note.label, [...(byLabel.get(note.label) ?? []), note.role]);
    }

    for (const [label, roles] of byLabel) {
      expect(new Set(roles).size, label).toBe(1);
    }
  });
});
