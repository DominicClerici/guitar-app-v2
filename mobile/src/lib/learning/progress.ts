import { countedSections } from '@/lib/content';
import type { CurriculumChapter, CurriculumPathway, CurriculumSection } from '@/lib/content';
import type { LocalEnrollmentRow, LocalProgressRow } from '@/lib/sync/tables';

// Where a learner is in a pathway, derived from nothing but the curriculum tree and
// the rows the device already holds. Pure: no database, no network, no React — every
// learning screen asks the same questions of the same two inputs, so the answers have
// to come from one place or two screens will disagree about whether a chapter is done.
//
// Three rules run through all of it:
//
//   · Only chapters gate. Inside an unlocked chapter every section is open, in any
//     order — the sequence is a suggestion, not a lock.
//   · Only `countedSections` counts. That helper drops optional sections and sections
//     of a kind this build can't open, so a chapter that gained a microphone activity
//     never becomes unfinishable on an older app (see curriculum.ts).
//   · Progress is monotonic. A section is done once its row has a `completedAt`, and
//     the sync table has no delete arm, so nothing here ever needs to un-complete
//     anything or consult `deletedAt`.

/** The client-side cap on how many pathways a learner may have on the go (BACKEND_PLAN.md §7). */
export const MAX_ACTIVE_PATHWAYS = 3;

/**
 * Progress rows keyed by section id — the one shape every function here takes.
 *
 * A map rather than an array because every question in this module is a point lookup
 * by section id, and a pathway screen asks one per section per render; scanning an
 * array would make drawing a chapter quadratic in its own size. Callers holding a
 * query result build one with `progressBySection`.
 */
export type ProgressBySection = ReadonlyMap<string, LocalProgressRow>;

/** Index rows straight out of a query into the shape the rest of this module wants. */
export function progressBySection(rows: readonly LocalProgressRow[]): ProgressBySection {
  return new Map(rows.map((row) => [row.sectionId, row]));
}

/**
 * The section id a chapter's checkpoint result is stored under.
 *
 * A checkpoint is authored as `{ ref, passThresholdPct }` with no id of its own, so
 * one has to be derived — and it must be derived the same way by whoever *writes* the
 * result as by this module reading it, which is why it is exported rather than
 * inlined. Keyed on the chapter, not on `ref`: exactly one checkpoint belongs to a
 * chapter, whereas the same quiz document reused as two chapters' checkpoints would
 * otherwise pass both at once.
 */
export function checkpointSectionId(chapter: CurriculumChapter): string {
  return `${chapter.id}:checkpoint`;
}

/** Whether a section has been finished. A missing row is a section never opened. */
export function sectionComplete(row: LocalProgressRow | undefined): boolean {
  return row !== undefined && row.completedAt !== null;
}

export interface ChapterProgress {
  /** Counted sections finished. */
  completed: number;
  /** Counted sections in the chapter — optional and unopenable ones are not in here. */
  total: number;
  /**
   * The whole chapter is done: every counted section finished *and* the checkpoint
   * passed, if it has one. `completed === total` is the narrower question — all the
   * reading done, checkpoint possibly still to sit — and is what unlocks the checkpoint.
   */
  complete: boolean;
}

export function chapterProgress(
  chapter: CurriculumChapter,
  progress: ProgressBySection,
): ChapterProgress {
  const counted = countedSections(chapter);
  const completed = counted.filter((section) => sectionComplete(progress.get(section.id))).length;
  const sectionsDone = completed === counted.length;

  return {
    completed,
    total: counted.length,
    complete: sectionsDone && (!chapter.checkpoint || checkpointPassed(chapter, progress)),
  };
}

/**
 * `none` — the chapter has no checkpoint. `locked` — sections still outstanding.
 * `available` — sittable but not yet passed. `passed` — cleared.
 *
 * Note that `passed` is terminal in practice but not enforced here: the score is a
 * high-water mark that only ever rises, so a pass cannot decay into `available`.
 */
