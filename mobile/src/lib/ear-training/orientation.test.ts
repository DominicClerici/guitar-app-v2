import { describe, expect, it } from 'vitest';

import { toneMidiFor } from './degrees';
import {
  ORIENTATION_DECAY_S,
  ORIENTATION_GAP_S,
  ORIENTATION_TOTAL_S,
  orientationSequence,
} from './orientation';

describe('orientationSequence', () => {
  it('is nine strikes', () => {
    expect(orientationSequence(0)).toHaveLength(9);
  });

  it('is the tonic triad across the three registers a question is drawn from', () => {
    const midis = orientationSequence(5).map((strike) => strike.midi);

    expect(midis).toEqual([
      toneMidiFor(5, 0, -1),
      toneMidiFor(5, 4, -1),
      toneMidiFor(5, 7, -1),
      toneMidiFor(5, 0, 0),
      toneMidiFor(5, 4, 0),
      toneMidiFor(5, 7, 0),
      toneMidiFor(5, 0, 1),
      toneMidiFor(5, 4, 1),
      toneMidiFor(5, 7, 1),
    ]);
  });

  it('climbs', () => {
    for (const tonicPc of [0, 3, 7, 11]) {
      const midis = orientationSequence(tonicPc).map((strike) => strike.midi);
      expect(midis.every((midi, index) => index === 0 || midi > midis[index - 1])).toBe(true);
    }
  });

  it('spaces the strikes evenly, starting on the beat it is scheduled for', () => {
    const delays = orientationSequence(0).map((strike) => strike.delay);

    expect(delays[0]).toBe(0);
    delays.forEach((delay, index) => {
      expect(delay).toBeCloseTo(index * ORIENTATION_GAP_S, 10);
    });
  });

  it('fits inside the two seconds the session budgets for it', () => {
    const last = orientationSequence(0).at(-1);

    expect(last?.delay).toBeLessThan(1.8);
    expect((last?.delay ?? 0) + ORIENTATION_DECAY_S).toBeLessThan(2.2);
    expect(ORIENTATION_TOTAL_S).toBeCloseTo((last?.delay ?? 0) + ORIENTATION_DECAY_S, 10);
  });
});
