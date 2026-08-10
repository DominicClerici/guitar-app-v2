/**
 * The `section_progress` half of device sync (BACKEND_PLAN.md §7).
 *
 * The only monotonic table, and the only one whose merge is a fold rather than a choice. A pulled
 * row is the server's fold of everything it has been told, which is not everything this device
 * knows — a completion written offline lives here and nowhere else. Replacing the local row with
 * the server's would discard exactly that.
 *
 * So both directions fold: `completed_at` keeps the earlier and `best_score_pct` the higher, which
 * is what the server's `least`/`greatest` `ON CONFLICT` does. Because both operations are
 * commutative and idempotent, the device and the server converge without agreeing on an order and
 * without either trusting a clock.
 */
import { sectionProgress } from '@guitar/db/schema.sqlite';
import type { SectionProgressMutation, SectionProgressSyncRow } from '@guitar/shared';

import { earliest, greatest, monotonicSequence } from '../reconcile';
import type { DeviceSyncTable, LocalSyncRow } from '../spec';

/** One section's progress as the device holds it, with instants as epoch milliseconds. */
export interface LocalProgressRow extends LocalSyncRow {
  sectionId: string;
  completedAt: number | null;
  bestScorePct: number | null;
}

interface SelectedProgressRow {
  sectionId: string;
  completedAt: Date | null;
  bestScorePct: number | null;
  deletedAt: Date | null;
  serverSeq: number | null;
}

function fromWire(wire: SectionProgressSyncRow): LocalProgressRow {
  return {
    sectionId: wire.sectionId,
    completedAt: wire.completedAt,
    bestScorePct: wire.bestScorePct,
    deletedAt: wire.deletedAt,
    serverSeq: wire.serverSeq,
  };
}

export const progressSyncTable: DeviceSyncTable<'sectionProgress', LocalProgressRow> = {
  name: 'sectionProgress',
  table: sectionProgress,
  userField: 'userId',
  conflictFields: ['userId', 'sectionId'],

  identity: (row) => row.sectionId,
  wireIdentity: (wire) => wire.sectionId,

  toLocal(row) {
    const selected = row as unknown as SelectedProgressRow;

    return {
      sectionId: selected.sectionId,
      completedAt: selected.completedAt?.getTime() ?? null,
      bestScorePct: selected.bestScorePct,
      deletedAt: selected.deletedAt?.getTime() ?? null,
      serverSeq: selected.serverSeq,
    };
  },

  toValues(userId, row) {
    return {
      userId,
      sectionId: row.sectionId,
      completedAt: row.completedAt === null ? null : new Date(row.completedAt),
      bestScorePct: row.bestScorePct,
      deletedAt: null,
      serverSeq: row.serverSeq,
    };
  },

  fromWire,

  /** No delete arm: progress is never un-done, which is what makes the fold safe (§7). */
  toMutation(row): SectionProgressMutation {
    return {
      sectionId: row.sectionId,
      completedAt: row.completedAt,
      bestScorePct: row.bestScorePct,
    };
  },

  merge(local, remote) {
    if (!local) return fromWire(remote);

    const completedAt = earliest(local.completedAt, remote.completedAt);
    const bestScorePct = greatest(local.bestScorePct, remote.bestScorePct);

    return {
      sectionId: remote.sectionId,
      completedAt,
      bestScorePct,
      deletedAt: null,
      // Unsent unless the fold came out exactly as the server sent it — otherwise this device is
      // still holding something the server has never been told.
      serverSeq: monotonicSequence(
        [completedAt, bestScorePct],
        [remote.completedAt, remote.bestScorePct],
        remote.serverSeq,
      ),
    };
  },

  /**
   * Carrying a guest's progress into a real account folds rather than replaces, for the same
   * reason: both rows are real progress by the same person, and the account may already have a
   * better score from another device.
   */
  mergeAdopted(existing, adopted) {
    if (!existing) return { ...adopted, serverSeq: null };

    return {
      sectionId: adopted.sectionId,
      completedAt: earliest(existing.completedAt, adopted.completedAt),
      bestScorePct: greatest(existing.bestScorePct, adopted.bestScorePct),
      deletedAt: null,
      serverSeq: null,
    };
  },

  /**
   * The fold applies to the app's own writes too, and this is the case it exists for: a retake
   * scoring worse than a previous attempt must not lower the best score. Overwriting here would
   * un-pass a checkpoint on this device until a pull happened to restore it — the device
   * contradicting the server about data it just wrote itself.
   */
  mergeLocal(existing, incoming) {
    if (!existing) return { ...incoming, serverSeq: null };

    return {
      sectionId: incoming.sectionId,
      completedAt: earliest(existing.completedAt, incoming.completedAt),
      bestScorePct: greatest(existing.bestScorePct, incoming.bestScorePct),
      deletedAt: null,
      serverSeq: null,
    };
  },
};
