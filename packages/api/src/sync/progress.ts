/**
 * The `section_progress` half of sync (BACKEND_PLAN.md §7).
 *
 * The one table that merges monotonically: `completed_at` folds with `least` and `best_score_pct`
 * with `greatest`, so the result does not depend on which device's push arrives first and applying
 * the same push twice changes nothing. That is why this table carries no client timestamp at all.
 *
 * `dedupe` has to fold rather than pick a winner, and that is the subtle part. A batch reaching
 * `INSERT ... ON CONFLICT` twice for one row is a Postgres error, so duplicates must collapse
 * before the statement is built — and collapsing them by "last one wins" would quietly apply a
 * different rule to two writes in the same batch than the database applies to two writes from
 * different devices. Folding here is what keeps the one rule the only rule.
 */
import { pgSchema } from '@guitar/db';
import type { SectionProgressMutation, SectionProgressSyncRow } from '@guitar/shared';
import { and, eq, inArray } from 'drizzle-orm';

import type { ServerSyncTable } from './spec';

const { sectionProgress } = pgSchema;

interface ProgressSelection {
  sectionId: string;
  completedAt: Date | null;
  bestScorePct: number | null;
  deletedAt: Date | null;
  serverSeq: number;
}

/** Null means "nothing recorded", so it never displaces a real value on either side of the fold. */
function earliest(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.min(a, b);
}

function greatest(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}

function foldPerSection(mutations: SectionProgressMutation[]): SectionProgressMutation[] {
  const folded = new Map<string, SectionProgressMutation>();

  for (const mutation of mutations) {
    const previous = folded.get(mutation.sectionId);

    folded.set(
      mutation.sectionId,
      previous
        ? {
            sectionId: mutation.sectionId,
            completedAt: earliest(previous.completedAt, mutation.completedAt),
            bestScorePct: greatest(previous.bestScorePct, mutation.bestScorePct),
          }
        : mutation,
    );
  }

  return [...folded.values()];
}

export const progressSyncTable: ServerSyncTable<'sectionProgress'> = {
  name: 'sectionProgress',
  table: sectionProgress,
  userId: sectionProgress.userId,
  serverSeq: sectionProgress.serverSeq,

  selection: {
    sectionId: sectionProgress.sectionId,
    completedAt: sectionProgress.completedAt,
    bestScorePct: sectionProgress.bestScorePct,
    deletedAt: sectionProgress.deletedAt,
    serverSeq: sectionProgress.serverSeq,
  },

  toWire(row): SectionProgressSyncRow {
    const selected = row as unknown as ProgressSelection;

    return {
      sectionId: selected.sectionId,
      completedAt: selected.completedAt?.getTime() ?? null,
      bestScorePct: selected.bestScorePct,
      deletedAt: selected.deletedAt?.getTime() ?? null,
      serverSeq: selected.serverSeq,
    };
  },

  dedupe: foldPerSection,

  /**
   * `deleted_at` is always null. Progress has no delete: the merge only moves values one way, so a
   * tombstone racing an upsert would be resurrected by the next device to report the same section.
   */
  toValues(userId, mutation) {
    return {
      user_id: userId,
      section_id: mutation.sectionId,
      completed_at:
        mutation.completedAt === null ? null : new Date(mutation.completedAt).toISOString(),
      best_score_pct: mutation.bestScorePct,
      deleted_at: null,
    };
  },

  settledWhere(userId, mutations) {
    return and(
      eq(sectionProgress.userId, userId),
      inArray(
        sectionProgress.sectionId,
        mutations.map((mutation) => mutation.sectionId),
      ),
    );
  },
};

export { foldPerSection };
