import { describe, expect, it } from 'vitest';

import { revealRadius } from './reveal';

const SCREEN = { width: 400, height: 800 };

describe('revealRadius', () => {
  it('reaches the opposite corner from a corner', () => {
    expect(revealRadius({ x: 0, y: 0 }, SCREEN)).toBeCloseTo(Math.hypot(400, 800));
  });

  it('measures to the far corner, not the near one', () => {
    // Low on the right, where a settings control actually sits: the corner still to cover is the
    // top left, so the reach is the whole width and nearly the whole height.
    expect(revealRadius({ x: 380, y: 700 }, SCREEN)).toBeCloseTo(Math.hypot(380, 700));
  });

  it('is half the diagonal from the middle, which is the shortest it ever is', () => {
    const middle = revealRadius({ x: 200, y: 400 }, SCREEN);

    expect(middle).toBeCloseTo(Math.hypot(200, 400));

    for (const origin of [
      { x: 0, y: 0 },
      { x: 400, y: 0 },
      { x: 0, y: 800 },
      { x: 400, y: 800 },
      { x: 200, y: 0 },
      { x: 37, y: 613 },
    ]) {
      expect(revealRadius(origin, SCREEN)).toBeGreaterThanOrEqual(middle);
    }
  });

  it('covers every corner from wherever it starts', () => {
    const corners = [
      { x: 0, y: 0 },
      { x: SCREEN.width, y: 0 },
      { x: 0, y: SCREEN.height },
      { x: SCREEN.width, y: SCREEN.height },
    ];

    for (const origin of [
      { x: 12, y: 12 },
      { x: 199, y: 745 },
      { x: 400, y: 1 },
    ]) {
      const radius = revealRadius(origin, SCREEN);

      for (const corner of corners) {
        expect(Math.hypot(corner.x - origin.x, corner.y - origin.y)).toBeLessThanOrEqual(
          radius + 1e-9,
        );
      }
    }
  });
});
