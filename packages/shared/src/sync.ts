import { z } from 'zod';

import { preferenceKey, preferenceEntry } from './preferences';

/**
 * The sync protocol's wire contracts (BACKEND_PLAN.md §7).
 *
 * `sync.pull` and `sync.push` are the only two procedures the device talks to about its data, and
 * these schemas are what both halves agree on. They live here rather than in the API package
 * because the device validates what it receives for the same reason the server validates what it
 * receives: a row is applied to the local database, which is the app's source of truth (§6).
 *
 * Two shapes are deliberately different strictnesses:
 *
 * - What a device **pushes** is validated exactly, so a malformed write is rejected at the edge
 *   rather than stored.
 * - What a device **pulls** is validated loosely — identifiers and values are plain strings. A row
 *   written by a newer version of the app must not fail an older one's pull, which would strand
 *   that device at its cursor forever. Rows it cannot make sense of are dropped when they are
 *   folded into whatever the feature actually reads.
 *
 * The per-table shapes come first, then `SYNCED_TABLE_SPECS` gathers them and the request and
 * response schemas are **built from that registry**. Adding a synced table is one entry there
 * rather than four parallel edits that can each be forgotten independently.
 */

/**
 * Instants cross the wire as epoch milliseconds rather than ISO strings, because the device stores
 * them as integers (SQLite has no timestamp type, §8) and the server as `timestamptz`. A number is
 * the one representation neither side has to parse to compare.
 */
export const syncInstant = z.number().int().nonnegative();

/** Rows per table per `pull` page. Also the ceiling a client may ask for. */
export const SYNC_PULL_LIMIT = 200;

/**
 * Operations per table per `push`. A device that has been offline for a long time sends several
 * batches rather than one unbounded statement — a single `INSERT ... VALUES` of arbitrary width is
 * how a sync request turns into a Worker CPU-time failure.
 */
export const SYNC_PUSH_LIMIT = 500;

// ---------------------------------------------------------------------------
// user_preferences — last-write-wins on a per-key row
// ---------------------------------------------------------------------------

/**
 * One preference write, as the device sends it.
 *
 * `delete` is a tombstone, not a removal (§7): it means "this preference is back to its default",
 * and it carries the same `clientUpdatedAt` as any other write because that timestamp is the sole
 * input to the last-write-wins merge. A delete that loses to a later write from another device
 * therefore does nothing, which is the intended behaviour.
 */
export const preferenceMutation = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('upsert'),
    entry: preferenceEntry,
    clientUpdatedAt: syncInstant,
  }),
  z.object({
    op: z.literal('delete'),
    key: preferenceKey,
    clientUpdatedAt: syncInstant,
  }),
]);
export type PreferenceMutation = z.infer<typeof preferenceMutation>;

/** The key a mutation addresses, whichever arm it is. */
export function mutationKey(mutation: PreferenceMutation): string {
  return mutation.op === 'upsert' ? mutation.entry.key : mutation.key;
}

/**
 * The two columns every synced row carries back from the server (§7). Spread into each table's row
 * schema rather than repeated, so a change to the protocol's own fields is one edit.
 */
const syncedRowFields = {
  /** Non-null means the row is a tombstone and the device should drop its local copy. */
  deletedAt: syncInstant.nullable(),
  serverSeq: z.number().int().nonnegative(),
};

/**
 * A stored preference row as the server hands it back — from `pull`, and from `push` reporting
 * what the merge settled on.
 */
export const preferenceSyncRow = z.object({
  key: z.string(),
  value: z.string(),
  clientUpdatedAt: syncInstant,
  ...syncedRowFields,
});
export type PreferenceSyncRow = z.infer<typeof preferenceSyncRow>;

// ---------------------------------------------------------------------------
// The learning system (BACKEND_PLAN.md §7). Three tables, one per merge rule.
// ---------------------------------------------------------------------------

/** A percentage score, which is what both a quiz attempt and a best score are measured in. */
export const scorePct = z.number().int().min(0).max(100);

