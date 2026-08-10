import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PREFERENCES,
  foldPreferences,
  isPreferenceKey,
  preferenceEntry,
  preferenceKey,
  preferenceSchemas,
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
