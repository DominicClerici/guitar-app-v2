import { describe, expect, it } from 'vitest';

import { repaintBatches } from './repaint';

/** The app's own six, and the ends and middle of it, which are the cases that differ. */
const COUNT = 6;
const ACTIVE = [0, 1, 2, 3, 4, 5];

/** Every page the walk visits, in the order it visits them. */
function visited(active: number, count: number): number[] {
  return repaintBatches(active, count).flat();
}

describe('repaintBatches', () => {
  it('visits every page but the active one, exactly once', () => {
    for (const active of ACTIVE) {
      const pages = visited(active, COUNT);
      const expected = ACTIVE.filter((index) => index !== active);

      expect([...pages].sort()).toEqual(expected);
    }
  });

  it('never visits the active page, which is painted during render instead', () => {
    for (const active of ACTIVE) {
      expect(visited(active, COUNT)).not.toContain(active);
    }
  });

  it('paints the neighbours first and together, as the only pages a swipe can reach', () => {
    expect(repaintBatches(2, COUNT)[0]).toEqual([1, 3]);
    expect(repaintBatches(4, COUNT)[0]).toEqual([3, 5]);
  });

  it('paints the one neighbour an end page has, rather than reaching past it', () => {
    expect(repaintBatches(0, COUNT)[0]).toEqual([1]);
    expect(repaintBatches(5, COUNT)[0]).toEqual([4]);
  });

  it('paints one page per frame after the neighbours, so no frame carries two screens', () => {
    for (const active of ACTIVE) {
      const [, ...rest] = repaintBatches(active, COUNT);

      for (const batch of rest) expect(batch).toHaveLength(1);
    }
  });

  it('works outwards, so a page two swipes away is painted before one five away', () => {
    expect(repaintBatches(2, COUNT)).toEqual([[1, 3], [0], [4], [5]]);
    expect(repaintBatches(0, COUNT)).toEqual([[1], [2], [3], [4], [5]]);
    expect(repaintBatches(5, COUNT)).toEqual([[4], [3], [2], [1], [0]]);
  });

  it('has nothing to do when the active page is the only one', () => {
    expect(repaintBatches(0, 1)).toEqual([]);
  });
});