/**
 * Starting, touching, or dropping a pathway.
 *
 * Enrollment is mutable state, so it merges last-write-wins and a drop is an ordinary tombstone —
 * one that deliberately leaves the user's `sectionProgress` behind, so starting the pathway again
 * resumes rather than restarts.
 */
export const enrollmentMutation = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('upsert'),
    pathwayId: z.string().min(1),
    startedAt: syncInstant,
    lastActiveAt: syncInstant,
    clientUpdatedAt: syncInstant,
  }),
  z.object({
    op: z.literal('delete'),
    pathwayId: z.string().min(1),
    clientUpdatedAt: syncInstant,
  }),
]);
export type EnrollmentMutation = z.infer<typeof enrollmentMutation>;

/** The pathway a mutation addresses, whichever arm it is. */
export function enrollmentPathwayId(mutation: EnrollmentMutation): string {
  return mutation.pathwayId;
}

export const enrollmentSyncRow = z.object({
  pathwayId: z.string(),
  startedAt: syncInstant,
  lastActiveAt: syncInstant,
  clientUpdatedAt: syncInstant,
  ...syncedRowFields,
});
export type EnrollmentSyncRow = z.infer<typeof enrollmentSyncRow>;

/**
 * How far the user has got in one section.
 *
 * There is no `op` and no delete arm, and that is the rule rather than an omission: this table
 * merges monotonically, so a completion only ever moves earlier and a best score only ever moves
 * higher. Nothing can un-do progress, which is why the merge needs no client timestamp — there is
 * no ordering between two devices to get wrong.
 */
export const sectionProgressMutation = z.object({
  sectionId: z.string().min(1),
  completedAt: syncInstant.nullable(),
  bestScorePct: scorePct.nullable(),
});
export type SectionProgressMutation = z.infer<typeof sectionProgressMutation>;

export const sectionProgressSyncRow = z.object({
  sectionId: z.string(),
  completedAt: syncInstant.nullable(),
  // Loose on the way in: a build that widened what a score may be must not strand an older device.
  bestScorePct: z.number().int().nullable(),
  ...syncedRowFields,
});
export type SectionProgressSyncRow = z.infer<typeof sectionProgressSyncRow>;

/**
 * One completed quiz or checkpoint attempt.
 *
 * Append-only, so there is no delete arm here either: an attempt is an event, immutable once
 * written. `attemptId` is a client-generated UUIDv7 because an event has nothing else to name it.
 */
export const quizAttemptMutation = z.object({
  attemptId: z.string().min(1),
  sectionId: z.string().min(1),
  scorePct,
  passed: z.boolean(),
  answeredAt: syncInstant,
});
export type QuizAttemptMutation = z.infer<typeof quizAttemptMutation>;

export const quizAttemptSyncRow = z.object({
  attemptId: z.string(),
  sectionId: z.string(),
  scorePct: z.number().int(),
  passed: z.boolean(),
  answeredAt: syncInstant,
  ...syncedRowFields,
});
export type QuizAttemptSyncRow = z.infer<typeof quizAttemptSyncRow>;

// ---------------------------------------------------------------------------
// The registry
// ---------------------------------------------------------------------------

/**
 * Every table the sync protocol carries, as the wire sees it.
 *
 * This is the list `syncPushInput`, `syncPushResult` and `syncPullResult` are generated from, and
 * the list both the device engine and the server router iterate. `@guitar/db` declares the same set
 * of tables for Postgres and SQLite; the parity test asserts the two lists match, because a table
 * with storage and no wire entry — or the reverse — fails silently rather than loudly.
 */
export const SYNCED_TABLE_SPECS = {
  userPreferences: { mutation: preferenceMutation, row: preferenceSyncRow },
  pathwayEnrollments: { mutation: enrollmentMutation, row: enrollmentSyncRow },
  sectionProgress: { mutation: sectionProgressMutation, row: sectionProgressSyncRow },
  quizAttempts: { mutation: quizAttemptMutation, row: quizAttemptSyncRow },
} as const;

