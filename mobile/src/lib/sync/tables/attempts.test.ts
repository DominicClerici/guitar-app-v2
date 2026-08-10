import type { QuizAttemptSyncRow } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import { attemptsSyncTable, type LocalAttemptRow } from './attempts';

const ANSWERED = 1_000;

const local = (row: Partial<LocalAttemptRow> = {}): LocalAttemptRow => ({
  attemptId: '019400aa-0000-7000-8000-000000000001',
  sectionId: 'intervals-check',
  scorePct: 80,
  passed: true,
  answeredAt: ANSWERED,
  deletedAt: null,
  serverSeq: null,
  ...row,
});

const remote = (row: Partial<QuizAttemptSyncRow> = {}): QuizAttemptSyncRow => ({
  attemptId: '019400aa-0000-7000-8000-000000000001',
  sectionId: 'intervals-check',
  scorePct: 80,
  passed: true,
  answeredAt: ANSWERED,
  deletedAt: null,
  serverSeq: 12,
  ...row,
});

const { merge, mergeAdopted } = attemptsSyncTable;

describe('merge', () => {
  it('stores an attempt made on another device', () => {
    expect(merge(undefined, remote())).toEqual({
      attemptId: '019400aa-0000-7000-8000-000000000001',
      sectionId: 'intervals-check',
      scorePct: 80,
      passed: true,
      answeredAt: ANSWERED,
      deletedAt: null,
      serverSeq: 12,
    });
  });

  /**
   * The only thing an immutable row can learn from the server. Without it the push path keeps
   * finding the attempt unsent and re-sends it on every sync.
   */
  it('confirms this device’s own unpushed attempt by taking its sequence value', () => {
    expect(merge(local({ serverSeq: null }), remote({ serverSeq: 12 }))?.serverSeq).toBe(12);
  });

  it('leaves an already-confirmed attempt alone', () => {
    expect(merge(local({ serverSeq: 12 }), remote())).toBeNull();
  });

  /**
   * Append-only means the stored row wins, so a differing payload for the same id must not
   * overwrite what is here — the id is the attempt, and the first writing of it is the truth.
   */
  it('does not rewrite a stored attempt from a row claiming a different score', () => {
    expect(merge(local({ serverSeq: 3, scorePct: 80 }), remote({ scorePct: 10 }))).toBeNull();
  });
});

describe('mergeAdopted', () => {
  it('carries a guest attempt the account does not have', () => {
    expect(mergeAdopted(undefined, local({ serverSeq: 7 }))?.serverSeq).toBeNull();
  });

  it('leaves an attempt the account already has', () => {
    expect(mergeAdopted(local(), local())).toBeNull();
  });
});
