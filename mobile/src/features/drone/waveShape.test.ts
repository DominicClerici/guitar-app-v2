import { describe, expect, it } from 'vitest';

import {
  cellHeight,
  shapeFor,
  snakePath,
  underPath,
  WAVE_SHAPES,
  wavesFor,
  type WaveShape,
} from './waveShape';

/** The two ends of the drone's own range: E with the octave down, D# with it up. */
const LOWEST = 28;
const HIGHEST = 63;

/** `[x, y]` pairs off a path, in the order they are drawn. */
function points(d: string): [number, number][] {
  return d
    .replace(/Z$/, '')
    .split(/[ML]/)
    .filter((pair) => pair.length > 0)
    .map((pair) => {
      const [x, y] = pair.split(' ').map(Number);
      return [x, y];
    });
}

/** The profile of one wave, sampled fine enough to find its lobes and its dip. */
function profile(shape: WaveShape): number[] {
  const steps = 2000;
  return Array.from({ length: steps + 1 }, (_, i) =>
    cellHeight(i / steps, shape.third, shape.tilt),
  );
}

/** The curve's slope at `along`, by central difference. */
function slope(along: number, shape: WaveShape): number {
  const h = 1e-6;
  return (
    (cellHeight(along + h, shape.third, shape.tilt) -
      cellHeight(along - h, shape.third, shape.tilt)) /
    (2 * h)
  );
}

/** How sharply the curve turns across `along`, over a step of `1 / 4000` of a wave. */
function turn(along: number, shape: WaveShape): number {
  const step = 1 / 4000;
  return Math.abs(slope(along + step / 2, shape) - slope(along - step / 2, shape));
}

describe('wavesFor', () => {
  it('draws one wave at the bottom of the range and six at the top', () => {
    expect(wavesFor(LOWEST)).toBeCloseTo(1, 6);
    expect(wavesFor(HIGHEST)).toBeCloseTo(6, 6);
  });

  it('scales with the octave rather than with the frequency', () => {
    // Halfway up the range in semitones is halfway up it in waves.
    expect(wavesFor((LOWEST + HIGHEST) / 2)).toBeCloseTo(3.5, 6);
  });

  it('rises with the pitch', () => {
    for (let pitch = LOWEST; pitch < HIGHEST; pitch += 1) {
      expect(wavesFor(pitch + 1)).toBeGreaterThan(wavesFor(pitch));
    }
  });

  it('holds at both ends for a note off the neck that sits outside the range', () => {
    expect(wavesFor(12)).toBe(1);
    expect(wavesFor(96)).toBe(6);
  });
});

describe('shapeFor', () => {
  it('falls back to the voice the drone opens on', () => {
    expect(shapeFor('nothing-by-that-name')).toBe(WAVE_SHAPES.warm);
  });
});

