import { describe, expect, it } from 'vitest';

import { FRAMING, OTHER_MODE, parseMode, type OnboardingMode } from './mode';

const MODES: OnboardingMode[] = ['create', 'login'];

describe('parseMode', () => {
  it('reads the login framing', () => {
    expect(parseMode('login')).toBe('login');
  });

  it('falls back to create for anything else', () => {
    for (const value of [undefined, null, '', 'signin', 'LOGIN', 7, ['login']]) {
      expect(parseMode(value)).toBe('create');
    }
  });
});

describe('OTHER_MODE', () => {
  it('is its own inverse, so the link across always leads back', () => {
    for (const mode of MODES) {
      expect(OTHER_MODE[mode]).not.toBe(mode);
      expect(OTHER_MODE[OTHER_MODE[mode]]).toBe(mode);
    }
  });
});

describe('FRAMING', () => {
  it('gives every mode something to say and somewhere to go', () => {
    for (const mode of MODES) {
      const framing = FRAMING[mode];
      expect(framing.title.length).toBeGreaterThan(0);
      expect(framing.blurb.length).toBeGreaterThan(0);
      expect(framing.other.length).toBeGreaterThan(0);
    }
  });
});
