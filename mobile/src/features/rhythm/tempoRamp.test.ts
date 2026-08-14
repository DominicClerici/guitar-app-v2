import { describe, expect, it } from 'vitest';

import type { RoundResult } from './rhythmGrading';
import { applyRamp, IDLE_RAMP, isClean } from './tempoRamp';

/** Only the fields the ramp reads; the rest of a result has no say in what the tempo does. */
function pass(onTime: number, expected: number, extras: number[] = []): RoundResult {
  return {
    hits: [],
    extras,
    expected,
    onTime,
    early: 0,
    late: 0,
    missed: expected - onTime,
    meanDeviationMs: null,
    bias: 'steady',
    onBandMs: 40,
    matchWindowMs: 90,
  };
}

describe('isClean', () => {
  it('accepts a pass at or above nine in ten on time', () => {
    expect(isClean(pass(9, 10))).toBe(true);
    expect(isClean(pass(10, 10))).toBe(true);
  });

  it('rejects one below it', () => {
    expect(isClean(pass(8, 10))).toBe(false);
  });

  it('rejects an accurate pass that played into a rest', () => {
    expect(isClean(pass(10, 10, [120]))).toBe(false);
  });
});

describe('applyRamp', () => {
  it('holds the tempo after a single clean pass', () => {
    const outcome = applyRamp(IDLE_RAMP, pass(10, 10), 90, 4);

    expect(outcome.bpm).toBe(90);
    expect(outcome.moved).toBeNull();
    expect(outcome.state.cleanRun).toBe(1);
  });

  it('steps up on the second clean pass in a row, and starts counting again', () => {
    const first = applyRamp(IDLE_RAMP, pass(10, 10), 90, 4);
    const second = applyRamp(first.state, pass(10, 10), 90, 4);

    expect(second.bpm).toBe(94);
    expect(second.moved).toBe('up');
    expect(second.state.cleanRun).toBe(0);
  });

  it('takes the step it was given', () => {
    const first = applyRamp(IDLE_RAMP, pass(10, 10), 90, 8);
    expect(applyRamp(first.state, pass(10, 10), 90, 8).bpm).toBe(98);
  });

  it('breaks a clean run without moving the tempo', () => {
    const first = applyRamp(IDLE_RAMP, pass(10, 10), 90, 4);
    const middling = applyRamp(first.state, pass(8, 10), 90, 4);

    expect(middling.bpm).toBe(90);
    expect(middling.state.cleanRun).toBe(0);

    // And the pass after it is the first of a new run, not the second of the old one.
    expect(applyRamp(middling.state, pass(10, 10), 90, 4).moved).toBeNull();
  });

  it('steps down on a pass that fell apart', () => {
    const outcome = applyRamp(IDLE_RAMP, pass(5, 10), 90, 4);

    expect(outcome.bpm).toBe(86);
    expect(outcome.moved).toBe('down');
  });

  it('steps down from a clean run rather than crediting it', () => {
    const first = applyRamp(IDLE_RAMP, pass(10, 10), 90, 4);
    const outcome = applyRamp(first.state, pass(3, 10), 90, 4);

    expect(outcome.moved).toBe('down');
    expect(outcome.state.cleanRun).toBe(0);
  });

  it('stops at the ends of the tempo range and reports no movement', () => {
    const first = applyRamp(IDLE_RAMP, pass(10, 10), 300, 4);
    expect(applyRamp(first.state, pass(10, 10), 300, 4)).toMatchObject({ bpm: 300, moved: null });

    expect(applyRamp(IDLE_RAMP, pass(0, 10), 20, 4)).toMatchObject({ bpm: 20, moved: null });
  });

  it('treats a pattern with nothing to play as a pass that fell apart', () => {
    // No written hits means no evidence, and a ramp that climbed on it would climb on silence.
    expect(applyRamp(IDLE_RAMP, pass(0, 0), 90, 4).moved).toBe('down');
  });
});
