import { describe, expect, it } from 'vitest';

import type {
  CurriculumChapter,
  CurriculumPathway,
  CurriculumSection,
  RenderSection,
  UnknownSection,
} from '@/lib/content';
import type { LocalEnrollmentRow, LocalProgressRow } from '@/lib/sync/tables';

import {
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
} from './progress';

// ---------------------------------------------------------------------------
// Fixtures. Curriculum trees are built by hand rather than parsed so a case reads
// as the shape it is about — "a chapter with one optional section and a checkpoint"
// — instead of as a wire document. The parser has its own tests.
// ---------------------------------------------------------------------------

function section(id: string, extra: Partial<CurriculumSection> = {}): CurriculumSection {
  return { id, slug: id, title: id, kind: 'article', ref: `ref-${id}`, ...extra };
}

/** A section of a kind this build doesn't know — the parser's forward-compat placeholder. */
function unknown(id: string): UnknownSection {
  return { kind: 'unknown', id, originalKind: 'hologram' };
}

function chapter(
  id: string,
  sections: RenderSection[],
  checkpoint?: { ref: string; passThresholdPct: number },
): CurriculumChapter {
  return { id, slug: id, title: id, sections, ...(checkpoint && { checkpoint }) };
}

function pathway(...chapters: CurriculumChapter[]): CurriculumPathway {
  return {
    id: 'p1',
    slug: 'fretboard-basics',
    title: 'Fretboard Basics',
    summary: 'A pathway.',
    tags: [],
    difficulty: 'intro',
    estimatedMin: 60,
    chapters,
  };
}

const AN_INSTANT = 1_700_000_000_000;

function row(
  sectionId: string,
  fields: { completedAt?: number | null; bestScorePct?: number | null } = {},
): LocalProgressRow {
  return {
    sectionId,
    completedAt: fields.completedAt ?? null,
    bestScorePct: fields.bestScorePct ?? null,
    deletedAt: null,
    serverSeq: null,
  };
}

function completed(...sectionIds: string[]): LocalProgressRow[] {
  return sectionIds.map((id) => row(id, { completedAt: AN_INSTANT }));
}

function scored(chapterId: string, pct: number): LocalProgressRow {
  return row(`${chapterId}:checkpoint`, { bestScorePct: pct });
}

const NOTHING_DONE = progressBySection([]);

function enrollment(
  pathwayId: string,
  lastActiveAt: number,
  extra: { startedAt?: number; deletedAt?: number | null } = {},
): LocalEnrollmentRow {
  return {
    pathwayId,
    startedAt: extra.startedAt ?? lastActiveAt,
    lastActiveAt,
    clientUpdatedAt: lastActiveAt,
    deletedAt: extra.deletedAt ?? null,
    serverSeq: null,
  };
}

// ---------------------------------------------------------------------------

describe('sectionComplete', () => {
  it('is false for a section with no row at all', () => {
    expect(sectionComplete(undefined)).toBe(false);
  });

  it('is false for a row that exists only to carry a score', () => {
    // A quiz sat and failed writes a row before anything is finished.
    expect(sectionComplete(row('s1', { bestScorePct: 40 }))).toBe(false);
  });

  it('is true for any completion instant, including epoch zero', () => {
    // Guards the obvious truthiness bug: 0 is a legal `completedAt`, not "not done".
    expect(sectionComplete(row('s1', { completedAt: 0 }))).toBe(true);
    expect(sectionComplete(row('s1', { completedAt: AN_INSTANT }))).toBe(true);
  });
});

