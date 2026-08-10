/**
 * The `quiz_attempts` half of device sync (BACKEND_PLAN.md §7).
 *
 * Append-only: an attempt is an event and never changes, so there is nothing to merge. The only
 * thing a pulled row can tell this device about a row it already has is the sequence value the
 * server assigned — without which an attempt written offline stays marked unsent and is re-pushed
 * on every sync forever.
 *
 * The id is a client-generated UUIDv7, which is what makes a replayed push land on the same row
 * instead of recording the attempt twice.
 */
import { quizAttempts } from '@guitar/db/schema.sqlite';
import type { QuizAttemptMutation, QuizAttemptSyncRow } from '@guitar/shared';

import { appendOnlyAcceptsRemote } from '../reconcile';
import type { DeviceSyncTable, LocalSyncRow } from '../spec';

/** One attempt as the device holds it, with instants as epoch milliseconds. */
export interface LocalAttemptRow extends LocalSyncRow {
  attemptId: string;
  sectionId: string;
  scorePct: number;
  passed: boolean;
  answeredAt: number;
}

interface SelectedAttemptRow {
  attemptId: string;
  sectionId: string;
  scorePct: number;
  passed: boolean;
  answeredAt: Date;
  deletedAt: Date | null;
  serverSeq: number | null;
}

function fromWire(wire: QuizAttemptSyncRow): LocalAttemptRow {
  return {
    attemptId: wire.attemptId,
    sectionId: wire.sectionId,
    scorePct: wire.scorePct,
    passed: wire.passed,
    answeredAt: wire.answeredAt,
    deletedAt: wire.deletedAt,
    serverSeq: wire.serverSeq,
  };
}

export const attemptsSyncTable: DeviceSyncTable<'quizAttempts', LocalAttemptRow> = {
  name: 'quizAttempts',
  table: quizAttempts,
  userField: 'userId',
  conflictFields: ['userId', 'attemptId'],

  identity: (row) => row.attemptId,
  wireIdentity: (wire) => wire.attemptId,

  toLocal(row) {
    const selected = row as unknown as SelectedAttemptRow;

    return {
      attemptId: selected.attemptId,
      sectionId: selected.sectionId,
      scorePct: selected.scorePct,
      passed: selected.passed,
      answeredAt: selected.answeredAt.getTime(),
      deletedAt: selected.deletedAt?.getTime() ?? null,
      serverSeq: selected.serverSeq,
    };
  },

  toValues(userId, row) {
    return {
      attemptId: row.attemptId,
      userId,
      sectionId: row.sectionId,
      scorePct: row.scorePct,
      passed: row.passed,
      answeredAt: new Date(row.answeredAt),
      deletedAt: null,
      serverSeq: row.serverSeq,
    };
  },

  fromWire,

  toMutation(row): QuizAttemptMutation {
    return {
      attemptId: row.attemptId,
      sectionId: row.sectionId,
      scorePct: row.scorePct,
      passed: row.passed,
      answeredAt: row.answeredAt,
    };
  },

  merge(local, remote) {
    const outcome = appendOnlyAcceptsRemote(local, remote);

    if (outcome === 'ignore') return null;
    if (outcome === 'store') return fromWire(remote);

    // 'confirm': the row is this device's own unpushed attempt coming back. Its contents are
    // already right; all it was missing is proof the server has it.
    return { ...(local as LocalAttemptRow), serverSeq: remote.serverSeq };
  },

  /** Immutable, so an attempt the account already has is the same attempt. */
  mergeAdopted(existing, adopted) {
    return existing ? null : { ...adopted, serverSeq: null };
  },

  /**
   * Immutable applies to the app's own writes as well. Re-recording an id already stored keeps
   * what was stored — the same answer `ON CONFLICT DO NOTHING` gives on the server, so the two
   * sides cannot disagree about an attempt's contents.
   */
  mergeLocal(existing, incoming) {
    return existing ?? { ...incoming, serverSeq: null };
  },
};
