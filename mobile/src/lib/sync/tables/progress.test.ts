import type { SectionProgressSyncRow } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import { progressSyncTable, type LocalProgressRow } from './progress';

const EARLIER = 1_000;
const LATER = 2_000;

const local = (row: Partial<LocalProgressRow> = {}): LocalProgressRow => ({
  sectionId: 'intervals-1',
  completedAt: null,
  bestScorePct: null,
  deletedAt: null,
  serverSeq: null,
  ...row,
});

const remote = (row: Partial<SectionProgressSyncRow> = {}): SectionProgressSyncRow => ({
  sectionId: 'intervals-1',
  completedAt: null,
  bestScorePct: null,
  deletedAt: null,
  serverSeq: 5,
  ...row,
});

const { merge, mergeAdopted } = progressSyncTable;

describe('merge', () => {
  it('takes a section this device has never recorded', () => {
    expect(merge(undefined, remote({ completedAt: LATER, bestScorePct: 80 }))).toEqual({
      sectionId: 'intervals-1',
      completedAt: LATER,
      bestScorePct: 80,
      deletedAt: null,
      serverSeq: 5,
    });
  });

  /**
   * The case a replace-the-local-row merge would get wrong: an offline completion lives only here,
   * and the server's row is the fold of everything *else*.
   */
  it('keeps an earlier completion the server has not been told about', () => {
    const merged = merge(local({ completedAt: EARLIER }), remote({ completedAt: LATER }));

    expect(merged?.completedAt).toBe(EARLIER);
  });

  it('leaves that row unsent, so the earlier completion still reaches other devices', () => {
    const merged = merge(local({ completedAt: EARLIER }), remote({ completedAt: LATER }));

    expect(merged?.serverSeq).toBeNull();
  });

  it('keeps the better score whichever side holds it', () => {
    expect(merge(local({ bestScorePct: 90 }), remote({ bestScorePct: 60 }))?.bestScorePct).toBe(90);
    expect(merge(local({ bestScorePct: 60 }), remote({ bestScorePct: 90 }))?.bestScorePct).toBe(90);
  });

  /** Nothing recorded must never displace something recorded, in either direction. */
  it('does not let a null erase a value', () => {
    expect(merge(local({ completedAt: EARLIER }), remote({ completedAt: null }))?.completedAt).toBe(
      EARLIER,
    );
    expect(merge(local({ completedAt: null }), remote({ completedAt: LATER }))?.completedAt).toBe(
      LATER,
    );
  });

  /**
   * Once the fold matches what the server sent, the server has everything and the row can carry
   * its sequence value — otherwise the push path would re-send an already-settled row forever.
   */
  it('marks the row settled when the server already has the fold', () => {
    const merged = merge(
      local({ completedAt: EARLIER, bestScorePct: 70 }),
      remote({ completedAt: EARLIER, bestScorePct: 70, serverSeq: 9 }),
    );

    expect(merged?.serverSeq).toBe(9);
  });

  it('settles a row the server improved on', () => {
    const merged = merge(
      local({ completedAt: LATER, bestScorePct: 50 }),
      remote({ completedAt: EARLIER, bestScorePct: 90, serverSeq: 9 }),
    );

    expect(merged).toEqual({
      sectionId: 'intervals-1',
      completedAt: EARLIER,
      bestScorePct: 90,
      deletedAt: null,
      serverSeq: 9,
    });
  });

  /** The property the whole rule rests on: order does not matter and repetition changes nothing. */
  it('is idempotent', () => {
    const once = merge(local({ completedAt: EARLIER }), remote({ completedAt: LATER }));
    const twice = merge(once ?? undefined, remote({ completedAt: LATER }));

    expect(twice).toEqual(once);
  });

  it('converges regardless of which row arrives first', () => {
    const a = remote({ completedAt: EARLIER, bestScorePct: 40, serverSeq: 3 });
    const b = remote({ completedAt: LATER, bestScorePct: 95, serverSeq: 3 });

    const forwards = merge(merge(undefined, a) ?? undefined, b);
    const backwards = merge(merge(undefined, b) ?? undefined, a);

    expect(forwards?.completedAt).toBe(backwards?.completedAt);
    expect(forwards?.bestScorePct).toBe(backwards?.bestScorePct);
  });
});

describe('mergeAdopted', () => {
  it('carries a guest row into an account that has nothing for that section', () => {
    expect(mergeAdopted(undefined, local({ completedAt: EARLIER, serverSeq: 4 }))).toEqual({
      sectionId: 'intervals-1',
      completedAt: EARLIER,
      bestScorePct: null,
      deletedAt: null,
      serverSeq: null,
    });
  });

  /**
   * Both rows are real work by the same person, so neither wins outright — the account may already
   * hold a better score from another device.
   */
  it('folds the guest row into what the account already has', () => {
    const merged = mergeAdopted(
      local({ completedAt: LATER, bestScorePct: 90 }),
      local({ completedAt: EARLIER, bestScorePct: 50 }),
    );

    expect(merged).toEqual({
      sectionId: 'intervals-1',
      completedAt: EARLIER,
      bestScorePct: 90,
      deletedAt: null,
      serverSeq: null,
    });
  });
});
