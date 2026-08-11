// The rules of a note-play round, apart from the screen that draws them: which targets are live,
// what it takes for a detected pitch to count as a hit, and how wide a neck the round is read on.
// No React and no microphone — the runner in `features/activities/note-play` supplies both.

export {
  boardWindow,
  deriveWindow,
  emptyProgress,
  liveTargets,
  matchingTarget,
  nextRoundIndex,
  noteLabel,
  observeFrame,
  roundComplete,
  targetLabel,
  type RoundProgress,
} from './notePlay';
