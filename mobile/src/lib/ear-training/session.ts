// The quiz, as data. Pure functions from state to state — no React, no audio,
// no clock — so the whole training loop can be unit-tested, and so the curated
// modes to come are nothing but a different `TrainerConfig` handed to the same
// machine.

/** One key held for this many questions before a roaming tonic moves on. */
export const DEFAULT_ROAM_EVERY = 10;

/** Where the tonic lives over a session. */
export type KeyPolicy =
  | { mode: 'fixed'; tonicPc: number }
  | { mode: 'roaming'; everyN: number };

export interface TrainerConfig {
  /** Degrees in play, as semitones above the tonic. At least two. */
  degrees: number[];
  keyPolicy: KeyPolicy;
}

export interface Question {
  degree: number;
  /** Octave shift off the trainer's base register: -1, 0 or +1. */
  octave: number;
}

export interface DegreeTally {
  right: number;
  wrong: number;
}

export interface SessionState {
  config: TrainerConfig;
  tonicPc: number;
  /** Questions answered so far — the current one is not counted until graded. */
  asked: number;
  correct: number;
  streak: number;
  bestStreak: number;
  perDegree: Record<number, DegreeTally>;
  question: Question | null;
}

export interface Verdict {
  /** The degree the user chose. */
  pick: number;
  /** The degree that was asked. */
  degree: number;
  correct: boolean;
}

/** What a session leaves behind — the shape a future tracking layer persists. */
export interface SessionSummary {
  asked: number;
  correct: number;
  accuracy: number;
  bestStreak: number;
  perDegree: Record<number, DegreeTally>;
}

export type Rng = () => number;

export function createSession(config: TrainerConfig, tonicPc: number): SessionState {
  return {
    config,
    tonicPc,
    asked: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    perDegree: {},
    question: null,
  };
}

/** New settings take effect from the next question; the current one stands. */
export function updateConfig(state: SessionState, config: TrainerConfig): SessionState {
  return { ...state, config };
}

function pickDegree(state: SessionState, rng: Rng): number {
  const pool = state.config.degrees;
  if (pool.length === 0) return 0;

  const roll = () => pool[Math.floor(rng() * pool.length) % pool.length];

  // One re-roll against the degree just asked. Enough to break runs without
  // making a repeat impossible — hearing the same degree twice is legitimate,
  // hearing it four times in a row is a broken shuffle.
  const first = roll();
  if (pool.length > 1 && first === state.question?.degree) return roll();
  return first;
}

/** Low and high octaves are seasoning, not the diet — the base register carries half. */
function pickOctave(rng: Rng): number {
  const roll = rng();
  if (roll < 0.25) return -1;
  if (roll < 0.75) return 0;
  return 1;
}

function pickTonic(current: number, rng: Rng): number {
  // Any pitch class but the one sounding, so a key change is always audible.
  return (current + 1 + Math.floor(rng() * 11)) % 12;
}

/**
 * Advances to the next question. Under a roaming key policy the tonic moves
 * first whenever a block of `everyN` answers has just completed — the caller
 * can see that happened by comparing `tonicPc` across the call, and should let
 * the drone arrive before sounding the tone.
 */
export function nextQuestion(state: SessionState, rng: Rng = Math.random): SessionState {
  const { keyPolicy } = state.config;

  const tonicPc =
    keyPolicy.mode === 'roaming' && state.asked > 0 && state.asked % keyPolicy.everyN === 0
      ? pickTonic(state.tonicPc, rng)
      : keyPolicy.mode === 'fixed'
        ? keyPolicy.tonicPc
        : state.tonicPc;

  return {
    ...state,
    tonicPc,
    question: { degree: pickDegree(state, rng), octave: pickOctave(rng) },
  };
}

/** Grades an answer against the open question. */
export function grade(
  state: SessionState,
  pick: number,
): { state: SessionState; verdict: Verdict } {
  const question = state.question;
  if (!question) throw new Error('ear-trainer: graded with no question open');

  const correct = pick === question.degree;
  const tally = state.perDegree[question.degree] ?? { right: 0, wrong: 0 };
  const streak = correct ? state.streak + 1 : 0;

  return {
    state: {
      ...state,
      asked: state.asked + 1,
      correct: state.correct + (correct ? 1 : 0),
      streak,
      bestStreak: Math.max(state.bestStreak, streak),
      perDegree: {
        ...state.perDegree,
        [question.degree]: {
          right: tally.right + (correct ? 1 : 0),
          wrong: tally.wrong + (correct ? 0 : 1),
        },
      },
    },
    verdict: { pick, degree: question.degree, correct },
  };
}

export function summary(state: SessionState): SessionSummary {
  return {
    asked: state.asked,
    correct: state.correct,
    accuracy: state.asked === 0 ? 0 : state.correct / state.asked,
    bestStreak: state.bestStreak,
    perDegree: state.perDegree,
  };
}