export type CheckpointStatus = 'none' | 'locked' | 'available' | 'passed';

export function checkpointStatus(
  chapter: CurriculumChapter,
  progress: ProgressBySection,
): CheckpointStatus {
  if (!chapter.checkpoint) return 'none';
  if (checkpointPassed(chapter, progress)) return 'passed';

  const counted = countedSections(chapter);
  const sectionsDone = counted.every((section) => sectionComplete(progress.get(section.id)));

  return sectionsDone ? 'available' : 'locked';
}

function checkpointPassed(chapter: CurriculumChapter, progress: ProgressBySection): boolean {
  const checkpoint = chapter.checkpoint;
  if (!checkpoint) return false;

  const score = progress.get(checkpointSectionId(chapter))?.bestScorePct;

  return score !== null && score !== undefined && score >= checkpoint.passThresholdPct;
}

/** `locked` — an earlier chapter is unfinished. `open` — workable. `complete` — done. */
export type ChapterStatus = 'locked' | 'open' | 'complete';

/**
 * Locking is transitive: a chapter opens only once *every* chapter before it is
 * complete, not just its immediate predecessor. Two devices working offline can
 * produce progress with a hole in it — chapter 2 finished while chapter 0 is not —
 * and the predecessor-only rule would quietly unlock chapter 3 on the strength of it.
 * Chapter 0 has no predecessors and so is never locked.
 *
 * A locked chapter reports `locked` whatever its own rows say, which is the point: a
 * hole in the sequence has to be visible as a hole, not skipped past.
 */
export function chapterStatus(
  pathway: CurriculumPathway,
  chapterIndex: number,
  progress: ProgressBySection,
): ChapterStatus {
  const chapter = pathway.chapters[chapterIndex];
  if (!chapter) {
    throw new RangeError(`Chapter ${chapterIndex} is outside pathway "${pathway.slug}".`);
  }

  for (let index = 0; index < chapterIndex; index += 1) {
    if (!chapterProgress(pathway.chapters[index], progress).complete) return 'locked';
  }

  return chapterProgress(chapter, progress).complete ? 'complete' : 'open';
}

export interface PathwayProgress {
  completed: number;
  /** Counted sections across every chapter. Checkpoints are gates, not units of work. */
  total: number;
  /** Whole percent, 0–100. */
  pct: number;
}

/**
 * The headline number on a pathway card.
 *
 * Checkpoints are deliberately outside the denominator: they gate chapters rather
 * than adding content, and counting them would make the bar jump by an inconsistent
 * amount depending on how many chapters happen to have one. `chapterStatus` is where
 * a caller asks whether the gates have actually been cleared.
 *
 * A pathway with no counted sections reports `pct: 0` rather than dividing by zero or
 * declaring itself finished. Zero counted sections is not an achievement — on an older
 * build it means a tree whose sections this app cannot open — and a full bar over
 * content the learner has never seen would be the more misleading of the two answers.
 */
