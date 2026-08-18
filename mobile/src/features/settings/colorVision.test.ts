import { colorVision, formatTuning, STANDARD_TUNING, TUNING_SPREAD } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import { notesSharp } from '@/lib/theory';
import { STANDARD, tuningFor, type Tuning } from '@/lib/tuning';

import {
  COLOR_VISION_OPTIONS,
  PREVIEW_FRETS,
  previewNotes,
  describeColorVision,
} from './colorVision';

/**
 * Every tuning the setting can hold is one string moved up to `TUNING_SPREAD` either way, so the
 * cases worth checking are the ones a preview shape can actually be broken by: a string moved far
 * enough that the note it used to play is no longer in the first five frets.
 */
const NAMED: [string, Tuning][] = [
  ['standard', STANDARD],
  ['drop D', tuningFor(formatTuning([64, 59, 55, 50, 45, 38]))],
  ['DADGAD', tuningFor(formatTuning([62, 57, 55, 50, 45, 38]))],
  ['E♭ standard', tuningFor(formatTuning([63, 58, 54, 49, 44, 39]))],
];

/** Every one-string retune the preference allows, which is the whole space this has to survive. */
function everyRetune(): Tuning[] {
  const found: Tuning[] = [];

  for (const [string, standard] of STANDARD_TUNING.entries()) {
    for (let step = -TUNING_SPREAD; step <= TUNING_SPREAD; step += 1) {
      const pitches: number[] = [...STANDARD_TUNING];
      pitches[string] = standard + step;
      found.push(tuningFor(formatTuning(pitches)));
    }
  }

  return found;
}

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
  it('is the shape it has always been on a standard neck', () => {
    const notes = previewNotes(STANDARD, 'sharp');

    expect(notes.map((note) => note.string)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(notes.map((note) => note.fret)).toEqual([3, 3, 2, 0, 2, 0]);
    expect(notes.map((note) => note.label)).toEqual(['G', 'D', 'A', 'D', 'B', 'E']);
  });

  it('sits on the board it is drawn on', () => {
    for (const note of previewNotes(STANDARD, 'flat')) {
      expect(note.fret, note.label).toBeGreaterThanOrEqual(0);
      expect(note.fret, note.label).toBeLessThan(PREVIEW_FRETS);
    }
  });

  it('hands back the same notes for the same tuning and spelling', () => {
    expect(previewNotes(STANDARD, 'flat')).toBe(previewNotes(STANDARD, 'flat'));
  });

  it.each(NAMED)('leaves every dot exactly where it was (%s)', (_name, tuning) => {
    const standard = previewNotes(STANDARD, 'flat');
    const retuned = previewNotes(tuning, 'flat');

    expect(retuned.map((note) => `${note.string}-${note.fret}`)).toEqual(
      standard.map((note) => `${note.string}-${note.fret}`),
    );
  });

  it.each(NAMED)('draws every hue the palette adjusts (%s)', (_name, tuning) => {
    const roles = previewNotes(tuning, 'flat')
      .map((note) => note.role)
      .filter((role) => role !== null);

    expect(new Set(roles)).toEqual(new Set(['accent', 'amber', 'rose', 'violet']));
  });

  it('prints the note that is actually under the finger', () => {
    // A preview of the neck that labelled its own dots wrongly would be teaching the wrong thing
    // to sell a palette — and the labels are the whole of what a retune moves here.
    for (const tuning of everyRetune()) {
      for (const note of previewNotes(tuning, 'sharp')) {
        const pitch = tuning.open[note.string] + note.fret;

        expect(
          toAccidentalGlyphs(notesSharp[pitch % 12]),
          `${tuning.stored} string ${note.string}`,
        ).toBe(note.label);
      }
    }
  });

  it('renames the string that moved, and only that string', () => {
    // Drop D: the sixth string's dot is the same dot, on the same fret, reading D.
    const standard = previewNotes(STANDARD, 'flat');
    const dropped = previewNotes(tuningFor(formatTuning([64, 59, 55, 50, 45, 38])), 'flat');

    expect(dropped[5]).toEqual({ ...standard[5], label: 'D' });
    expect(dropped.slice(0, 5)).toEqual(standard.slice(0, 5));
  });

  it('spells a black key the way it was asked to', () => {
    // E flat standard puts every dot a half step down, which is where the preference gets a say.
    const flattened = tuningFor(formatTuning([63, 58, 54, 49, 44, 39]));

    expect(previewNotes(flattened, 'flat')[5].label).toBe('E\u266d');
    expect(previewNotes(flattened, 'sharp')[5].label).toBe('D\u266f');
  });

  it('gives the same note the same colour twice on the neck it was drawn for', () => {
    // Only on a standard neck. There the shape is one scale and a hue says what a note is to it;
    // retune a string and two dots can read D without meaning the same thing, which is the guitar
    // being honest rather than the palette being wrong.
    const byLabel = new Map<string, (string | null)[]>();

    for (const note of previewNotes(STANDARD, 'flat')) {
      byLabel.set(note.label, [...(byLabel.get(note.label) ?? []), note.role]);
    }

    for (const [label, roles] of byLabel) {
      expect(new Set(roles).size, label).toBe(1);
    }
  });
});