describe('chapterProgress', () => {
  it('counts only counted sections, in the denominator and the numerator', () => {
    const ch = chapter('c1', [
      section('a'),
      section('b', { optional: true }),
      unknown('c'),
      section('d'),
    ]);

    expect(chapterProgress(ch, progressBySection(completed('a')))).toEqual({
      completed: 1,
      total: 2,
      complete: false,
    });
  });

  it('does not credit a finished optional section', () => {
    // Optional sections are outside the measurement entirely — finishing one must not
    // move the numerator, or a chapter could read 3/2.
    const ch = chapter('c1', [section('a'), section('b', { optional: true })]);

    expect(chapterProgress(ch, progressBySection(completed('a', 'b')))).toEqual({
      completed: 1,
      total: 1,
      complete: true,
    });
  });

  it('completes a checkpointless chapter on its sections alone', () => {
    const ch = chapter('c1', [section('a'), section('b')]);

    expect(chapterProgress(ch, progressBySection(completed('a', 'b'))).complete).toBe(true);
  });

  it('is incomplete while a checkpoint is unpassed, even with every section done', () => {
    const ch = chapter('c1', [section('a')], { ref: 'quiz-1', passThresholdPct: 80 });
    const progress = progressBySection([...completed('a'), scored('c1', 79)]);

    expect(chapterProgress(ch, progress)).toEqual({ completed: 1, total: 1, complete: false });
  });

  it('completes once the checkpoint is passed', () => {
    const ch = chapter('c1', [section('a')], { ref: 'quiz-1', passThresholdPct: 80 });
    const progress = progressBySection([...completed('a'), scored('c1', 80)]);

    expect(chapterProgress(ch, progress).complete).toBe(true);
  });

  it('completes a chapter with nothing countable in it', () => {
    // Every section unopenable on this build: there is nothing left to ask of the
    // learner, so the chapter must not block the rest of the pathway forever.
    const ch = chapter('c1', [unknown('a'), section('b', { optional: true })]);

    expect(chapterProgress(ch, NOTHING_DONE)).toEqual({ completed: 0, total: 0, complete: true });
  });
});

describe('checkpointStatus', () => {
  const withCheckpoint = (sections: RenderSection[]) =>
    chapter('c1', sections, { ref: 'quiz-1', passThresholdPct: 70 });

  it('is none when the chapter has no checkpoint', () => {
    expect(checkpointStatus(chapter('c1', [section('a')]), NOTHING_DONE)).toBe('none');
  });

  it('is locked while a counted section is outstanding', () => {
    const ch = withCheckpoint([section('a'), section('b')]);

    expect(checkpointStatus(ch, progressBySection(completed('a')))).toBe('locked');
  });

  it('is available once every counted section is done', () => {
    const ch = withCheckpoint([section('a')]);

    expect(checkpointStatus(ch, progressBySection(completed('a')))).toBe('available');
  });

  it('is not held locked by an unfinished optional section', () => {
    // The whole point of `optional`: an activity this device may never be able to run
    // must not be able to wall off the checkpoint behind it.
    const ch = withCheckpoint([section('a'), section('mic', { optional: true })]);

    expect(checkpointStatus(ch, progressBySection(completed('a')))).toBe('available');
  });

  it('is not held locked by an unknown-kind section', () => {
    const ch = withCheckpoint([section('a'), unknown('future')]);

    expect(checkpointStatus(ch, progressBySection(completed('a')))).toBe('available');
  });

  it('passes at exactly the threshold', () => {
    // The boundary is inclusive: 70% on a 70% checkpoint is a pass.
    const ch = withCheckpoint([section('a')]);
    const at = progressBySection([...completed('a'), scored('c1', 70)]);
    const under = progressBySection([...completed('a'), scored('c1', 69.9)]);

    expect(checkpointStatus(ch, at)).toBe('passed');
    expect(checkpointStatus(ch, under)).toBe('available');
  });

  it('reports passed even before the sections are finished', () => {
    // The score is a high-water mark that only rises, so a pass already earned is not
    // withdrawn by anything — including data arriving from another device out of order.
    const ch = withCheckpoint([section('a'), section('b')]);
    const progress = progressBySection([...completed('a'), scored('c1', 90)]);

    expect(checkpointStatus(ch, progress)).toBe('passed');
  });

  it('treats a checkpoint row with no score as unsat', () => {
    const ch = withCheckpoint([section('a')]);
    const progress = progressBySection([...completed('a'), row('c1:checkpoint')]);

    expect(checkpointStatus(ch, progress)).toBe('available');
  });

  it('keys the result on the chapter, not on the quiz it points at', () => {
    // Two chapters may reuse one quiz document as their checkpoint; passing it in one
    // must not silently clear the other.
    const first = chapter('c1', [section('a')], { ref: 'shared-quiz', passThresholdPct: 70 });
    const second = chapter('c2', [section('b')], { ref: 'shared-quiz', passThresholdPct: 70 });
    const progress = progressBySection([...completed('a', 'b'), scored('c1', 100)]);

    expect(checkpointStatus(first, progress)).toBe('passed');
    expect(checkpointStatus(second, progress)).toBe('available');
    expect(checkpointSectionId(first)).not.toBe(checkpointSectionId(second));
  });
});

