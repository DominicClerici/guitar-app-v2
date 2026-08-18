import { formatTuning, parseTuning, STANDARD_TUNING } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import {
  describeTuning,
  noteNameOf,
  presetMatching,
  storedIndexOf,
  stringsLowToHigh,
  TUNING_PRESETS,
  tuningFrom,
  tuningFromLowToHigh,
  tuningWithString,
} from './tuning';

const STANDARD = [...STANDARD_TUNING];

describe('tuningFrom', () => {
  it('reads a stored tuning', () => {
    expect(tuningFrom('64,59,55,50,45,38')).toEqual([64, 59, 55, 50, 45, 38]);
  });

  it('falls back to standard for a value it cannot read', () => {
    expect(tuningFrom('')).toEqual(STANDARD);
    expect(tuningFrom('nonsense')).toEqual(STANDARD);
  });
});

describe('reading a tuning out', () => {
  it('turns the stored order into the order it is spoken in', () => {
    expect(stringsLowToHigh(STANDARD)).toEqual([40, 45, 50, 55, 59, 64]);
  });

  it('names standard tuning', () => {
    expect(describeTuning(STANDARD, 'auto')).toBe('E A D G B E');
  });

  it('spells a black key the way the preference asks', () => {
    // The A string, one half step down.
    expect(noteNameOf(44, 'sharp')).toBe('G♯');
    expect(noteNameOf(44, 'flat')).toBe('A♭');
    // No key to defer to, so `auto` is the flat side.
    expect(noteNameOf(44, 'auto')).toBe('A♭');
  });

  it('reads drop D from the sixth string in', () => {
    expect(describeTuning([64, 59, 55, 50, 45, 38], 'flat')).toBe('D A D G B E');
  });
});

describe('moving one string', () => {
  it('writes back the position the sheet lays out', () => {
    // Position 0 is the sixth string, which is the last of the stored pitches.
    expect(storedIndexOf(0)).toBe(5);
    expect(tuningWithString(STANDARD, storedIndexOf(0), 38)).toBe('64,59,55,50,45,38');
  });

  it('leaves every other string where it was', () => {
    expect(tuningWithString(STANDARD, storedIndexOf(5), 63)).toBe('63,59,55,50,45,40');
    expect(tuningWithString(STANDARD, storedIndexOf(2), 53)).toBe(formatTuning([64, 59, 55, 53, 45, 40]));
  });
});

describe('presets', () => {
  it('names each one the way it is read', () => {
    const named = TUNING_PRESETS.map((preset) => [
      preset.name,
      describeTuning(tuningFrom(preset.tuning), 'flat'),
    ]);

    expect(named).toEqual([
      ['Drop D', 'D A D G B E'],
      ['E♭ standard', 'E♭ A♭ D♭ G♭ B♭ E♭'],
      ['Open G', 'D G D G B D'],
      ['DADGAD', 'D A D G A D'],
    ]);
  });

  it('keeps every preset inside what a string can be tuned to', () => {
    for (const preset of TUNING_PRESETS) {
      // A preset outside the spread would be unwritable — refused by `preferenceEntry` — and would
      // land on the tickers as standard tuning instead of as itself.
      expect(parseTuning(preset.tuning)).not.toBeNull();
    }
  });

  it('is active for a tuning that matches it, however it was reached', () => {
    const dropD = tuningFromLowToHigh([38, 45, 50, 55, 59, 64]);

    expect(presetMatching(dropD)?.id).toBe('drop-d');
    // The same tuning walked to one string at a time is the same tuning.
    expect(presetMatching(tuningWithString(tuningFrom(''), storedIndexOf(0), 38))?.id).toBe(
      'drop-d',
    );
  });

  it('is nobody for standard tuning, or for a tuning of your own', () => {
    expect(presetMatching(tuningFromLowToHigh([40, 45, 50, 55, 59, 64]))).toBeNull();
    expect(presetMatching(tuningFromLowToHigh([37, 45, 50, 55, 59, 64]))).toBeNull();
  });

  it('gives each preset an id of its own', () => {
    const ids = TUNING_PRESETS.map((preset) => preset.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
