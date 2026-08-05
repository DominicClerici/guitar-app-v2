// Functional ear training, the pure half: the degree vocabulary and the quiz
// state machine. The audio engine and UI that play it live in
// src/features/ear-trainer.

export {
  DEFAULT_DEGREES,
  DEGREE_LABELS,
  degreeLabel,
  droneMidiFor,
  FIFTHS_ORDER,
  toneMidiFor,
} from './degrees';
export {
  createSession,
  DEFAULT_ROAM_EVERY,
  grade,
  nextQuestion,
  summary,
  updateConfig,
  type DegreeTally,
  type KeyPolicy,
  type Question,
  type Rng,
  type SessionState,
  type SessionSummary,
  type TrainerConfig,
  type Verdict,
} from './session';