describe('chapterStatus', () => {
  it('never locks chapter 0, however empty the progress', () => {
    const p = pathway(chapter('c0', [section('a')]), chapter('c1', [section('b')]));

    expect(chapterStatus(p, 0, NOTHING_DONE)).toBe('open');
    expect(chapterStatus(p, 1, NOTHING_DONE)).toBe('locked');
  });

  it('opens the next chapter once its predecessor completes', () => {
    const p = pathway(chapter('c0', [section('a')]), chapter('c1', [section('b')]));
    const progress = progressBySection(completed('a'));

    expect(chapterStatus(p, 0, progress)).toBe('complete');
    expect(chapterStatus(p, 1, progress)).toBe('open');
  });

  it('keeps the next chapter locked behind an available-but-unpassed checkpoint', () => {
    const p = pathway(
      chapter('c0', [section('a')], { ref: 'quiz-1', passThresholdPct: 80 }),
      chapter('c1', [section('b')]),
    );
    const progress = progressBySection(completed('a'));

    expect(checkpointStatus(p.chapters[0], progress)).toBe('available');
    expect(chapterStatus(p, 0, progress)).toBe('open');
    expect(chapterStatus(p, 1, progress)).toBe('locked');
  });

  it('reports a locked chapter as locked even when its own sections are complete', () => {
    // Reachable in the wild: a merge can land completions for a chapter this device
    // never unlocked. The hole stays visible rather than being skipped past.
    const p = pathway(chapter('c0', [section('a')]), chapter('c1', [section('b')]));

    expect(chapterStatus(p, 1, progressBySection(completed('b')))).toBe('locked');
  });

  it('locks transitively, not just on the immediate predecessor', () => {
    // Chapter 1 complete but chapter 0 not: chapter 2 must stay shut, or a hole
    // anywhere in the sequence would unlock everything after it.
    const p = pathway(
      chapter('c0', [section('a')]),
      chapter('c1', [section('b')]),
      chapter('c2', [section('c')]),
    );

    expect(chapterStatus(p, 2, progressBySection(completed('b')))).toBe('locked');
  });

  it('does not let an optional section keep the next chapter locked', () => {
    const p = pathway(
      chapter('c0', [section('a'), section('mic', { optional: true })]),
      chapter('c1', [section('b')]),
    );

    expect(chapterStatus(p, 1, progressBySection(completed('a')))).toBe('open');
  });

  it('throws for a chapter index the pathway does not have', () => {
    const p = pathway(chapter('c0', [section('a')]));

    expect(() => chapterStatus(p, 1, NOTHING_DONE)).toThrow(RangeError);
  });
});

describe('pathwayProgress', () => {
  it('totals counted sections across chapters and rounds the percentage', () => {
    const p = pathway(chapter('c0', [section('a'), section('b')]), chapter('c1', [section('c')]));

    expect(pathwayProgress(p, progressBySection(completed('a')))).toEqual({
      completed: 1,
      total: 3,
      pct: 33,
    });
    expect(pathwayProgress(p, progressBySection(completed('a', 'b'))).pct).toBe(67);
  });

  it('leaves optional and unknown sections out of the denominator', () => {
    const p = pathway(
      chapter('c0', [section('a'), section('mic', { optional: true }), unknown('future')]),
    );

    expect(pathwayProgress(p, progressBySection(completed('a')))).toEqual({
      completed: 1,
      total: 1,
      pct: 100,
    });
  });

  it('does not count checkpoints as work', () => {
    // The bar measures content read, not gates cleared — otherwise it would step by a
    // different amount per chapter depending on which chapters happen to have a
    // checkpoint. `chapterStatus` is where the gates are asked about.
    const p = pathway(chapter('c0', [section('a')], { ref: 'quiz-1', passThresholdPct: 80 }));

    expect(pathwayProgress(p, progressBySection(completed('a')))).toEqual({
      completed: 1,
      total: 1,
      pct: 100,
    });
  });

  it('reports zero rather than NaN for a pathway with nothing countable', () => {
    const p = pathway(chapter('c0', [unknown('a')]), chapter('c1', []));
    const result = pathwayProgress(p, NOTHING_DONE);

    expect(result).toEqual({ completed: 0, total: 0, pct: 0 });
    expect(Number.isNaN(result.pct)).toBe(false);
  });

  it('reports zero for a pathway with no chapters at all', () => {
    expect(pathwayProgress(pathway(), NOTHING_DONE)).toEqual({ completed: 0, total: 0, pct: 0 });
  });
});