export function pathwayProgress(
  pathway: CurriculumPathway,
  progress: ProgressBySection,
): PathwayProgress {
  let completed = 0;
  let total = 0;

  for (const chapter of pathway.chapters) {
    const chapterTally = chapterProgress(chapter, progress);
    completed += chapterTally.completed;
    total += chapterTally.total;
  }

  return { completed, total, pct: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

/** A chapter with the index it sits at, which is what `chapterStatus` and routing need. */
export interface ChapterAt {
  index: number;
  chapter: CurriculumChapter;
}

/**
 * The chapter the learner is in: the first one that is not complete. It is always the
 * open chapter — every chapter before it is complete, which is exactly the unlock
 * condition. `null` means the pathway is finished.
 */
export function currentChapter(
  pathway: CurriculumPathway,
  progress: ProgressBySection,
): ChapterAt | null {
  const index = pathway.chapters.findIndex(
    (chapter) => !chapterProgress(chapter, progress).complete,
  );

  return index === -1 ? null : { index, chapter: pathway.chapters[index] };
}

/**
 * What a "Continue" button opens. Carries the chapter as well as the destination so a
 * caller can route without re-deriving where it came from.
 */
export type NextStep = ChapterAt &
  (
    | { kind: 'section'; section: CurriculumSection }
    | {
        kind: 'checkpoint';
        checkpoint: NonNullable<CurriculumChapter['checkpoint']>;
        /** The id its result is stored under — see `checkpointSectionId`. */
        sectionId: string;
      }
  );

/**
 * The first unfinished counted section of the current chapter, or its checkpoint once
 * the sections are all done; `null` on a finished pathway.
 *
 * "First" is only a suggestion — every section of an open chapter is reachable, and
 * this picks the earliest merely because a single button has to pick something.
 */
export function nextStep(pathway: CurriculumPathway, progress: ProgressBySection): NextStep | null {
  const current = currentChapter(pathway, progress);
  if (!current) return null;

  const section = countedSections(current.chapter).find(
    (candidate) => !sectionComplete(progress.get(candidate.id)),
  );
  if (section) return { ...current, kind: 'section', section };

  // No section left and the chapter still isn't complete, so it has a checkpoint and
  // that checkpoint is what's outstanding — `currentChapter` admits no other case.
  const checkpoint = current.chapter.checkpoint;
  if (!checkpoint) return null;

  return {
    ...current,
    kind: 'checkpoint',
    checkpoint,
    sectionId: checkpointSectionId(current.chapter),
  };
}

/**
 * The section id a step is recorded under — what a row on the pathway screen compares itself
 * against to know it is the one Continue opens.
 */
export function stepSectionId(step: NextStep | null): string | null {
  if (!step) return null;
  return step.kind === 'section' ? step.section.id : step.sectionId;
}

/**
 * What to call the next step, in one line.
 *
 * A chapter quiz is named by its author (`checkpoint.title`) so the learner reads the same words
 * here, on the pathway screen and on the row itself. A tree published before those names existed
 * falls back to the chapter it gates.
 */
export function stepTitle(step: NextStep): string {
  return step.kind === 'section'
    ? step.section.title
    : (step.checkpoint.title ?? `Chapter ${step.index + 1} quiz`);
}

export interface EnrollmentSplit {
  /** The kept enrollments, most recently active first. */
  active: LocalEnrollmentRow[];
  /** Over the cap: the caller tombstones these. Already-dropped rows are not in here. */
  evicted: LocalEnrollmentRow[];
}

/**
 * Reconcile the active-pathway cap.
 *
 * The cap is a client rule, not a server constraint, precisely so that no write is
 * ever rejected: two devices can each start a fourth pathway offline and both merges
 * succeed (BACKEND_PLAN.md §7, enrollments.ts). Seeing more than `limit` live rows is
 * therefore the *expected* state after a sync, not corruption — this decides which
 * survive, and every device that sees the same rows decides identically, which is what
 * makes the tombstones converge instead of ping-ponging.
 *
 * That determinism is why the ordering is a total one: most recently active first,
 * then most recently started, then by `pathwayId`. The row order coming out of SQLite
 * is not guaranteed, so a tie broken by position would let two devices evict different
 * pathways from identical data. `pathwayId` is unique, so the comparison never runs out
 * of tiebreaks.
 */
export function activeEnrollments(
  rows: readonly LocalEnrollmentRow[],
  limit: number = MAX_ACTIVE_PATHWAYS,
): EnrollmentSplit {
  const live = rows
    .filter((row) => row.deletedAt === null)
    .sort(
      (a, b) =>
        b.lastActiveAt - a.lastActiveAt ||
        b.startedAt - a.startedAt ||
        a.pathwayId.localeCompare(b.pathwayId),
    );

  const keep = Math.max(0, limit);

  return { active: live.slice(0, keep), evicted: live.slice(keep) };
}
