import { describe, expect, it } from 'vitest';

import { isSettled, shownChoice } from './choice';

describe('shownChoice', () => {
  it('shows the store when nothing is pending', () => {
    expect(shownChoice('system', null)).toBe('system');
  });

  it('shows the choice while the store still holds what it was made from', () => {
    expect(shownChoice('system', { value: 'dark', from: 'system' })).toBe('dark');
  });

  it('shows the store once it has moved off what the choice was made from', () => {
    expect(shownChoice('dark', { value: 'dark', from: 'system' })).toBe('dark');
    // Overtaken by a pull rather than answered by the write: the store still wins.
    expect(shownChoice('light', { value: 'dark', from: 'system' })).toBe('light');
  });
});

describe('isSettled', () => {
  it('is not settled with nothing pending', () => {
    expect(isSettled('system', null)).toBe(false);
  });

  it('is not settled while the store still holds what the choice was made from', () => {
    expect(isSettled('system', { value: 'dark', from: 'system' })).toBe(false);
  });

  it('is settled once the store moves, however it moves', () => {
    expect(isSettled('dark', { value: 'dark', from: 'system' })).toBe(true);
    expect(isSettled('light', { value: 'dark', from: 'system' })).toBe(true);
  });

  /**
   * Choosing what is already set stores a row with a fresh timestamp but the same value, so the
   * store never moves and nothing settles it. The control is already showing that value, which is
   * why holding a pending choice that will never be dropped costs nothing — until the next choice
   * replaces it outright.
   */
  it('is not settled by a choice that changed nothing', () => {
    expect(isSettled('system', { value: 'system', from: 'system' })).toBe(false);
    expect(shownChoice('system', { value: 'system', from: 'system' })).toBe('system');
  });
});
