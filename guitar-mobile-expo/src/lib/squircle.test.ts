import { describe, expect, it } from 'vitest';

import { APPLE_SMOOTHING, cornerReach, squirclePath } from './squircle';

/** Walk the path, summing the relative segments, to find where it ends up. */
function trace(path: string) {
  const tokens = path.split(' ');
  let x = 0;
  let y = 0;
  const points: { x: number; y: number }[] = [];
  let i = 0;

  const take = () => Number(tokens[i++]);

  while (i < tokens.length) {
    const command = tokens[i++];
    switch (command) {
      case 'M':
        x = take();
        y = take();
        break;
      case 'c':
        // Only the end point of a cubic moves the pen.
        take();
        take();
        take();
        take();
        x += take();
        y += take();
        break;
      case 'a':
        take();
        take();
        take();
        take();
        take();
        x += take();
        y += take();
        break;
      case 'l':
        x += take();
        y += take();
        break;
      case 'h':
        x += take();
        break;
      case 'v':
        y += take();
        break;
      case 'Z':
        break;
      default:
        throw new Error(`unexpected path command: ${command}`);
    }
    points.push({ x, y });
  }

  return points;
}

const CLOSE = 0.01;

describe('squirclePath', () => {
  it('comes back around to the top edge it started on, for Z to close', () => {
    const points = trace(squirclePath({ width: 200, height: 120, radius: 16 }));
    const start = points[0]!;
    const end = points[points.length - 1]!;

    expect(start.y).toBeCloseTo(0, 2);
    expect(end.y).toBeCloseTo(0, 2);
    // Both ends sit one corner's reach in from their own edge.
    expect(200 - start.x).toBeCloseTo(cornerReach(16), 2);
    expect(end.x).toBeCloseTo(cornerReach(16), 2);
  });

  it('stays inside the box and touches all four edges', () => {
    const points = trace(squirclePath({ width: 200, height: 120, radius: 16 }));
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);

    expect(Math.min(...xs)).toBeCloseTo(0, 2);
    expect(Math.min(...ys)).toBeCloseTo(0, 2);
    expect(Math.max(...xs)).toBeCloseTo(200, 2);
    expect(Math.max(...ys)).toBeCloseTo(120, 2);
  });

  it('is a plain rounded rectangle at zero smoothing', () => {
    const path = squirclePath({ width: 100, height: 100, radius: 20, smoothing: 0 });

    // Every ramp collapses, leaving four quarter-circle arcs of the full radius.
    expect(path).toContain('c 0 0 0 0 0 0');
    expect(path).toContain('a 20 20 0 0 1 20 20');
    // The corner takes exactly its radius off the edge, so 60 is left of 100.
    expect(path).toContain('l 0 60');
  });

  it('reaches further along the edge as smoothing rises', () => {
    const reach = (smoothing: number) => {
      const start = trace(squirclePath({ width: 200, height: 120, radius: 16, smoothing }))[0]!;
      return 200 - start.x;
    };

    expect(reach(0)).toBeCloseTo(16, 2);
    expect(reach(0.5)).toBeCloseTo(24, 2);
    expect(reach(1)).toBeCloseTo(32, 2);
    expect(reach(APPLE_SMOOTHING)).toBeCloseTo(cornerReach(16), 2);
  });

  it('keeps the corner symmetric about its diagonal', () => {
    // The top-right corner spans the same distance on both axes: it ends one
    // full reach down the right edge from the top.
    const [, ...rest] = trace(squirclePath({ width: 200, height: 200, radius: 24 }));
    const cornerEnd = rest[2]!;

    expect(cornerEnd.x).toBeCloseTo(200, 2);
    expect(cornerEnd.y).toBeCloseTo(cornerReach(24), 2);
  });

  it('clamps a radius and a reach that will not fit', () => {
    // A 24px-tall pill: the radius is capped at half the height, and the corner
    // would want 12 · 1.6 = 19.2 of reach from a 12px budget.
    const points = trace(squirclePath({ width: 90, height: 24, radius: 13 }));

    expect(90 - points[0]!.x).toBeCloseTo(12, 2);
    expect(points[points.length - 1]!.x).toBeCloseTo(12, 2);
    expect(Math.max(...points.map((point) => point.y))).toBeCloseTo(24, 2);
    expect(Math.max(...points.map((point) => point.x))).toBeCloseTo(90, 2);
  });

  it('offsets the whole path by x and y', () => {
    const plain = trace(squirclePath({ width: 40, height: 40, radius: 8 }))[0]!;
    const moved = trace(squirclePath({ width: 40, height: 40, radius: 8, x: 0.5, y: 0.5 }))[0]!;

    expect(moved.x - plain.x).toBeCloseTo(0.5, 3);
    expect(moved.y - plain.y).toBeCloseTo(0.5, 3);
  });

  it('degenerates to a rectangle at zero radius and to nothing with no size', () => {
    expect(squirclePath({ width: 10, height: 10, radius: 0 })).toBe('M 0 0 h 10 v 10 h -10 Z');
    expect(squirclePath({ width: 0, height: 10, radius: 4 })).toBe('');
  });

  it('never wanders outside the box, however extreme the smoothing', () => {
    for (const smoothing of [0, 0.3, APPLE_SMOOTHING, 0.9, 1]) {
      const points = trace(squirclePath({ width: 64, height: 40, radius: 12, smoothing }));
      for (const { x, y } of points) {
        expect(x).toBeGreaterThanOrEqual(-CLOSE);
        expect(y).toBeGreaterThanOrEqual(-CLOSE);
        expect(x).toBeLessThanOrEqual(64 + CLOSE);
        expect(y).toBeLessThanOrEqual(40 + CLOSE);
      }
    }
  });
});
