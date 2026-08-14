import { describe, expect, it } from 'vitest';

import {
  describeValues,
  generatePattern,
  slotsFor,
  subdivisionFor,
  type NoteValue,
} from './patternGenerator';

/** A draw that walks a fixed list, so what gets composed is a thing a test can state exactly. */
function fixedRng(sequence: number[]): () => number {
  let index = 0;
  return () => sequence[index++ % sequence.length];
}

/** Always the first value that fits, and never a rest. */
const FIRST = fixedRng([0, 0.99]);

describe('subdivisionFor', () => {
  it('is one slot per beat when nothing shorter than a beat is in play', () => {
    expect(subdivisionFor(['whole', 'half', 'quarter'])).toBe(1);
  });

  it('is the lowest common denominator of the values in play', () => {
    expect(subdivisionFor(['quarter', 'eighth'])).toBe(2);
    expect(subdivisionFor(['quarter', 'sixteenth'])).toBe(4);
    expect(subdivisionFor(['eighth', 'triplet-eighth'])).toBe(6);
    expect(subdivisionFor(['sixteenth', 'triplet-eighth'])).toBe(12);
  });

  it('takes dotted values into account', () => {
    expect(subdivisionFor(['dotted-quarter'])).toBe(2);
    expect(subdivisionFor(['dotted-eighth'])).toBe(4);
  });

  it('answers one for an empty selection rather than throwing', () => {
    expect(subdivisionFor([])).toBe(1);
  });
});

describe('slotsFor', () => {
  it('is a whole number of slots at the subdivision its own value implies', () => {
    const values: NoteValue[] = [
      'whole',
      'half',
      'dotted-quarter',
      'quarter',
      'dotted-eighth',
      'eighth',
      'triplet-eighth',
      'sixteenth',
    ];

    for (const value of values) {
      const slots = slotsFor(value, subdivisionFor([value]));
      expect(Number.isInteger(slots)).toBe(true);
      expect(slots).toBeGreaterThan(0);
    }
  });

  it('scales with the grid, so a half note is twice a quarter however fine it is drawn', () => {
    expect(slotsFor('half', 4)).toBe(8);
    expect(slotsFor('quarter', 4)).toBe(4);
    expect(slotsFor('sixteenth', 4)).toBe(1);
  });
});

describe('generatePattern', () => {
  it('fills every bar exactly', () => {
    const { slots, subdivision } = generatePattern(
      { values: ['quarter', 'eighth'], rests: false, beatsPerBar: 4, bars: 2 },
      FIRST,
    );

    expect(subdivision).toBe(2);
    expect(slots).toHaveLength(2 * 4 * 2);
  });

  it('writes a value as one hit followed by the rest of its length', () => {
    // Half notes on an eighth-note grid: each is a hit and three silent slots, and the silence is
    // the note still sounding rather than a rest anyone has to play.
    const { slots } = generatePattern(
      { values: ['half'], rests: false, beatsPerBar: 4, bars: 1 },
      FIRST,
    );

    expect(subdivisionFor(['half'])).toBe(1);
    expect(slots).toEqual(['accent', 'rest', 'hit', 'rest']);
  });

  it('draws from every value that still fits the space left in the bar', () => {
    // Halves and eighths, alternating draws: a half opens the bar, then an eighth, and once only
    // three eighths of room remain the half stops being offered at all.
    const { slots } = generatePattern(
      { values: ['half', 'eighth'], rests: false, beatsPerBar: 4, bars: 1 },
      fixedRng([0, 0.99]),
    );

    expect(slots).toEqual(['accent', 'rest', 'rest', 'rest', 'hit', 'hit', 'hit', 'hit']);
  });

  it('accents the downbeat of every bar that has a hit on it', () => {
    const { slots } = generatePattern(
      { values: ['quarter'], rests: false, beatsPerBar: 4, bars: 2 },
      FIRST,
    );

    expect(slots[0]).toBe('accent');
    expect(slots[4]).toBe('accent');
    expect(slots.filter((slot) => slot === 'accent')).toHaveLength(2);
  });

  it('never opens the pattern with silence', () => {
    // A draw that would spend everything on rests if it were allowed to.
    const { slots } = generatePattern(
      { values: ['quarter'], rests: true, beatsPerBar: 4, bars: 1 },
      fixedRng([0, 0]),
    );

    expect(slots[0]).toBe('accent');
    expect(slots.slice(1)).toEqual(['rest', 'rest', 'rest']);
  });

  it('uses only the values it was given', () => {
    // Quarters and sixteenths, drawn alternately. Every gap between one hit and the next must be
    // one of those two lengths — four slots or one — and never an eighth's two.
    const { slots, subdivision } = generatePattern(
      { values: ['quarter', 'sixteenth'], rests: false, beatsPerBar: 4, bars: 2 },
      fixedRng([0, 0.99, 0.9, 0.99]),
    );

    expect(subdivision).toBe(4);

    const hits = slots.flatMap((slot, index) => (slot === 'rest' ? [] : [index]));
    const gaps = hits.slice(1).map((at, index) => at - hits[index]);

    expect(gaps.every((gap) => gap === 4 || gap === 1)).toBe(true);
  });

  it('fills a remainder no value fits with rests', () => {
    // Half notes in three: one fits, and the beat left over cannot hold another.
    const { slots } = generatePattern(
      { values: ['half'], rests: false, beatsPerBar: 3, bars: 1 },
      FIRST,
    );

    expect(slots).toEqual(['accent', 'rest', 'rest']);
  });

  it('produces a bar of rests when nothing was selected', () => {
    const { slots, subdivision } = generatePattern(
      { values: [], rests: false, beatsPerBar: 4, bars: 1 },
      FIRST,
    );

    expect(subdivision).toBe(1);
    expect(slots).toEqual(['rest', 'rest', 'rest', 'rest']);
  });
});

describe('describeValues', () => {
  it('reads the values back in note order, not the order they were picked', () => {
    expect(describeValues(['eighth', 'half'])).toBe('half and eighth');
  });

  it('names a single value on its own', () => {
    expect(describeValues(['quarter'])).toBe('quarter');
  });

  it('says so when there is nothing to compose from', () => {
    expect(describeValues([])).toBe('no note values');
  });
});
