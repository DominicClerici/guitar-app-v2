/**
 * Starting, touching and dropping a pathway (BACKEND_PLAN.md §7).
 *
 * A write lands in the local database and returns; sync is asked for afterwards and never awaited,
 * exactly as `preferences/store.ts` does. `Date.now()` is the merge input, so it is stamped once,
 * here, at the moment of the write.
 *
 * `pathwayId` is the curriculum id — `PathwayMeta.id`, not the slug. The slug is a routing and
 * cache key and content is free to change it; the id is what an enrollment names, so a re-slugged
 * pathway does not orphan everyone's progress into it.
 */
import { readRows, writeLocalRow } from '@/lib/db/rows';
import { requestSync } from '@/lib/sync/engine';
import { enrollmentsSyncTable, type LocalEnrollmentRow } from '@/lib/sync/tables';

function liveEnrollment(userId: string, pathwayId: string): LocalEnrollmentRow | undefined {
  return readRows(enrollmentsSyncTable, userId).find(
    (row) => row.pathwayId === pathwayId && row.deletedAt === null,
  );
}

/** Enrolls, or revives a dropped enrollment. */
export function startPathway(userId: string, pathwayId: string): void {
  const now = Date.now();
  const existing = liveEnrollment(userId, pathwayId);

  writeLocalRow(enrollmentsSyncTable, userId, {
    pathwayId,
    // Restarting after a drop begins again: the tombstoned row's `startedAt` describes an attempt
    // the learner abandoned, and carrying it over would date this one to it.
    startedAt: existing?.startedAt ?? now,
    lastActiveAt: now,
    clientUpdatedAt: now,
    deletedAt: null,
    // Null marks it as unsent — this is the flag the push path reads.
    serverSeq: null,
  });

  requestSync();
}

/**
 * Records that the learner just worked on a pathway, which is what orders the Continue list and
 * decides which three enrollments survive the cap.
 *
 * A pathway nobody is enrolled in is left alone. Opening a pathway to look at it is browsing, and
 * enrolling on the strength of that would make the catalogue's Start control decorative.
 */
export function touchPathway(userId: string, pathwayId: string): void {
  const existing = liveEnrollment(userId, pathwayId);
  if (!existing) return;

  const now = Date.now();

  writeLocalRow(enrollmentsSyncTable, userId, {
    ...existing,
    lastActiveAt: now,
    clientUpdatedAt: now,
    serverSeq: null,
  });

  requestSync();
}

/**
 * Drops a pathway, as a tombstone rather than a deletion.
 *
 * A removed row is indistinguishable from "this device never had it" and would be handed straight
 * back by the next pull (§7). A tombstone's `startedAt` and `lastActiveAt` are never read — every
 * reader filters on `deletedAt` first — but the existing values are kept where there are any, so a
 * drop that loses a merge race does not also rewrite the enrollment's history.
 */
export function dropPathway(userId: string, pathwayId: string): void {
  const now = Date.now();
  const existing = liveEnrollment(userId, pathwayId);

  writeLocalRow(enrollmentsSyncTable, userId, {
    pathwayId,
    startedAt: existing?.startedAt ?? now,
    lastActiveAt: existing?.lastActiveAt ?? now,
    clientUpdatedAt: now,
    deletedAt: now,
    serverSeq: null,
  });

  requestSync();
}

/**
 * Applies the three-active cap by tombstoning whatever `activeEnrollments` set aside.
 *
 * Seeing more than the cap is the expected state, not corruption: the cap is a client rule
 * precisely so that two devices can each start a fourth pathway offline and both writes succeed
 * (§7). Every device that sees the same rows evicts the same ones, which is what makes these
 * tombstones converge instead of ping-ponging.
 */
export function dropEvictedPathways(userId: string, evicted: readonly LocalEnrollmentRow[]): void {
  for (const row of evicted) dropPathway(userId, row.pathwayId);
}
