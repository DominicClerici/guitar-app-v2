// Functional ear training, the pure half: the degree vocabulary, the quiz state
// machine, the graded curriculum over it and where a learner stands in that
// curriculum. The audio engine and UI that play it live in
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
export {
  EAR_PASS_PCT,
  EAR_SESSION_QUESTIONS,
  EAR_SESSIONS,
  EAR_TRACKS,
  earSessionAt,
  earSessionById,
  type EarSession,
  type EarSessionAt,
  type EarTrack,
} from './curriculum';
export {
  nextSession,
  pathwayProgress,
  sessionAfter,
  sessionBestPct,
  sessionPassed,
  sessionStatus,
  trackProgress,
  trackStatus,
  type EarPathwayProgress,
  type EarSessionStatus,
  type EarTally,
  type EarTrackStatus,
} from './earProgress';
export {
  ORIENTATION_DECAY_S,
  ORIENTATION_DEGREES,
  ORIENTATION_GAP_S,
  ORIENTATION_OCTAVES,
  ORIENTATION_TOTAL_S,
  orientationSequence,
  type OrientationStrike,
} from './orientation';
