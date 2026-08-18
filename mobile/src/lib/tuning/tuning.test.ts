import { formatTuning, STANDARD_TUNING } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import { stringLabels } from './labels';
import { soundingMidi, soundingPitchClass, STANDARD, tuningFor } from './tuning';

const DROP_D = formatTuning([64, 59, 55, 50, 45, 38]);
const DADGAD = formatTuning([62, 57, 55, 50, 45, 38]);

describe('tuningFor', () => {
  it('reads the stored value into six open pitches', () => {
    expect(tuningFor(DROP_D).open).toEqual([64, 59, 55, 50, 45, 38]);
  });

  it('returns the same object for the same stored value', () => {
    expect(tuningFor(DROP_D)).toBe(tuningFor(DROP_D));
  });

  it('falls back to standard for a value it cannot read', () => {
    expect(tuningFor('nonsense').open).toEqual([...STANDARD_TUNING]);
  });

  it('reports standard tuning as standard, and a moved string as not', () => {
    expect(STANDARD.isStandard).toBe(true);
    expect(tuningFor(DROP_D).isStandard).toBe(false);
  });

  it('measures each string against its own standard pitch', () => {
    expect(tuningFor(DROP_D).offsets).toEqual([0, 0, 0, 0, 0, -2]);
    expect(STANDARD.offsets).toEqual([0, 0, 0, 0, 0, 0]);
  });
});

describe('what a position sounds', () => {
  it('follows the tuning rather than the standard neck', () => {
    // The sixth string, second fret: E on a standard neck, E on a dropped one only at fret 4.
    expect(soundingMidi(STANDARD, 5, 2)).toBe(42);
    expect(soundingMidi(tuningFor(DROP_D), 5, 2)).toBe(40);
  });

  it('agrees with its own pitch classes', () => {
    const tuning = tuningFor(DADGAD);

    for (let string = 0; string < 6; string += 1) {
      for (let fret = 0; fret <= 15; fret += 1) {
        expect(soundingPitchClass(tuning, string, fret)).toBe(soundingMidi(tuning, string, fret) % 12);
      }
    }
  });
});

describe('stringLabels', () => {
  it('names a standard neck the way it has always been named', () => {
    expect(stringLabels(STANDARD, 'sharp')).toEqual(['e', 'B', 'G', 'D', 'A', 'E']);
  });

  it('names a moved string for what it is now tuned to', () => {
    expect(stringLabels(tuningFor(DADGAD), 'flat')).toEqual(['d', 'A', 'G', 'D', 'A', 'D']);
  });

  it('spells a black key the way it was asked to', () => {
    const ebStandard = tuningFor(formatTuning([63, 58, 54, 49, 44, 39]));

    expect(stringLabels(ebStandard, 'flat')[5]).toBe('E♭');
    expect(stringLabels(ebStandard, 'sharp')[5]).toBe('D♯');
  });

  it('hands back the same array for the same tuning and spelling', () => {
    expect(stringLabels(STANDARD, 'flat')).toBe(stringLabels(STANDARD, 'flat'));
  });
});
