import { describe, expect, it } from 'vitest';

import type { RhythmSlot } from '@/lib/content';

import { barsOf, buildGrid, describePattern, type GridSpec } from './rhythmGrid';

function spec(over: Partial<GridSpec> = {}): GridSpec {
  return {
    bpm: 120,
    beatsPerBar: 4,
    subdivision: 1,
    bars: 1,
    slots: ['hit', 'rest', 'hit', 'rest'],
    ...over,
  };
}

const fill = (count: number, kind: RhythmSlot = 'hit'): RhythmSlot[] =>
  Array.from({ length: count }, () => kind);

describe('buildGrid', () => {
  it('spaces quarters one beat apart', () => {
    const grid = buildGrid(spec());

    expect(grid.slotMs).toBe(500);
    expect(grid.beatMs).toBe(500);
    expect(grid.barMs).toBe(2000);
    expect(grid.patternMs).toBe(2000);
    expect(grid.slots.map((slot) => slot.atMs)).toEqual([0, 500, 1000, 1500]);
    expect(grid.slots.map((slot) => slot.expectsHit)).toEqual([true, false, true, false]);
  });

  it('splits a beat into eighths and keeps the beat and subdivision indices', () => {
    const grid = buildGrid(spec({ subdivision: 2, slots: fill(8) }));

    expect(grid.slotMs).toBe(250);
    expect(grid.slots.map((slot) => slot.atMs)).toEqual([0, 250, 500, 750, 1000, 1250, 1500, 1750]);
    expect(grid.slots.map((slot) => slot.beat)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
    expect(grid.slots.map((slot) => slot.sub)).toEqual([0, 1, 0, 1, 0, 1, 0, 1]);
  });

  it('handles a triplet subdivision without accumulating the repeating slot length', () => {
    const grid = buildGrid(spec({ bpm: 90, beatsPerBar: 2, subdivision: 3, slots: fill(6) }));

    // 60000/90/3 does not divide evenly; a running sum would drift by the sixth slot.
    expect(grid.slotMs).toBeCloseTo(222.2222, 4);
    expect(grid.slots[5].atMs).toBeCloseTo(5 * grid.slotMs, 10);
    expect(grid.slots[5].atMs).toBeCloseTo(1111.1111, 4);
    expect(grid.patternMs).toBeCloseTo(grid.barMs, 10);
  });

  it('accents an accent slot as a hit — the drill grades when, not how hard', () => {
    const grid = buildGrid(spec({ slots: ['accent', 'rest', 'hit', 'accent'] }));

    expect(grid.slots.map((slot) => slot.expectsHit)).toEqual([true, false, true, true]);
  });

  it('numbers bars across a multi-bar pattern', () => {
    const grid = buildGrid(spec({ bars: 2, slots: fill(8) }));

    expect(grid.slots.map((slot) => slot.bar)).toEqual([0, 0, 0, 0, 1, 1, 1, 1]);
    expect(barsOf(grid)).toHaveLength(2);
    expect(barsOf(grid)[1].map((slot) => slot.index)).toEqual([4, 5, 6, 7]);
  });
});

describe('the click plan', () => {
  it('puts the count-in before the downbeat and closes the last bar', () => {
    const grid = buildGrid(spec());

    expect(grid.countInMs).toBe(2000);
    expect(grid.clicks.map((click) => click.atMs)).toEqual([
      -2000, -1500, -1000, -500, 0, 500, 1000, 1500, 2000,
    ]);
    expect(grid.clicks.map((click) => click.accent)).toEqual([
      true,
      false,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
    ]);
  });

  it('counts in two bars when the round asks for them', () => {
    const grid = buildGrid(spec({ countInBars: 2 }));

    expect(grid.countInMs).toBe(4000);
    expect(grid.clicks[0].atMs).toBe(-4000);
    expect(grid.clicks[0].accent).toBe(true);
  });

  it('omits the count-in entirely when the round asks for none', () => {
    const grid = buildGrid(spec({ countInBars: 0 }));

    expect(grid.countInMs).toBe(0);
    expect(grid.clicks[0].atMs).toBe(0);
  });

  it('sounds every beat rather than the pattern', () => {
    const grid = buildGrid(spec({ subdivision: 4, slots: fill(16), countInBars: 0 }));

    expect(grid.slots).toHaveLength(16);
    // Four beats plus the one that closes the bar — not sixteen.
    expect(grid.clicks).toHaveLength(5);
  });
});

describe('describePattern', () => {
  it('reads the pattern out bar by bar', () => {
    const grid = buildGrid(spec({ slots: ['accent', 'rest', 'hit', 'rest'] }));

    expect(describePattern(grid)).toBe(
      '1 bar at 120 beats per minute. Bar 1: play hard, rest, play, rest.',
    );
  });
});
