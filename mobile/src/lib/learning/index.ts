// Public API for the learning layer.
//
// `progress.ts` is the heart of it: where a learner stands in a pathway and which enrollments the
// three-active cap keeps, as pure functions over the curriculum tree and the synced rows the device
// already holds. Every learning screen reads through it so that "is this chapter done" has one
// answer.
//
// The rest is the plumbing that gets those two inputs to a screen and the learner's answers back
// out: hooks over the live database and the content cache, and the writes that a tap performs.
// Nothing here re-derives a gating rule — a screen that needs one asks `progress.ts`.

export {
  activeEnrollments,
  chapterProgress,
  chapterStatus,
  checkpointSectionId,
  checkpointStatus,
  currentChapter,
  MAX_ACTIVE_PATHWAYS,
  nextStep,
  pathwayProgress,
  progressBySection,
  sectionComplete,
  stepSectionId,
  stepTitle,
} from './progress';
export type {
  ChapterAt,
  ChapterProgress,
  ChapterStatus,
  CheckpointStatus,
  EnrollmentSplit,
  NextStep,
  PathwayProgress,
  ProgressBySection,
} from './progress';

export { locateSection, type SectionPlacement } from './placement';
export { checkpointHref, nextStepHref, pathwayHref, sectionHref } from './hrefs';

export { dropEvictedPathways, dropPathway, startPathway, touchPathway } from './enrollment';
export { recordSectionComplete } from './completion';

export { useActiveEnrollments, useLearnerId, useProgress } from './useLearningRows';
export {
  useArticleLibrary,
  useCurriculumIndex,
  usePathway,
  usePathwayTrees,
  type ContentQuery,
  type PathwayTrees,
} from './useCurriculum';
export { useContentCache } from './useContentCache';
export { useLearning, type ActivePathway, type LearningState } from './useLearning';
