import { describe, expect, it } from 'vitest';

import {
  centreOf,
  pillFrame,
  shareOut,
  slotAt,
  slotsIn,
  squeezeAt,
  type PillSlide,
} from './pill-slide';

/** A three-slot tray 300 wide inside 3 points of padding, holding a 60-wide pill. */
const TRAY: PillSlide = {
  centre: 0,
  width: 60,
  height: 32,
  from: 3,
  to: 303,
  travel: 44,
  squeezeX: 0.14,
  squeezeY: 0.09,
};

/** The same run, as the three equal slots it divides into. */
const SLOTS = slotsIn([60, 60, 60], 300, 3);

describe('shareOut', () => {
  it('divides the run equally between options that all fit', () => {
    expect(shareOut([60, 60, 60], 300)).toEqual([100, 100, 100]);
    expect(shareOut([40, 90, 60], 300)).toEqual([100, 100, 100]);
  });

  it('gives a long option exactly what it asked for', () => {
    expect(shareOut([40, 40, 200], 240)).toEqual([20, 20, 200]);
  });

  it('takes the same amount off every other option, not off the neighbours', () => {
    // Each of the three shorter options wanted 60 and is cut to 40 — including
    // the one at the far end, which never sat next to the long one.
    expect(shareOut([60, 60, 160, 60], 280)).toEqual([40, 40, 160, 40]);
  });

  it('accommodates more than one long option', () => {
    expect(shareOut([120, 120, 40], 320)).toEqual([120, 120, 80]);
  });

  it('fills the run exactly, however it is divided', () => {
    for (const wants of [
      [60, 60, 60],
      [40, 40, 200],
      [120, 120, 40],
      [200, 200, 200],
    ]) {
      const total = shareOut(wants, 300).reduce((sum, width) => sum + width, 0);
      expect(total).toBeCloseTo(300);
    }
  });

  it('shrinks everything by the same fraction when nothing can fit', () => {
    expect(shareOut([100, 100, 100], 240)).toEqual([80, 80, 80]);
    expect(shareOut([100, 200], 150)).toEqual([50, 100]);
  });

  it('shares equally before anything has been measured', () => {
    expect(shareOut([0, 0], 200)).toEqual([100, 100]);
    expect(shareOut([], 200)).toEqual([]);
  });
});

describe('slotsIn', () => {
  it('lays the options end to end from the start of the run', () => {
    expect(slotsIn([60, 60, 60], 300, 3)).toEqual([
      { left: 3, width: 100 },
      { left: 103, width: 100 },
      { left: 203, width: 100 },
    ]);
  });

  it('leaves the same gutter at each end of the run', () => {
    const slots = slotsIn([40, 40, 200], 240, 3);
    const last = slots[slots.length - 1];
    expect(slots[0].left).toBe(3);
    expect(last.left + last.width).toBeCloseTo(243);
  });
});

describe('centreOf', () => {
  it('centres a pill filling its slot', () => {
    expect(centreOf({ left: 103, width: 100 })).toBe(153);
  });
});

describe('slotAt', () => {
  it('names the slot a point falls inside', () => {
    expect(slotAt(53, SLOTS)).toBe(0);
    expect(slotAt(153, SLOTS)).toBe(1);
    expect(slotAt(253, SLOTS)).toBe(2);
  });

  it('changes slot on the boundary between two of them', () => {
    expect(slotAt(102.9, SLOTS)).toBe(0);
    expect(slotAt(103, SLOTS)).toBe(1);
  });

  it('clamps to the end slots rather than running off either end', () => {
    expect(slotAt(-200, SLOTS)).toBe(0);
    expect(slotAt(900, SLOTS)).toBe(2);
  });

  it('survives being asked before the tray has been measured', () => {
    expect(slotAt(0, [])).toBe(0);
  });

  it('round-trips every slot through its own centre, equal or not', () => {
    const uneven = slotsIn([40, 40, 200], 240, 3);
    for (const slots of [SLOTS, uneven]) {
      slots.forEach((slot, index) => {
        expect(slotAt(centreOf(slot), slots)).toBe(index);
      });
    }
  });
});

describe('squeezeAt', () => {
  it('is nothing at all until the wall is passed', () => {
    expect(squeezeAt(0, 44)).toBe(0);
    expect(squeezeAt(-30, 44)).toBe(0);
  });

  it('is half pressed at one travel past the wall', () => {
    expect(squeezeAt(44, 44)).toBeCloseTo(0.5);
  });

  it('builds without ever arriving', () => {
    expect(squeezeAt(200, 44)).toBeGreaterThan(squeezeAt(100, 44));
    expect(squeezeAt(1e6, 44)).toBeLessThan(1);
  });
});

describe('pillFrame', () => {
  it('leaves a pill inside the run alone', () => {
    const frame = pillFrame({ ...TRAY, centre: 153 });
    expect(frame).toEqual({ left: 123, width: 60, height: 32 });
  });

  it('stops the pill at each wall', () => {
    expect(pillFrame({ ...TRAY, centre: 33 }).left).toBe(3);
    const far = pillFrame({ ...TRAY, centre: 273 });
    expect(far.left + far.width).toBe(303);
  });

  it('leaves the gutter it was given at each end, filling its own slot', () => {
    const slots = slotsIn([60, 60, 60], 300, 3);
    const first = pillFrame({ ...TRAY, width: slots[0].width, centre: centreOf(slots[0]) });
    const last = pillFrame({ ...TRAY, width: slots[2].width, centre: centreOf(slots[2]) });
    expect(first.left).toBe(3);
    expect(last.left + last.width).toBeCloseTo(303);
  });

  it('squeezes narrower and taller against the right wall, staying on it', () => {
    const frame = pillFrame({ ...TRAY, centre: 273 + TRAY.travel });
    expect(frame.width).toBeCloseTo(60 * (1 - 0.14 * 0.5));
    expect(frame.height).toBeCloseTo(32 * (1 + 0.09 * 0.5));
    expect(frame.left + frame.width).toBeCloseTo(303);
  });

  it('squeezes the same way against the left wall', () => {
    const frame = pillFrame({ ...TRAY, centre: 33 - TRAY.travel });
    expect(frame.width).toBeCloseTo(60 * (1 - 0.14 * 0.5));
    expect(frame.height).toBeCloseTo(32 * (1 + 0.09 * 0.5));
    expect(frame.left).toBeCloseTo(3);
  });

  it('goes on squeezing further out, and no further along', () => {
    const near = pillFrame({ ...TRAY, centre: 400 });
    const far = pillFrame({ ...TRAY, centre: 900 });
    expect(far.width).toBeLessThan(near.width);
    expect(far.height).toBeGreaterThan(near.height);
    expect(far.left + far.width).toBeCloseTo(303);
  });

  it('centres a pill with no room to travel, and does not squeeze it', () => {
    const frame = pillFrame({ ...TRAY, width: 400, centre: 900 });
    expect(frame).toEqual({ left: -47, width: 400, height: 32 });
  });
});
