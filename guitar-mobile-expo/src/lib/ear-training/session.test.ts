import { describe, expect, it } from 'vitest';

import { droneMidiFor, toneMidiFor } from './degrees';
import {
  createSession,
  grade,
  nextQuestion,
  summary,
  updateConfig,
  type Rng,
  type SessionState,
  type TrainerConfig,
} from './session';

const FIXED_C: TrainerConfig = { degrees: [0, 4, 7], keyPolicy: { mode: 'fixed', tonicPc: 0 } };

/** An rng that replays a script of rolls, then falls back to 0. */
const scripted = (rolls: number[]): Rng => {
  let i = 0;
  return () => rolls[i++] ?? 0;
};

const answer = (state: SessionState, pick: number) => grade(state, pick).state;

describe('nextQuestion', () => {
  it('only asks degrees from the configured pool', () => {
    let state = createSession(FIXED_C, 0);
    for (let i = 0; i < 50; i += 1) {
      state = nextQuestion(state);
      expect(FIXED_C.degrees).toContain(state.question?.degree);
      state = answer(state, state.question!.degree);
    }
  });

  it('re-rolls once when the same degree comes up twice', () => {
    let state = createSession(FIXED_C, 0);
    // First question: land on degree 4 (index 1 of the pool).
    state = nextQuestion(state, scripted([0.5, 0.5]));
    expect(state.question?.degree).toBe(4);
    state = answer(state, 4);
    // Same first roll again — the re-roll (third value) should take over.
    state = nextQuestion(state, scripted([0.5, 0.9, 0.5]));
    expect(state.question?.degree).toBe(7);
  });

  it('a repeat is still possible when the re-roll agrees', () => {
    let state = createSession(FIXED_C, 0);
    state = nextQuestion(state, scripted([0.5, 0.5]));
    state = answer(state, 4);
    state = nextQuestion(state, scripted([0.5, 0.5, 0.5]));
    expect(state.question?.degree).toBe(4);
  });

  it('spreads questions across three octaves', () => {
    const low = nextQuestion(createSession(FIXED_C, 0), scripted([0, 0.1]));
    const mid = nextQuestion(createSession(FIXED_C, 0), scripted([0, 0.5]));
    const high = nextQuestion(createSession(FIXED_C, 0), scripted([0, 0.9]));
    expect(low.question?.octave).toBe(-1);
    expect(mid.question?.octave).toBe(0);
    expect(high.question?.octave).toBe(1);
  });

  it('holds the tonic under a fixed key policy', () => {
    let state = createSession(FIXED_C, 0);
    for (let i = 0; i < 12; i += 1) {
      state = nextQuestion(state);
      expect(state.tonicPc).toBe(0);
      state = answer(state, 0);
    }
  });

  it('moves the tonic after each roaming block, never to the same key', () => {
    const roaming: TrainerConfig = { degrees: [0, 7], keyPolicy: { mode: 'roaming', everyN: 3 } };
    let state = createSession(roaming, 5);
    const tonics: number[] = [];

    for (let i = 0; i < 9; i += 1) {
      state = nextQuestion(state);
      tonics.push(state.tonicPc);
      state = answer(state, 0);
    }

    // Three blocks of three questions, each block in one key.
    expect(tonics[0]).toBe(5);
    expect(tonics[1]).toBe(5);
    expect(tonics[2]).toBe(5);
    expect(tonics[3]).toBe(tonics[4]);
    expect(tonics[4]).toBe(tonics[5]);
    expect(tonics[6]).toBe(tonics[7]);
    expect(tonics[3]).not.toBe(5);
    expect(tonics[6]).not.toBe(tonics[3]);
  });
});

describe('grade', () => {
  it('counts a correct answer into streaks and tallies', () => {
    const state = nextQuestion(createSession(FIXED_C, 0), scripted([0.5, 0.5]));
    const { state: after, verdict } = grade(state, 4);

    expect(verdict).toEqual({ pick: 4, degree: 4, correct: true });
    expect(after.asked).toBe(1);
    expect(after.correct).toBe(1);
    expect(after.streak).toBe(1);
    expect(after.perDegree[4]).toEqual({ right: 1, wrong: 0 });
  });

  it('a wrong answer breaks the streak but keeps the best', () => {
    let state = createSession(FIXED_C, 0);
    state = nextQuestion(state, scripted([0.5, 0.5]));
    state = answer(state, 4);
    state = nextQuestion(state, scripted([0.9, 0.5]));
    expect(state.question?.degree).toBe(7);

    const { state: after, verdict } = grade(state, 0);
    expect(verdict.correct).toBe(false);
    expect(after.streak).toBe(0);
    expect(after.bestStreak).toBe(1);
    expect(after.perDegree[7]).toEqual({ right: 0, wrong: 1 });
  });

  it('throws when no question is open', () => {
    expect(() => grade(createSession(FIXED_C, 0), 0)).toThrow();
  });
});

describe('updateConfig', () => {
  it('leaves the open question standing and applies to the next', () => {
    let state = nextQuestion(createSession(FIXED_C, 0), scripted([0.5, 0.5]));
    const question = state.question;
    state = updateConfig(state, { degrees: [2, 9], keyPolicy: FIXED_C.keyPolicy });

    expect(state.question).toBe(question);
    state = answer(state, question!.degree);
    for (let i = 0; i < 20; i += 1) {
      state = nextQuestion(state);
      expect([2, 9]).toContain(state.question?.degree);
      state = answer(state, state.question!.degree);
    }
  });
});

describe('summary', () => {
  it('reports accuracy over what was asked', () => {
    let state = createSession(FIXED_C, 0);
    state = nextQuestion(state, scripted([0.5, 0.5]));
    state = answer(state, 4);
    state = nextQuestion(state, scripted([0.9, 0.5]));
    state = answer(state, 4);

    const report = summary(state);
    expect(report.asked).toBe(2);
    expect(report.correct).toBe(1);
    expect(report.accuracy).toBe(0.5);
  });

  it('is safe on an untouched session', () => {
    expect(summary(createSession(FIXED_C, 0)).accuracy).toBe(0);
  });
});

describe('pitch mapping', () => {
  it('keeps the drone in the low octave and tones two above it', () => {
    expect(droneMidiFor(0)).toBe(36); // C2
    expect(droneMidiFor(11)).toBe(47); // B2
    expect(toneMidiFor(0, 0, 0)).toBe(60); // C4
    expect(toneMidiFor(0, 7, 1)).toBe(79); // G5
    expect(toneMidiFor(0, 4, -1)).toBe(52); // E3
  });
});