export type SyncedTableName = keyof typeof SYNCED_TABLE_SPECS;

export const SYNCED_TABLE_NAMES = Object.keys(SYNCED_TABLE_SPECS) as SyncedTableName[];

type MutationSchema<K extends SyncedTableName> = (typeof SYNCED_TABLE_SPECS)[K]['mutation'];
type RowSchema<K extends SyncedTableName> = (typeof SYNCED_TABLE_SPECS)[K]['row'];

/** What one table contributes to a push request. */
export type SyncMutation<K extends SyncedTableName = SyncedTableName> = z.infer<MutationSchema<K>>;
/** What one table contributes to a push or pull response. */
export type SyncRow<K extends SyncedTableName = SyncedTableName> = z.infer<RowSchema<K>>;

/**
 * Mutations keyed by table, rather than one flat array carrying a `table` field per row. The
 * grouping §7 describes happens on the client, which already knows which table it is writing, and
 * each table then validates under its own schema — precision a single flat union cannot express,
 * since every table's payload differs.
 *
 * Every key defaults to an empty array, so a device with nothing to say about a table simply omits
 * it instead of sending an empty list per table on every sync.
 */
const pushShape = Object.fromEntries(
  Object.entries(SYNCED_TABLE_SPECS).map(([name, spec]) => [
    name,
    z.array(spec.mutation).max(SYNC_PUSH_LIMIT).default([]),
  ]),
) as { [K in SyncedTableName]: z.ZodDefault<z.ZodArray<MutationSchema<K>>> };

export const syncPushInput = z.object(pushShape);
export type SyncPushInput = z.input<typeof syncPushInput>;

const rowShape = Object.fromEntries(
  Object.entries(SYNCED_TABLE_SPECS).map(([name, spec]) => [name, z.array(spec.row)]),
) as { [K in SyncedTableName]: z.ZodArray<RowSchema<K>> };

/** Rows keyed by table. The same shape answers both `push` and `pull`. */
export const syncRowsByTable = z.object(rowShape);
export type SyncRowsByTable = z.infer<typeof syncRowsByTable>;

/** A full set of empty per-table row arrays, for the paths that return or accumulate nothing. */
export function emptySyncRows(): SyncRowsByTable {
  return Object.fromEntries(
    SYNCED_TABLE_NAMES.map((name) => [name, []]),
  ) as unknown as SyncRowsByTable;
}

/**
 * What the server settled on for every row the push touched — including the rows whose merge the
 * device **lost**.
 *
 * This is why push returns rows rather than the new cursor §7 first sketched. A cursor cannot be
 * advanced from a push: the sequence values the write consumed say nothing about what other
 * devices wrote below them, and skipping to the highest one would silently drop those rows. Rows
 * also settle the losing case, which a cursor cannot: the device's copy is stale, the winning row
 * may already sit below its cursor, and without being told it here the device would re-push the
 * same losing row on every sync forever.
 */
export const syncPushResult = z.object({ rows: syncRowsByTable });
export type SyncPushResult = z.infer<typeof syncPushResult>;

export const syncPullInput = z.object({
  /** The highest `server_seq` this device has already applied. Zero on a first or full resync. */
  cursor: z.number().int().nonnegative(),
  limit: z.number().int().min(1).max(SYNC_PULL_LIMIT).optional(),
});
export type SyncPullInput = z.infer<typeof syncPullInput>;

export const syncPullResult = z.object({
  /** Where to resume. Only ever moves forward, and only past rows included in this page. */
  cursor: z.number().int().nonnegative(),
  /**
   * The oldest cursor the server can still serve correctly. Tombstones are purged after 90 days
   * (§7), and a device whose cursor predates a purge would never learn about those deletions — so
   * a cursor below this must be discarded and the device must resync from zero.
   */
  minValidCursor: z.number().int().nonnegative(),
  /** Whether another page is waiting. The device keeps pulling until this is false. */
  hasMore: z.boolean(),
  rows: syncRowsByTable,
});
export type SyncPullResult = z.infer<typeof syncPullResult>;