describe('currentChapter', () => {
  it('is the first chapter that is not complete', () => {
    const p = pathway(
      chapter('c0', [section('a')]),
      chapter('c1', [section('b')]),
      chapter('c2', [section('c')]),
    );

    expect(currentChapter(p, progressBySection(completed('a')))?.index).toBe(1);
  });

  it('stays on a chapter whose only outstanding item is its checkpoint', () => {
    const p = pathway(
      chapter('c0', [section('a')], { ref: 'quiz-1', passThresholdPct: 80 }),
      chapter('c1', [section('b')]),
    );

    expect(currentChapter(p, progressBySection(completed('a')))?.chapter.id).toBe('c0');
  });

  it('skips a chapter with nothing countable and no checkpoint', () => {
    const p = pathway(chapter('c0', [unknown('a')]), chapter('c1', [section('b')]));

    expect(currentChapter(p, NOTHING_DONE)?.index).toBe(1);
  });

  it('is null once the pathway is finished', () => {
    const p = pathway(chapter('c0', [section('a')], { ref: 'quiz-1', passThresholdPct: 80 }));
    const progress = progressBySection([...completed('a'), scored('c0', 100)]);

    expect(currentChapter(p, progress)).toBeNull();
  });
});

describe('nextStep', () => {
  it('opens the first unfinished counted section of the current chapter', () => {
    const p = pathway(chapter('c0', [section('a'), section('b')]));
    const step = nextStep(p, progressBySection(completed('a')));

    expect(step).toMatchObject({ index: 0, kind: 'section' });
    expect(step?.kind === 'section' && step.section.id).toBe('b');
  });

  it('never routes to an optional or unknown section', () => {
    // These are openable from the chapter screen but are not on the critical path, so
    // the one button that has to choose never chooses them.
    const p = pathway(
      chapter('c0', [section('mic', { optional: true }), unknown('future'), section('b')]),
    );
    const step = nextStep(p, NOTHING_DONE);

    expect(step?.kind === 'section' && step.section.id).toBe('b');
  });

  it('crosses into the next chapter once the current one completes', () => {
    const p = pathway(chapter('c0', [section('a')]), chapter('c1', [section('b')]));
    const step = nextStep(p, progressBySection(completed('a')));

    expect(step).toMatchObject({ index: 1 });
    expect(step?.kind === 'section' && step.section.id).toBe('b');
  });

  it('returns the checkpoint once every counted section is done', () => {
    const p = pathway(chapter('c0', [section('a')], { ref: 'quiz-1', passThresholdPct: 80 }));
    const step = nextStep(p, progressBySection(completed('a')));

    expect(step).toEqual({
      index: 0,
      chapter: p.chapters[0],
      kind: 'checkpoint',
      checkpoint: { ref: 'quiz-1', passThresholdPct: 80 },
      sectionId: checkpointSectionId(p.chapters[0]),
    });
  });

  it('returns the checkpoint of a chapter that has no countable sections', () => {
    // Vacuously "all sections done", so the gate is the only thing left to do.
    const p = pathway(chapter('c0', [unknown('a')], { ref: 'quiz-1', passThresholdPct: 80 }));

    expect(nextStep(p, NOTHING_DONE)).toMatchObject({ kind: 'checkpoint' });
  });

  it('is null on a finished pathway', () => {
    const p = pathway(chapter('c0', [section('a')]), chapter('c1', [section('b')]));

    expect(nextStep(p, progressBySection(completed('a', 'b')))).toBeNull();
  });

  it('is null on a pathway with no chapters', () => {
    expect(nextStep(pathway(), NOTHING_DONE)).toBeNull();
  });
});

