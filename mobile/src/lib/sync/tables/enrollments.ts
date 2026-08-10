/**
 * The `pathway_enrollments` half of device sync (BACKEND_PLAN.md §7).
 *
 * Last-write-wins on a per-pathway row, like a preference: starting, touching and dropping a
 * pathway are all writes to the same mutable state, and the later one owns the row.
 *
 * Dropping is a tombstone, which is what lets the three-active cap be a client rule. Two devices
 * can each start a fourth pathway offline and both succeed; whichever screen reads enrollments
 * keeps the three most recently active and tombstones the rest, and that converges without any
 * write ever being rejected.
 */
import { pathwayEnrollments } from '@guitar/db/schema.sqlite';
import type { EnrollmentMutation, EnrollmentSyncRow } from '@guitar/shared';

import { lastWriteWinsAcceptsAdopted, lastWriteWinsAcceptsRemote } from '../reconcile';
import type { DeviceSyncTable, LocalSyncRow } from '../spec';

/** An enrollment as the device holds it, with instants as epoch milliseconds. */
export interface LocalEnrollmentRow extends LocalSyncRow {
  pathwayId: string;
  startedAt: number;
  lastActiveAt: number;
  clientUpdatedAt: number;
}

interface SelectedEnrollmentRow {
  pathwayId: string;
  startedAt: Date;
  lastActiveAt: Date;
  clientUpdatedAt: Date;
  deletedAt: Date | null;
  serverSeq: number | null;
}

function fromWire(wire: EnrollmentSyncRow): LocalEnrollmentRow {
  return {
    pathwayId: wire.pathwayId,
    startedAt: wire.startedAt,
    lastActiveAt: wire.lastActiveAt,
    clientUpdatedAt: wire.clientUpdatedAt,
    deletedAt: wire.deletedAt,
    serverSeq: wire.serverSeq,
  };
}

export const enrollmentsSyncTable: DeviceSyncTable<'pathwayEnrollments', LocalEnrollmentRow> = {
  name: 'pathwayEnrollments',
  table: pathwayEnrollments,
  userField: 'userId',
  conflictFields: ['userId', 'pathwayId'],

  identity: (row) => row.pathwayId,
  wireIdentity: (wire) => wire.pathwayId,

  toLocal(row) {
    const selected = row as unknown as SelectedEnrollmentRow;

    return {
      pathwayId: selected.pathwayId,
      startedAt: selected.startedAt.getTime(),
      lastActiveAt: selected.lastActiveAt.getTime(),
      clientUpdatedAt: selected.clientUpdatedAt.getTime(),
      deletedAt: selected.deletedAt?.getTime() ?? null,
      serverSeq: selected.serverSeq,
    };
  },

  toValues(userId, row) {
    return {
      userId,
      pathwayId: row.pathwayId,
      startedAt: new Date(row.startedAt),
      lastActiveAt: new Date(row.lastActiveAt),
      clientUpdatedAt: new Date(row.clientUpdatedAt),
      deletedAt: row.deletedAt === null ? null : new Date(row.deletedAt),
      serverSeq: row.serverSeq,
    };
  },

  fromWire,

  toMutation(row): EnrollmentMutation {
    if (row.deletedAt !== null) {
      return { op: 'delete', pathwayId: row.pathwayId, clientUpdatedAt: row.clientUpdatedAt };
    }

    return {
      op: 'upsert',
      pathwayId: row.pathwayId,
      startedAt: row.startedAt,
      lastActiveAt: row.lastActiveAt,
      clientUpdatedAt: row.clientUpdatedAt,
    };
  },

  merge(local, remote) {
    return lastWriteWinsAcceptsRemote(local, remote) ? fromWire(remote) : null;
  },

  mergeAdopted(existing, adopted) {
    if (!lastWriteWinsAcceptsAdopted(existing, adopted)) return null;

    return { ...adopted, serverSeq: null };
  },

  /** The app stamps a fresh `clientUpdatedAt` on every write, so the new row simply wins. */
  mergeLocal(_existing, incoming) {
    return { ...incoming, serverSeq: null };
  },
};
