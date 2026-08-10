import { describe, expect, it } from 'vitest';

import { shuffled, type Rng } from './shuffle';

/** An rng that replays a script of rolls, then falls back to 0. */
const scripted = (rolls: number[]): Rng => {
  let index = 0;
  return () => rolls[index++] ?? 0;
};

describe('shuffled', () => {
  it('keeps every item, so no option can be lost from a question', () => {
    const options = ['a', 'b', 'c', 'd', 'e'];
    const out = shuffled(options, scripted([0.9, 0.1, 0.7, 0.3]));

    expect([...out].sort()).toEqual([...options].sort());
    expect(out).toHaveLength(options.length);
  });

  it('leaves the input untouched', () => {
    const options = ['a', 'b', 'c'];
    shuffled(options, scripted([0.9, 0.4]));

    expect(options).toEqual(['a', 'b', 'c']);
  });

  it('preserves identity, not position — the grader matches on the item itself', () => {
    const options = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const out = shuffled(options, scripted([0.99, 0.99]));

    for (const item of options) expect(out).toContain(item);
  });

  it('actually reorders', () => {
    // Index 2 swaps with 0 → c b a, then index 1 swaps with 0 → b c a.
    expect(shuffled(['a', 'b', 'c'], scripted([0.0, 0.0]))).toEqual(['b', 'c', 'a']);
  });

  it('handles the degenerate sizes a parser can still produce', () => {
    expect(shuffled([])).toEqual([]);
    expect(shuffled(['only'])).toEqual(['only']);
  });
});
