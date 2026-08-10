/**
 * The `pathway_enrollments` half of sync (BACKEND_PLAN.md §7).
 *
 * Enrollment is mutable state — started, worked on, dropped — so it merges last-write-wins on the
 * writing device's `client_updated_at`, exactly like a preference.
 *
 * The three-active-pathways cap is not applied here. Rows merge one at a time and commutatively, so
 * two devices that each start a fourth pathway offline both succeed; enforcing a count would mean
 * rejecting one device's push permanently. The client keeps the three most recently active and
 * tombstones the rest, which converges without ever failing a write.
 */
import { pgSchema } from '@guitar/db';
import type { EnrollmentMutation, EnrollmentSyncRow } from '@guitar/shared';
import { and, eq, inArray } from 'drizzle-orm';

import type { ServerSyncTable } from './spec';

const { pathwayEnrollments } = pgSchema;

interface EnrollmentSelection {
  pathwayId: string;
  startedAt: Date;
  lastActiveAt: Date;
  clientUpdatedAt: Date;
  deletedAt: Date | null;
  serverSeq: number;
}

function latestPerPathway(mutations: EnrollmentMutation[]): EnrollmentMutation[] {
  const latest = new Map<string, EnrollmentMutation>();

  for (const mutation of mutations) {
    const previous = latest.get(mutation.pathwayId);

    if (!previous || mutation.clientUpdatedAt >= previous.clientUpdatedAt) {
      latest.set(mutation.pathwayId, mutation);
    }
  }

  return [...latest.values()];
}

export const enrollmentsSyncTable: ServerSyncTable<'pathwayEnrollments'> = {
  name: 'pathwayEnrollments',
  table: pathwayEnrollments,
  userId: pathwayEnrollments.userId,
  serverSeq: pathwayEnrollments.serverSeq,

  selection: {
    pathwayId: pathwayEnrollments.pathwayId,
    startedAt: pathwayEnrollments.startedAt,
    lastActiveAt: pathwayEnrollments.lastActiveAt,
    clientUpdatedAt: pathwayEnrollments.clientUpdatedAt,
    deletedAt: pathwayEnrollments.deletedAt,
    serverSeq: pathwayEnrollments.serverSeq,
  },

  toWire(row): EnrollmentSyncRow {
    const selected = row as unknown as EnrollmentSelection;

    return {
      pathwayId: selected.pathwayId,
      startedAt: selected.startedAt.getTime(),
      lastActiveAt: selected.lastActiveAt.getTime(),
      clientUpdatedAt: selected.clientUpdatedAt.getTime(),
      deletedAt: selected.deletedAt?.getTime() ?? null,
      serverSeq: selected.serverSeq,
    };
  },

  dedupe: latestPerPathway,

  /**
   * A drop carries no `started_at` or `last_active_at` — the device is saying the enrollment is
   * over, not when it began. Both columns are not-null, so the tombstone's own stamp fills them:
   * the row is deleted, and nothing on either side reads those values again.
   */
  toValues(userId, mutation) {
    const stamped = new Date(mutation.clientUpdatedAt).toISOString();

    if (mutation.op === 'delete') {
      return {
        user_id: userId,
        pathway_id: mutation.pathwayId,
        started_at: stamped,
        last_active_at: stamped,
        client_updated_at: stamped,
        deleted_at: stamped,
      };
    }

    return {
      user_id: userId,
      pathway_id: mutation.pathwayId,
      started_at: new Date(mutation.startedAt).toISOString(),
      last_active_at: new Date(mutation.lastActiveAt).toISOString(),
      client_updated_at: stamped,
      deleted_at: null,
    };
  },

  settledWhere(userId, mutations) {
    return and(
      eq(pathwayEnrollments.userId, userId),
      inArray(
        pathwayEnrollments.pathwayId,
        mutations.map((mutation) => mutation.pathwayId),
      ),
    );
  },
};
