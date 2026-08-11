import { describe, expect, it } from 'vitest';

import {
  deriveCalibration,
  medianOf,
  MAX_USABLE_THRESHOLD,
  NOMINAL_LATENCY_MS,
  pairClicks,
  pairWindowMs,
  percentileOf,
  refractoryMsFor,
  type ClickPair,
} from './calibration';

/** A quiet room, sampled between clicks. */
const QUIET = [0.002, 0.003, 0.002, 0.004, 0.003];

function pairsAt(latencies: number[], peak: number): ClickPair[] {
  return latencies.map((latencyMs, index) => ({
    scheduledAtMs: index * 500,
    heardAtMs: index * 500 + latencyMs,
    peak,
    latencyMs,
  }));
}

describe('medianOf', () => {
  it('is the middle of an odd list and the mean of the middle two of an even one', () => {
    expect(medianOf([3, 1, 2])).toBe(2);
    expect(medianOf([4, 1, 2, 3])).toBe(2.5);
    expect(medianOf([])).toBeNull();
  });
});

describe('percentileOf', () => {
  it('returns a value that was actually observed', () => {
    expect(percentileOf([0.01, 0.02, 0.03, 0.04, 0.05], 0.25)).toBe(0.02);
    expect(percentileOf([0.01, 0.02, 0.03, 0.04, 0.05], 0)).toBe(0.01);
    expect(percentileOf([0.01, 0.02, 0.03, 0.04, 0.05], 1)).toBe(0.05);
    expect(percentileOf([], 0.25)).toBeNull();
  });
});

describe('pairClicks', () => {
  it('attributes each click to the onset it produced', () => {
    const pairs = pairClicks(
      [1000, 1500, 2000],
      [
        { at: 1042, peak: 0.02 },
        { at: 1541, peak: 0.021 },
        { at: 2043, peak: 0.019 },
      ],
      300,
    );

    expect(pairs.map((pair) => pair.latencyMs)).toEqual([42, 41, 43]);
    expect(pairs.map((pair) => pair.peak)).toEqual([0.02, 0.021, 0.019]);
  });

  it('lets a click go unpaired rather than reaching past its window', () => {
    const pairs = pairClicks(
      [1000, 1500],
      [
        { at: 1040, peak: 0.02 },
        // A pick, half a second after the second click. Outside the window, so unattributed.
        { at: 1900, peak: 0.3 },
      ],
      200,
    );

    expect(pairs).toHaveLength(1);
    expect(pairs[0].scheduledAtMs).toBe(1000);
  });

  it('never spends the same onset on two clicks', () => {
    const pairs = pairClicks([1000, 1500], [{ at: 1490, peak: 0.02 }], 600);

    // 1490 is inside both windows; only the first click gets it.
    expect(pairs).toHaveLength(1);
    expect(pairs[0].scheduledAtMs).toBe(1000);
  });

  it('accepts an onset timestamped just before its click', () => {
    // The onset carries the start of the hop whose envelope crossed, which can precede the
    // transient that crossed it.
    const pairs = pairClicks([1000], [{ at: 994, peak: 0.02 }], 300);

    expect(pairs).toHaveLength(1);
    expect(pairs[0].latencyMs).toBe(-6);
  });

  it('keeps its window well inside one click', () => {
    expect(pairWindowMs(500)).toBe(300);
    expect(pairWindowMs(200)).toBe(120);
  });
});

describe('deriveCalibration', () => {
  it('takes the median round trip, so one bad detection cannot move it', () => {
    const result = deriveCalibration({
      noiseRms: QUIET,
      pairs: pairsAt([44, 41, 260, 43, 42], 0.02),
    });

    expect(result.latencySource).toBe('measured');
    expect(result.latencyMs).toBe(43);
  });

  it('falls back to the nominal round trip when no click came back', () => {
    const result = deriveCalibration({ noiseRms: QUIET, pairs: [] });

    expect(result.latencySource).toBe('nominal');
    expect(result.latencyMs).toBe(NOMINAL_LATENCY_MS);
    expect(result.clickPeak).toBeNull();
    expect(result.headroom.ok).toBe(true);
  });

  it('will not call two clicks a measurement', () => {
    const result = deriveCalibration({ noiseRms: QUIET, pairs: pairsAt([44, 41], 0.02) });

    expect(result.latencySource).toBe('nominal');
  });

  it('never trusts a negative round trip', () => {
    const result = deriveCalibration({ noiseRms: QUIET, pairs: pairsAt([-6, -4, -5], 0.02) });

    expect(result.latencyMs).toBe(0);
  });

  it('takes the noise floor low in the distribution, below the click-contaminated frames', () => {
    const result = deriveCalibration({
      // Four quiet frames and four with a click inside their 93ms window.
      noiseRms: [0.002, 0.002, 0.003, 0.003, 0.05, 0.06, 0.05, 0.06],
      pairs: pairsAt([40, 42, 41], 0.02),
    });

    expect(result.noiseFloor).toBe(0.003);
  });

  it('sets the threshold above the click bleed', () => {
    const result = deriveCalibration({ noiseRms: QUIET, pairs: pairsAt([40, 42, 41], 0.02) });

    expect(result.clickPeak).toBe(0.02);
    expect(result.threshold).toBe(0.04);
    expect(result.headroom.ok).toBe(true);
  });

  it('sets it above the room when the room is the louder of the two', () => {
    const result = deriveCalibration({
      noiseRms: [0.01, 0.01, 0.01],
      pairs: pairsAt([40, 42, 41], 0.002),
    });

    expect(result.threshold).toBe(0.04);
  });

  it('has a floor, so a silent room does not arm the detector on the converter', () => {
    const result = deriveCalibration({ noiseRms: [0, 0, 0], pairs: [] });

    expect(result.threshold).toBe(0.012);
  });

  it('still has headroom at the exact limit', () => {
    const result = deriveCalibration({ noiseRms: QUIET, pairs: pairsAt([40, 42, 41], 0.03) });

    expect(result.threshold).toBe(MAX_USABLE_THRESHOLD);
    expect(result.headroom).toEqual({ ok: true });
  });

  it('refuses one step past it, and names the click', () => {
    const result = deriveCalibration({ noiseRms: QUIET, pairs: pairsAt([40, 42, 41], 0.031) });

    expect(result.threshold).toBeGreaterThan(MAX_USABLE_THRESHOLD);
    expect(result.headroom).toEqual({ ok: false, reason: 'click-too-loud' });
  });

  it('names the room when the room is what used the headroom up', () => {
    const result = deriveCalibration({
      noiseRms: [0.02, 0.02, 0.02],
      pairs: pairsAt([40, 42, 41], 0.002),
    });

    expect(result.headroom).toEqual({ ok: false, reason: 'room-too-noisy' });
  });
});

describe('refractoryMsFor', () => {
  it('stays shorter than the slot it has to fit between, at any tempo', () => {
    // 300 bpm sixteenths — the fastest grid the schema allows.
    expect(refractoryMsFor(50)).toBe(40);
    expect(refractoryMsFor(50)).toBeLessThan(50);
    // 60 bpm quarters — the slowest. Capped rather than a whole second wide.
    expect(refractoryMsFor(1000)).toBe(90);
    expect(refractoryMsFor(120)).toBe(72);
  });
});
