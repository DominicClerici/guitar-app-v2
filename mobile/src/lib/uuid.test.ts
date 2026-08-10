import { describe, expect, it } from 'vitest';

import { uuidv7 } from './uuid';

const V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * The generator's monotonic clamp is module state, so a test that passed a timestamp in the past
 * would silently be given the previous test's instead. Every explicit timestamp here is therefore
 * far beyond `Date.now()`, and later cases sit after earlier ones.
 */
const FUTURE = 0x0292_3456_789a;

describe('uuidv7', () => {
  it('has the v7 shape, version nibble and variant bits', () => {
    for (let i = 0; i < 200; i += 1) expect(uuidv7()).toMatch(V7);
  });

  it('encodes the millisecond in the leading 48 bits', () => {
    const id = uuidv7(FUTURE);

    expect(id.slice(0, 8)).toBe('02923456');
    expect(id.slice(9, 13)).toBe('789a');
  });

  it('mints distinct values within one millisecond', () => {
    const ids = new Set(Array.from({ length: 1_000 }, () => uuidv7(FUTURE)));

    expect(ids.size).toBe(1_000);
  });

  it('stays increasing when the clock steps backwards', () => {
    const first = uuidv7(FUTURE + 1_000);
    const second = uuidv7(FUTURE - 1_000_000);

    expect(second > first).toBe(true);
  });

  it('sorts lexicographically in the order values were minted', () => {
    const ids = Array.from({ length: 5_000 }, () => uuidv7(FUTURE + 2_000));

    for (let i = 1; i < ids.length; i += 1) expect(ids[i] > ids[i - 1]).toBe(true);
  });
});
