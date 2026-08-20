import { describe, expect, it } from 'vitest';

import { revealBleed, revealFrame, type Frame, type Point } from './reveal';

const SCREEN = { width: 400, height: 800 };
const SEED = 40;
const BLEED = 32;

const ORIGINS = [
  { x: 200, y: 400 },
  { x: 12, y: 12 },
  { x: 199, y: 745 },
  { x: 400, y: 1 },
  { x: 0, y: 0 },
  { x: 37, y: 613 },
];

/** How far inside the rounded outline a point sits, along the diagonal it is nearest. */
function depth(frame: Frame, corner: number, point: Point): number {
  const across = Math.min(point.x - frame.x, frame.x + frame.width - point.x);
  const down = Math.min(point.y - frame.y, frame.y + frame.height - point.y);

  // Out in the rounded corner, where the arc decides, or against a straight run, where the nearer
  // edge does.
  if (across >= corner || down >= corner) return Math.min(across, down);

  return corner - Math.hypot(corner - across, corner - down);
}

describe('revealFrame', () => {
  it('starts as a square on the press', () => {
    for (const origin of ORIGINS) {
      const frame = revealFrame(origin, SCREEN, SEED, BLEED, 0);

      expect(frame).toEqual({ x: origin.x - 20, y: origin.y - 20, width: SEED, height: SEED });
    }
  });

  it('ends on the screen, pushed out by the bleed on every side', () => {
    for (const origin of ORIGINS) {
      const frame = revealFrame(origin, SCREEN, SEED, BLEED, 1);

      expect(frame.x).toBeCloseTo(-BLEED);
      expect(frame.y).toBeCloseTo(-BLEED);
      expect(frame.x + frame.width).toBeCloseTo(SCREEN.width + BLEED);
      expect(frame.y + frame.height).toBeCloseTo(SCREEN.height + BLEED);
    }
  });

  it("starts with no proportions of its own and lands on the screen's", () => {
    const origin = { x: 199, y: 745 };

    expect(revealFrame(origin, SCREEN, SEED, BLEED, 0).width).toBeCloseTo(
      revealFrame(origin, SCREEN, SEED, BLEED, 0).height,
    );

    const landed = revealFrame(origin, SCREEN, SEED, BLEED, 1);

    expect(landed.width / landed.height).toBeCloseTo(
      (SCREEN.width + 2 * BLEED) / (SCREEN.height + 2 * BLEED),
    );
  });

  it('only ever grows, whichever edge the press is nearest', () => {
    for (const origin of ORIGINS) {
      let last = revealFrame(origin, SCREEN, SEED, BLEED, 0);

      for (let step = 1; step <= 20; step += 1) {
        const frame = revealFrame(origin, SCREEN, SEED, BLEED, step / 20);

        expect(frame.x).toBeLessThanOrEqual(last.x + 1e-9);
        expect(frame.y).toBeLessThanOrEqual(last.y + 1e-9);
        expect(frame.x + frame.width).toBeGreaterThanOrEqual(last.x + last.width - 1e-9);
        expect(frame.y + frame.height).toBeGreaterThanOrEqual(last.y + last.height - 1e-9);

        last = frame;
      }
    }
  });
});

describe('revealBleed', () => {
  it('leaves the soft edge off the screen, corners included', () => {
    for (const corner of [0, 16, 56, 96]) {
      for (const feather of [4, 16, 32]) {
        const bleed = revealBleed(corner, feather);
        const landed = revealFrame({ x: 200, y: 400 }, SCREEN, SEED, bleed, 1);

        // The screen's own corner is the shallowest point under a rounded outline, so it is the one
        // that has to clear the blur's inward reach.
        expect(depth(landed, corner, { x: 0, y: 0 })).toBeGreaterThanOrEqual(2 * feather - 1e-9);
      }
    }
  });

  it("is the blur's own reach once there is no rounding to cut the diagonal", () => {
    expect(revealBleed(0, 16)).toBeCloseTo(32);
  });
});
