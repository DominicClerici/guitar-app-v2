import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PREFERENCES,
  foldPreferences,
  formatTuning,
  isPreferenceKey,
  parseTuning,
  preferenceEntry,
  preferenceKey,
  preferenceSchemas,
  STANDARD_TUNING,
  TUNING_SPREAD,
  tuningRangeFor,
} from './preferences';

describe('preference contracts', () => {
  it('keeps the entry union in step with the declared keys', () => {
    const unionKeys = preferenceEntry.options.map((option) => option.shape.key.value).sort();

    expect(unionKeys).toEqual([...preferenceKey.options].sort());
  });

  it('accepts a value only under the key that owns it', () => {
    expect(preferenceEntry.safeParse({ key: 'theme', value: 'dark' }).success).toBe(true);
    expect(preferenceEntry.safeParse({ key: 'theme', value: 'sharp' }).success).toBe(false);
    expect(preferenceEntry.safeParse({ key: 'tempo', value: '120' }).success).toBe(false);
  });

  it('defaults every declared key', () => {
    expect(Object.keys(DEFAULT_PREFERENCES).sort()).toEqual([...preferenceKey.options].sort());

    for (const key of preferenceKey.options) {
      expect(preferenceSchemas[key].safeParse(DEFAULT_PREFERENCES[key]).success).toBe(true);
    }
  });

  it('recognises only declared keys', () => {
    expect(isPreferenceKey('theme')).toBe(true);
    expect(isPreferenceKey('tempo')).toBe(false);
  });
});

describe('foldPreferences', () => {
  it('fills gaps from the defaults', () => {
    expect(foldPreferences([{ key: 'theme', value: 'dark' }])).toEqual({
      ...DEFAULT_PREFERENCES,
      theme: 'dark',
    });
  });

  it('ignores rows a newer client version may have written', () => {
    const folded = foldPreferences([
      { key: 'theme', value: 'light' },
      { key: 'tempo', value: '120' },
      { key: 'accidentalPreference', value: 'quarter-tone' },
    ]);

    expect(folded).toEqual({ ...DEFAULT_PREFERENCES, theme: 'light' });
  });
});

describe('tuning values', () => {
  const standard = formatTuning(STANDARD_TUNING);

  it('round-trips a tuning through its stored form', () => {
    expect(parseTuning(standard)).toEqual([...STANDARD_TUNING]);
  });

  it('is what an untouched tuning preference already holds', () => {
    expect(DEFAULT_PREFERENCES.tuning).toBe(standard);
  });

  it('keeps every string within reach of its own standard pitch', () => {
    for (const [index, pitch] of STANDARD_TUNING.entries()) {
      const { min, max } = tuningRangeFor(index);

      expect(min).toBe(pitch - TUNING_SPREAD);
      expect(max).toBe(pitch + TUNING_SPREAD);
    }
  });

  it('accepts a real tuning a string at a time', () => {
    // Drop D: the sixth string alone, two half steps down.
    expect(parseTuning('64,59,55,50,45,38')).toEqual([64, 59, 55, 50, 45, 38]);
    // E flat standard: every string down one.
    expect(parseTuning('63,58,54,49,44,39')).toEqual([63, 58, 54, 49, 44, 39]);
  });

  it('refuses anything that is not six reachable pitches', () => {
    // A string past its own range, though a legal MIDI pitch and legal for another string.
    expect(parseTuning('64,59,55,50,45,35')).toBeNull();
    expect(parseTuning('64,59,55,50,45')).toBeNull();
    expect(parseTuning('64,59,55,50,45,40,33')).toBeNull();
    expect(parseTuning('64,59,55,50,45,')).toBeNull();
    expect(parseTuning('64,59,55,50,45,E')).toBeNull();
    expect(parseTuning('64,59,55,50,45,40.5')).toBeNull();
    expect(parseTuning('')).toBeNull();
  });

  it('stores a tuning only under its own key', () => {
    expect(preferenceEntry.safeParse({ key: 'tuning', value: standard }).success).toBe(true);
    expect(preferenceEntry.safeParse({ key: 'tuning', value: 'dark' }).success).toBe(false);
    expect(preferenceEntry.safeParse({ key: 'theme', value: standard }).success).toBe(false);
  });

  it('folds a tuning it cannot read back to the default', () => {
    // What a seven-string tuning written by a newer client looks like from here.
    expect(foldPreferences([{ key: 'tuning', value: '64,59,55,50,45,40,33' }]).tuning).toBe(
      standard,
    );
  });
});

describe('accessibility preferences', () => {
  it('starts every toggle off, in the sense the label reads', () => {
    // Haptics are something you turn off, and motion something you turn on — so "default off" is
    // the same answer spelled two ways, and only the labels say which way round it is.
    expect(DEFAULT_PREFERENCES.haptics).toBe('on');
    expect(DEFAULT_PREFERENCES.reduceMotion).toBe('off');
    expect(DEFAULT_PREFERENCES.colorVision).toBe('normal');
  });

  it('stores a toggle only under a key that is one', () => {
    expect(preferenceEntry.safeParse({ key: 'haptics', value: 'off' }).success).toBe(true);
    expect(preferenceEntry.safeParse({ key: 'reduceMotion', value: 'on' }).success).toBe(true);
    expect(preferenceEntry.safeParse({ key: 'haptics', value: 'true' }).success).toBe(false);
    expect(preferenceEntry.safeParse({ key: 'theme', value: 'on' }).success).toBe(false);
  });

  it('stores a colour vision mode only under its own key', () => {
    expect(preferenceEntry.safeParse({ key: 'colorVision', value: 'tritanopia' }).success).toBe(
      true,
    );
    expect(preferenceEntry.safeParse({ key: 'colorVision', value: 'on' }).success).toBe(false);
    expect(preferenceEntry.safeParse({ key: 'haptics', value: 'protanopia' }).success).toBe(false);
  });

  it('folds a mode it cannot read back to the default', () => {
    // What a mode added by a newer client looks like from here.
    expect(foldPreferences([{ key: 'colorVision', value: 'achromatopsia' }]).colorVision).toBe(
      'normal',
    );
  });
});
