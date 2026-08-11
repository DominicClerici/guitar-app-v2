// Playing an activity: the screen shell, the registry that picks a runner, the chrome both runners
// share, and the one local write finishing a run leaves behind.
//
// An activity is standalone, always optional and never graded — see `record.ts` for what that
// buys and why it is what makes the completion row safe to write.

export { ActivityIntro, type ModeChoice } from './ActivityIntro';
export { ActivityScreen } from './ActivityScreen';
export { ActivitySummary } from './ActivitySummary';
export { ActivityUnavailable } from './ActivityUnavailable';
export { MicGate, useMicStatus } from './MicGate';
export { recordActivityCompletion } from './record';
export { runnerFor, type ActivityRunnerEntry } from './registry';
export { RoundCountdown } from './RoundCountdown';

export { NotePlayRunner, type NotePlayRunnerProps } from './note-play/NotePlayRunner';
export { RhythmRunner, type RhythmRunnerProps } from './rhythm/RhythmRunner';
export { buildGrid, type RhythmGrid } from './rhythm/rhythmGrid';
export { grade, type RoundResult, type Verdict } from './rhythm/rhythmGrading';
