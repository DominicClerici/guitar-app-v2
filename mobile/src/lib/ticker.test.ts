import { describe, expect, it } from 'vitest';

import { clampTo, parseTyped, stepTo, type Range } from './ticker';

/** The drone's octave shift: three values, a step apart. */
const OCTAVE: Range = { min: -1, max: 1, step: 1 };

/** A tempo, for the ranges wide enough to hold an off-grid number. */
const TEMPO: Range = { min: 40, max: 240, step: 5 };

describe('clampTo', () => {
  it('leaves a value inside the range alone', () => {
    expect(clampTo(0, OCTAVE)).toBe(0);
    expect(clampTo(120, TEMPO)).toBe(120);
  });

  it('pulls a value back to whichever end it ran past', () => {
    expect(clampTo(-9, OCTAVE)).toBe(-1);
    expect(clampTo(9, OCTAVE)).toBe(1);
  });

  it('leaves an off-grid value where it is', () => {
    expect(clampTo(43, TEMPO)).toBe(43);
  });
});

describe('stepTo', () => {
  it('moves one step in the direction it is given', () => {
    expect(stepTo(0, 1, OCTAVE)).toBe(1);
    expect(stepTo(0, -1, OCTAVE)).toBe(-1);
    expect(stepTo(120, 1, TEMPO)).toBe(125);
  });

  it('stops at each end rather than running past it', () => {
    expect(stepTo(1, 1, OCTAVE)).toBe(1);
    expect(stepTo(-1, -1, OCTAVE)).toBe(-1);
  });

  it('steps by the same amount from an off-grid value', () => {
    expect(stepTo(43, 1, TEMPO)).toBe(48);
  });

  it('lands on the end from a value a part-step away from it', () => {
    expect(stepTo(238, 1, TEMPO)).toBe(240);
  });

  // 0.1 + 0.2 is 0.30000000000000004, which would read out as that.
  it('keeps a fractional step from drifting off its own decimals', () => {
    const gain: Range = { min: 0, max: 1, step: 0.1 };
    expect(stepTo(0.2, 1, gain)).toBe(0.3);
    expect(stepTo(0.7, 1, gain)).toBe(0.8);
  });
});

describe('parseTyped', () => {
  it('takes a number as typed', () => {
    expect(parseTyped('120', TEMPO)).toBe(120);
    expect(parseTyped('  96  ', TEMPO)).toBe(96);
  });

  it('takes a negative, which is the only way to type one end of a shift', () => {
    expect(parseTyped('-1', OCTAVE)).toBe(-1);
  });

  it('clamps what was typed into the range, without snapping it to the step', () => {
    expect(parseTyped('900', TEMPO)).toBe(240);
    expect(parseTyped('0', TEMPO)).toBe(40);
    expect(parseTyped('43', TEMPO)).toBe(43);
  });

  it('refuses anything that is not a number, so the field can revert', () => {
    expect(parseTyped('', TEMPO)).toBeNull();
    expect(parseTyped('   ', TEMPO)).toBeNull();
    expect(parseTyped('-', TEMPO)).toBeNull();
    expect(parseTyped('fast', TEMPO)).toBeNull();
    expect(parseTyped('Infinity', TEMPO)).toBeNull();
  });
});