describe('activeEnrollments', () => {
  it('caps at three, most recently active first', () => {
    const rows = [
      enrollment('p1', 100),
      enrollment('p2', 400),
      enrollment('p3', 200),
      enrollment('p4', 300),
    ];
    const { active, evicted } = activeEnrollments(rows);

    expect(active.map((e) => e.pathwayId)).toEqual(['p2', 'p4', 'p3']);
    expect(evicted.map((e) => e.pathwayId)).toEqual(['p1']);
  });

  it('tolerates well over the cap', () => {
    // Not an error state: the cap is a client rule precisely so no write is rejected,
    // so several devices each starting a pathway offline all land here at once.
    const rows = [1, 2, 3, 4, 5, 6].map((n) => enrollment(`p${n}`, n * 100));
    const { active, evicted } = activeEnrollments(rows);

    expect(active).toHaveLength(MAX_ACTIVE_PATHWAYS);
    expect(active.map((e) => e.pathwayId)).toEqual(['p6', 'p5', 'p4']);
    expect(evicted.map((e) => e.pathwayId)).toEqual(['p3', 'p2', 'p1']);
  });

  it('puts dropped enrollments in neither list', () => {
    // Already tombstoned: not active, and not something for the caller to tombstone
    // again. A recent `lastActiveAt` on a dropped row must not resurrect it.
    const rows = [
      enrollment('dropped', 999, { deletedAt: 500 }),
      enrollment('p1', 100),
      enrollment('p2', 200),
    ];
    const { active, evicted } = activeEnrollments(rows);

    expect(active.map((e) => e.pathwayId)).toEqual(['p2', 'p1']);
    expect(evicted).toEqual([]);
  });

  it('does not let dropped rows consume a slot', () => {
    const rows = [
      enrollment('gone', 900, { deletedAt: 800 }),
      enrollment('p1', 400),
      enrollment('p2', 300),
      enrollment('p3', 200),
    ];

    expect(activeEnrollments(rows).active).toHaveLength(3);
  });

  it('breaks a lastActiveAt tie by startedAt, then by pathwayId', () => {
    // Both fallbacks are needed for a total order: rows merged from two devices can
    // share an instant, and only `pathwayId` is guaranteed to differ.
    const rows = [
      enrollment('zeta', 100, { startedAt: 10 }),
      enrollment('alpha', 100, { startedAt: 10 }),
      enrollment('later-start', 100, { startedAt: 50 }),
    ];

    expect(activeEnrollments(rows).active.map((e) => e.pathwayId)).toEqual([
      'later-start',
      'alpha',
      'zeta',
    ]);
  });

  it('decides identically whatever order the rows arrive in', () => {
    // The real requirement behind the tiebreak: two devices reading the same rows in
    // whatever order SQLite hands them back must evict the same pathway, or they will
    // tombstone each other's choices forever.
    const rows = [
      enrollment('a', 100, { startedAt: 1 }),
      enrollment('b', 100, { startedAt: 1 }),
      enrollment('c', 100, { startedAt: 1 }),
      enrollment('d', 100, { startedAt: 1 }),
    ];
    const forwards = activeEnrollments(rows);
    const backwards = activeEnrollments([...rows].reverse());

    expect(backwards.active.map((e) => e.pathwayId)).toEqual(
      forwards.active.map((e) => e.pathwayId),
    );
    expect(backwards.evicted.map((e) => e.pathwayId)).toEqual(['d']);
  });

  it('leaves the caller’s array untouched', () => {
    const rows = [enrollment('p1', 100), enrollment('p2', 400)];
    activeEnrollments(rows);

    expect(rows.map((e) => e.pathwayId)).toEqual(['p1', 'p2']);
  });

  it('keeps everything when under the cap', () => {
    const rows = [enrollment('p1', 100)];

    expect(activeEnrollments(rows)).toEqual({ active: rows, evicted: [] });
  });

  it('honours an explicit limit, including zero', () => {
    const rows = [enrollment('p1', 100), enrollment('p2', 200)];

    expect(activeEnrollments(rows, 1).active.map((e) => e.pathwayId)).toEqual(['p2']);
    expect(activeEnrollments(rows, 0).active).toEqual([]);
    expect(activeEnrollments(rows, 0).evicted).toHaveLength(2);
  });

  it('evicts everything rather than slicing backwards on a negative limit', () => {
    // `slice(0, -1)` would silently keep all but the last row; guard the clamp.
    const rows = [enrollment('p1', 100), enrollment('p2', 200)];

    expect(activeEnrollments(rows, -1)).toEqual({ active: [], evicted: [rows[1], rows[0]] });
  });

  it('returns nothing for no enrollments', () => {
    expect(activeEnrollments([])).toEqual({ active: [], evicted: [] });
  });
});
