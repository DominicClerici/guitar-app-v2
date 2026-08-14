/**
 * Playing a written rhythm against a click and being told when you played it.
 *
 * The decidable half is pure and tested — where the slots fall (`rhythmGrid`), what the room is
 * like (`calibration`), what landed (`rhythmGrading`), what to compose (`patternGenerator`), and
 * when the tempo should move (`tempoRamp`). The other half is the audio session, the microphone
 * and the order the two may be started in, and all of it is in `useRhythmDrill`.
 *
 * Two shells sit on this: the pathway activity, which runs authored rounds, and the standalone
 * trainer, which runs whatever you asked for until you stop.
 */

export { describeHeadroom, type Calibration, type HeadroomReason } from './calibration';
export {
  describeValues,
  generatePattern,
  nameOf,
  NOTE_VALUES,
  slotsFor,
  spokenNameOf,
  subdivisionFor,
  type GeneratedPattern,
  type GenerateSpec,
  type NoteValue,
  type Rng,
} from './patternGenerator';
export { DEFAULT_PRESET_ID, PRESETS, presetFor, presetSlots, type RhythmPreset } from './presets';
export {
  describeBias,
  describeBreakdown,
  describeScore,
  grade,
  summariseRun,
  type Bias,
  type RoundResult,
  type Verdict,
} from './rhythmGrading';
export { barsOf, buildGrid, describePattern, type GridSlot, type RhythmGrid } from './rhythmGrid';
export { gradedMarks, SlotGrid, verdictMap, type MarkTone, type PlayedMark } from './SlotGrid';
export { StrikePad } from './StrikePad';
export {
  accuracyOf,
  applyRamp,
  IDLE_RAMP,
  isClean,
  type RampOutcome,
  type RampState,
} from './tempoRamp';
export { TrainerSettingsSheet, type TrainerSettingsSheetRef } from './TrainerSettingsSheet';
export {
  COUNT_IN_BARS,
  DEFAULT_SETTINGS,
  DEFAULT_VALUES,
  METERS,
  PATTERN_BARS,
  RAMP_STEPS,
  type PatternSource,
  type RampStep,
  type TrainerSettings,
} from './trainerSettings';
export { useRhythmDrill, type InputMode, type RhythmDrill } from './useRhythmDrill';
export { useRhythmTrainer, type RhythmTrainer } from './useRhythmTrainer';
