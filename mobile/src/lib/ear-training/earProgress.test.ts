import { describe, expect, it } from 'vitest';

import type { ProgressBySection } from '@/lib/learning/progress';
import type { LocalProgressRow } from '@/lib/sync/tables';

import { EAR_SESSIONS, EAR_TRACKS } from './curriculum';
import {
  nextSession,
  pathwayProgress,
  sessionAfter,
  sessionBestPct,
  sessionPassed,
  sessionStatus,
  trackProgress,
  trackStatus,
} from './earProgress';

const row = (sectionId: string, bestScorePct: number | null): LocalProgressRow => ({
  sectionId,
  completedAt: 1_700_000_000_000,
  bestScorePct,
  deletedAt: null,
  serverSeq: 1,
});

/** A progress map holding a score for each named session. */
const scored = (scores: Record<string, number | null>): ProgressBySection =>
  new Map(
    Object.entries(scores).map(([id, pct]) => {
      const session = EAR_SESSIONS.find((candidate) => candidate.id === id);
      if (!session) throw new Error(`No ear session "${id}"`);

      return [session.sectionId, row(session.sectionId, pct)];
    }),
  );

/** Every session up to and including `id`, passed. */
const passedThrough = (id: string): ProgressBySection => {
  const end = EAR_SESSIONS.findIndex((session) => session.id === id);

  return new Map(
    EAR_SESSIONS.slice(0, end + 1).map((session) => [
      session.sectionId,
      row(session.sectionId, 90),
    ]),
  );
};

const EMPTY: ProgressBySection = new Map();

describe('sessionPassed', () => {
  const first = EAR_SESSIONS[0];

  it('needs 70%', () => {
    expect(sessionPassed(first, scored({ 'major-1': 70 }))).toBe(true);
    expect(sessionPassed(first, scored({ 'major-1': 69 }))).toBe(false);
  });

  it('reads the same rounding the session wrote — 7 of 10 passes, 6 does not', () => {
    expect(sessionPassed(first, scored({ 'major-1': Math.round((7 / 10) * 100) }))).toBe(true);
    expect(sessionPassed(first, scored({ 'major-1': Math.round((6 / 10) * 100) }))).toBe(false);
  });

  it('is unpassed when a session was sat but never scored', () => {
    expect(sessionPassed(first, scored({ 'major-1': null }))).toBe(false);
    expect(sessionBestPct(first, EMPTY)).toBeNull();
  });
});

describe('sessionStatus', () => {
  it('opens the first session to everyone', () => {
    expect(sessionStatus(0, EMPTY)).toBe('open');
  });

  it('locks everything behind it', () => {
    expect(sessionStatus(1, EMPTY)).toBe('locked');
    expect(sessionStatus(16, EMPTY)).toBe('locked');
  });

  it('opens the next one once the one before it passes', () => {
    const progress = passedThrough('major-1');

    expect(sessionStatus(0, progress)).toBe('passed');
    expect(sessionStatus(1, progress)).toBe('open');
    expect(sessionStatus(2, progress)).toBe('locked');
  });

  it('stays locked when a later session somehow has a passing row', () => {
    // Two devices offline can leave a hole in the sequence; a predecessor-only
    // rule would unlock past it.
    const holed = scored({ 'major-1': 90, 'major-3': 90 });

    expect(sessionStatus(2, holed)).toBe('locked');
    expect(sessionStatus(3, holed)).toBe('locked');
    expect(sessionStatus(1, holed)).toBe('open');
  });

  it('keeps a pass through a worse retake', () => {
    // The row itself merges upwards, so the reading here is of the better score.
    expect(sessionStatus(0, scored({ 'major-1': 90 }))).toBe('passed');
  });

  it('crosses a track boundary like any other step', () => {
    const progress = passedThrough('major-6');

    expect(sessionStatus(5, progress)).toBe('passed');
    expect(sessionStatus(6, progress)).toBe('open');
  });

  it('refuses an index outside the pathway', () => {
    expect(() => sessionStatus(EAR_SESSIONS.length, EMPTY)).toThrow(RangeError);
  });
});

describe('track tallies', () => {
  it('counts passes within a track', () => {
    expect(trackProgress(EAR_TRACKS[0], passedThrough('major-3'))).toEqual({
      passed: 3,
      total: 6,
    });
    expect(trackProgress(EAR_TRACKS[1], passedThrough('major-6'))).toEqual({
      passed: 0,
      total: 6,
    });
  });

  it('opens a track once every track before it is complete', () => {
    expect(trackStatus(0, EMPTY)).toBe('open');
    expect(trackStatus(1, EMPTY)).toBe('locked');

    const throughMajor = passedThrough('major-6');
    expect(trackStatus(0, throughMajor)).toBe('complete');
    expect(trackStatus(1, throughMajor)).toBe('open');
    expect(trackStatus(2, throughMajor)).toBe('locked');
  });

  it('refuses a track outside the pathway', () => {
    expect(() => trackStatus(3, EMPTY)).toThrow(RangeError);
  });
});

describe('pathwayProgress', () => {
  it('counts every session in the pathway', () => {
    expect(pathwayProgress(EMPTY)).toEqual({ passed: 0, total: 17, pct: 0 });
    expect(pathwayProgress(passedThrough('major-6'))).toEqual({ passed: 6, total: 17, pct: 35 });
    expect(pathwayProgress(passedThrough('chromatic-5'))).toEqual({
      passed: 17,
      total: 17,
      pct: 100,
    });
  });
});

describe('nextSession', () => {
  it('is the first session on an empty map', () => {
    expect(nextSession(EMPTY)?.session.id).toBe('major-1');
  });

  it('is the first unpassed one, holes included', () => {
    expect(nextSession(passedThrough('minor-2'))?.session.id).toBe('minor-3');
    expect(nextSession(scored({ 'major-1': 90, 'major-3': 90 }))?.session.id).toBe('major-2');
  });

  it('is null once every session has passed', () => {
    expect(nextSession(passedThrough('chromatic-5'))).toBeNull();
  });
});

describe('sessionAfter', () => {
  it('crosses a track boundary', () => {
    expect(sessionAfter(5)?.session.id).toBe('minor-1');
  });

  it('is null at the end of the pathway', () => {
    expect(sessionAfter(EAR_SESSIONS.length - 1)).toBeNull();
  });
});
