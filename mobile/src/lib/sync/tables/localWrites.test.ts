import { describe, expect, it } from 'vitest';

import { attemptsSyncTable, type LocalAttemptRow } from './attempts';
import { preferencesSyncTable, type LocalPreferenceRow } from './preferences';
import { progressSyncTable, type LocalProgressRow } from './progress';

/**
 * `mergeLocal` — what happens when the **app itself** writes a row over one already stored.
 *
 * Worth testing separately from the pull-side merge because the failure it prevents is invisible
 * between syncs: the device would disagree with the server about data the device just wrote, and
 * only a later pull would correct it.
 */

const EARLIER = 1_000;
const LATER = 2_000;

describe('sectionProgress.mergeLocal', () => {
  const row = (overrides: Partial<LocalProgressRow> = {}): LocalProgressRow => ({
    sectionId: 'intervals-1',
    completedAt: null,
    bestScorePct: null,
    deletedAt: null,
    serverSeq: null,
    ...overrides,
  });

  it('stores a first attempt as written', () => {
    expect(progressSyncTable.mergeLocal(undefined, row({ bestScorePct: 60 }))).toMatchObject({
      bestScorePct: 60,
    });
  });

  /** The case the whole function exists for: a retake must not lower a checkpoint below its gate. */
  it('does not let a worse retake lower the best score', () => {
    const merged = progressSyncTable.mergeLocal(
      row({ bestScorePct: 90, completedAt: EARLIER }),
      row({ bestScorePct: 40, completedAt: LATER }),
    );

    expect(merged.bestScorePct).toBe(90);
  });

  it('takes a better retake', () => {
    const merged = progressSyncTable.mergeLocal(
      row({ bestScorePct: 40 }),
      row({ bestScorePct: 90 }),
    );

    expect(merged.bestScorePct).toBe(90);
  });

  it('keeps the first completion rather than moving it later', () => {
    const merged = progressSyncTable.mergeLocal(
      row({ completedAt: EARLIER }),
      row({ completedAt: LATER }),
    );

    expect(merged.completedAt).toBe(EARLIER);
  });

  /** Re-reading an article must not erase a score earned by the quiz section it shares an id with. */
  it('does not let a null score erase a recorded one', () => {
    const merged = progressSyncTable.mergeLocal(
      row({ bestScorePct: 70 }),
      row({ bestScorePct: null, completedAt: LATER }),
    );

    expect(merged.bestScorePct).toBe(70);
  });

  it('leaves the row unsent, because the server has not been told', () => {
    const merged = progressSyncTable.mergeLocal(
      row({ bestScorePct: 90, serverSeq: 4 }),
      row({ bestScorePct: 95 }),
    );

    expect(merged.serverSeq).toBeNull();
  });
});

describe('quizAttempts.mergeLocal', () => {
  const row = (overrides: Partial<LocalAttemptRow> = {}): LocalAttemptRow => ({
    attemptId: '019400aa-0000-7000-8000-000000000001',
    sectionId: 'intervals-check',
    scorePct: 80,
    passed: true,
    answeredAt: EARLIER,
    deletedAt: null,
    serverSeq: null,
    ...overrides,
  });

  it('stores a new attempt', () => {
    expect(attemptsSyncTable.mergeLocal(undefined, row())).toMatchObject({ scorePct: 80 });
  });

  /** Append-only holds for the device's own writes, or the two sides disagree about an attempt. */
  it('keeps what was recorded when the same id is written again', () => {
    expect(
      attemptsSyncTable.mergeLocal(row({ scorePct: 80 }), row({ scorePct: 10 })),
    ).toMatchObject({ scorePct: 80 });
  });
});

describe('userPreferences.mergeLocal', () => {
  const row = (overrides: Partial<LocalPreferenceRow> = {}): LocalPreferenceRow => ({
    key: 'theme',
    value: 'dark',
    clientUpdatedAt: EARLIER,
    deletedAt: null,
    serverSeq: null,
    ...overrides,
  });

  /** Last-write-wins: the app stamps a fresh timestamp, so the new value simply replaces. */
  it('replaces the stored value', () => {
    expect(
      preferencesSyncTable.mergeLocal(row({ value: 'dark' }), row({ value: 'light' })).value,
    ).toBe('light');
  });

  it('leaves the row unsent', () => {
    expect(preferencesSyncTable.mergeLocal(row({ serverSeq: 3 }), row()).serverSeq).toBeNull();
  });
});