describe('cellHeight', () => {
  it('is on the centre line at both ends of a wave, in every voice', () => {
    for (const shape of Object.values(WAVE_SHAPES)) {
      expect(cellHeight(0, shape.third, shape.tilt)).toBeCloseTo(0, 12);
      expect(cellHeight(1, shape.third, shape.tilt)).toBeCloseTo(0, 12);
    }
  });

  it('hands the next wave the other side of the line, in every voice', () => {
    for (const shape of Object.values(WAVE_SHAPES)) {
      for (const u of [0.2, 0.5, 0.8]) {
        const here = cellHeight(u, shape.third, shape.tilt);
        expect(here).toBeGreaterThan(0);
        expect(cellHeight(1 + u, shape.third, shape.tilt)).toBeCloseTo(-here, 12);
        expect(cellHeight(2 + u, shape.third, shape.tilt)).toBeCloseTo(here, 12);
      }
    }
  });

  it('keeps to one side for the whole of a wave, so a crossing is only ever its end', () => {
    for (const shape of Object.values(WAVE_SHAPES)) {
      for (let i = 1; i < 400; i += 1) {
        expect(cellHeight(i / 400, shape.third, shape.tilt)).toBeGreaterThan(0);
      }
    }
  });

  it('turns no faster at a crossing than it does in the middle of a wave', () => {
    // A corner is a jump in the slope, and this is the test the lobes it replaced
    // could not pass: Warm arrived at a crossing vertically and Bowed arrived at
    // two different slopes from either side, so the line kinked as it crossed.
    for (const shape of Object.values(WAVE_SHAPES)) {
      let sharpest = 0;
      for (let i = 1; i < 4000; i += 1) {
        sharpest = Math.max(sharpest, turn(0.05 + (i / 4000) * 0.9, shape));
      }

      for (const crossing of [1, 2, 3]) {
        expect(turn(crossing, shape)).toBeLessThanOrEqual(sharpest);
      }
    }
  });

  it('stays inside the reach its voice is given, in every voice', () => {
    for (const shape of Object.values(WAVE_SHAPES)) {
      const reach = Math.max(...profile(shape)) * shape.rise;
      expect(reach).toBeLessThanOrEqual(1);
      // And uses it: a voice that never came near the line's full swing would read
      // as quieter than the others rather than as a different shape.
      expect(reach).toBeGreaterThan(0.85);
    }
  });

  it('stays inside that reach all the way through a morph between two voices', () => {
    const voices = Object.values(WAVE_SHAPES);

    for (const from of voices) {
      for (const to of voices) {
        for (let step = 0; step <= 20; step += 1) {
          const t = step / 20;
          const mix = (a: number, b: number) => a + (b - a) * t;
          const at = { third: mix(from.third, to.third), tilt: mix(from.tilt, to.tilt), rise: 0 };
          expect(Math.max(...profile(at)) * mix(from.rise, to.rise)).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('draws pure as one sine arc', () => {
    const { third, tilt } = WAVE_SHAPES.pure;
    for (const u of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      expect(cellHeight(u, third, tilt)).toBeCloseTo(Math.sin(Math.PI * u), 12);
    }
  });

  it('draws warm wider than it is tall', () => {
    const pure = WAVE_SHAPES.pure;
    const warm = WAVE_SHAPES.warm;
    const peak = Math.max(...profile(warm));

    // Same top, but reached sooner and held longer — an ellipse rather than a
    // circle. Read against its own peak, since a flatter arc also sits lower.
    expect(cellHeight(0.5, warm.third, warm.tilt) / peak).toBeCloseTo(1, 3);
    for (const u of [0.1, 0.2, 0.3]) {
      expect(cellHeight(u, warm.third, warm.tilt) / peak).toBeGreaterThan(
        cellHeight(u, pure.third, pure.tilt) + 0.05,
      );
    }
  });

  it('draws bowed as a short lobe, a dip, then a tall one', () => {
    const heights = profile(WAVE_SHAPES.bowed);
    const peak = Math.max(...heights);

    const turns: { kind: 'lobe' | 'dip'; at: number; height: number }[] = [];
    for (let i = 1; i < heights.length - 1; i += 1) {
      const [before, here, after] = [heights[i - 1], heights[i], heights[i + 1]];
      if (here > before && here >= after) turns.push({ kind: 'lobe', at: i, height: here / peak });
      if (here < before && here <= after && here > 0.02) {
        turns.push({ kind: 'dip', at: i, height: here / peak });
      }
    }

    expect(turns.map((each) => each.kind)).toEqual(['lobe', 'dip', 'lobe']);
    const [short, dip, tall] = turns;
    expect(tall.height).toBeCloseTo(1, 3);
    // The short lobe clears the dip it sits beside, so it reads as a lobe of its
    // own rather than as a shoulder on the way up.
    expect(short.height).toBeGreaterThan(dip.height + 0.1);
    expect(short.height).toBeLessThan(tall.height - 0.1);
  });
});

describe('snakePath', () => {
  const shape = WAVE_SHAPES.bowed;
  const WAVES = 3.4;
  const WIDTH = 320;
  const path = (phase: number, amplitude = 40) =>
    snakePath(WIDTH, WAVES, amplitude, phase, shape.third, shape.tilt);

  /** Where a crossing belongs on the screen, worked out the way the path does. */
  const crossingX = (crossing: number, phase: number) =>
    Math.round(((crossing - phase) / WAVES) * WIDTH * 10) / 10;

  it('draws one open line across the screen', () => {
    const d = path(0);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(false);
    // One move, and lines from there on: a stroked line rather than a closed band.
    expect(d.match(/M/g)).toHaveLength(1);

    const drawn = points(d);
    expect(drawn[0][0]).toBe(0);
    expect(drawn[drawn.length - 1][0]).toBe(WIDTH);
  });

  it('walks left to right, crossings included', () => {
    const drawn = points(path(0.6));
    for (let i = 1; i < drawn.length; i += 1) {
      expect(drawn[i][0]).toBeGreaterThanOrEqual(drawn[i - 1][0]);
    }
  });

  it('puts a point exactly on the centre at every crossing', () => {
    for (const phase of [0, 0.13, 0.6, 1.37, 2.5]) {
      const zeros = points(path(phase))
        .filter(([, y]) => y === 0)
        .map(([x]) => x);

      for (let crossing = Math.floor(phase) + 1; crossing < phase + WAVES; crossing += 1) {
        expect(zeros).toContain(crossingX(crossing, phase));
      }
    }
  });

  it('does not let the drift decide how near the centre the line gets', () => {
    // The mirrored band this replaced pinched to nothing at every wave boundary,
    // but only ever got as near as the closest sample fell — so sliding the drift
    // by a fraction of a step swung the neck open and shut, and it flickered.
    for (let i = 0; i < 200; i += 1) {
      const nearest = Math.min(...points(path(i / 37)).map(([, y]) => Math.abs(y)));
      expect(nearest).toBe(0);
    }
  });

  it('sends each wave to the opposite side of the line', () => {
    const drawn = points(path(0));
    const sideOf = (crossing: number) => {
      const [from, to] = [crossingX(crossing, 0), crossingX(crossing + 1, 0)];
      const within = drawn.filter(([x, y]) => x > from && x < to && y !== 0);
      return Math.sign(within[Math.floor(within.length / 2)][1]);
    };

    expect(sideOf(1)).toBe(-sideOf(0));
    expect(sideOf(2)).toBe(-sideOf(1));
  });

  it('fills the swing its voice was given, once the rise is in the amplitude', () => {
    // The caller folds `rise` into the amplitude, which is what levels the voices
    // against each other — a strong third partial adds height rather than moving it.
    for (const voice of Object.values(WAVE_SHAPES)) {
      const drawn = snakePath(WIDTH, WAVES, 40 * voice.rise, 0.37, voice.third, voice.tilt);
      const reach = Math.max(...points(drawn).map(([, y]) => Math.abs(y)));

      expect(reach).toBeLessThanOrEqual(40);
      expect(reach).toBeGreaterThan(30);
    }
  });

  it('comes back to the same picture two waves later, so the drift has no seam', () => {
    expect(path(4)).toBe(path(0));
    expect(path(2.6)).toBe(path(0.6));
    // One wave later the sides are swapped, which is what makes it a snake.
    expect(path(1.6)).not.toBe(path(0.6));
  });

  it('is flat with nothing sounding', () => {
    expect(points(path(0, 0)).every(([, y]) => y === 0)).toBe(true);
  });
});

describe('underPath', () => {
  const shape = WAVE_SHAPES.bowed;
  const line = snakePath(320, 3.4, 40, 0.6, shape.third, shape.tilt);

  it('closes the line back along the centre, without moving it', () => {
    const under = underPath(line, 320);
    expect(under.startsWith(line)).toBe(true);
    expect(under.slice(line.length)).toBe('L320 0L0 0Z');
  });

  it('rounds the far edge the way the line does, so the two meet', () => {
    const wide = snakePath(392.7272, 3.4, 40, 0.6, shape.third, shape.tilt);
    const drawn = points(wide);

    expect(underPath(wide, 392.7272).slice(wide.length)).toBe('L392.7 0L0 0Z');
    expect(drawn[drawn.length - 1][0]).toBe(392.7);
  });
});
