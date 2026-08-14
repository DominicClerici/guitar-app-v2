import { MAX_BPM, MIN_BPM } from '@/features/metronome/patterns';

import type { RoundResult } from './rhythmGrading';
import type { RampStep } from './trainerSettings';

/**
 * The tempo moving itself, once you have earned it.
 *
 * The rule is deliberately asymmetric. Going up asks for two clean passes in a row, because one
 * clean pass at a tempo you cannot hold is luck and the drill would ratchet away from you. Coming
 * down happens on a single bad pass, because sitting at a tempo you have lost is not practice.
 *
 * Clean means more than accurate: a pass with a stray pick in a rest is not clean however well the
 * written hits landed, or the ramp would climb on the strength of playing something else.
 */

/** Share of written hits that must land on time. */
export const CLEAN_ACCURACY = 0.9;
/** Consecutive clean passes that earn a step up. */
export const CLEAN_PASSES = 2;
/** Below this, the tempo steps back down. */
export const DROP_ACCURACY = 0.6;

export interface RampState {
  /** Clean passes since the last step or stumble. */
  cleanRun: number;
}

export const IDLE_RAMP: RampState = Object.freeze({ cleanRun: 0 });

export function accuracyOf(result: RoundResult): number {
  return result.expected === 0 ? 0 : result.onTime / result.expected;
}

export function isClean(result: RoundResult): boolean {
  return result.extras.length === 0 && accuracyOf(result) >= CLEAN_ACCURACY;
}

export interface RampOutcome {
  bpm: number;
  state: RampState;
  /** Which way it went, for the line that tells the learner why the tempo moved. */
  moved: 'up' | 'down' | null;
}

/**
 * What a pass does to the tempo. A function of the pass and the run before it, so the whole rule
 * is one thing to read and one thing to test — the screen only applies the answer.
 */
export function applyRamp(
  state: RampState,
  result: RoundResult,
  bpm: number,
  step: RampStep,
): RampOutcome {
  if (accuracyOf(result) < DROP_ACCURACY) {
    const next = Math.max(MIN_BPM, bpm - step);
    return { bpm: next, state: IDLE_RAMP, moved: next === bpm ? null : 'down' };
  }

  if (!isClean(result)) return { bpm, state: IDLE_RAMP, moved: null };

  const cleanRun = state.cleanRun + 1;
  if (cleanRun < CLEAN_PASSES) return { bpm, state: { cleanRun }, moved: null };

  const next = Math.min(MAX_BPM, bpm + step);
  return { bpm: next, state: IDLE_RAMP, moved: next === bpm ? null : 'up' };
}
