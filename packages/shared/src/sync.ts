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
 * - What a device **pushes** is validated exactly, against `preferenceEntry`, so a malformed write
 *   is rejected at the edge rather than stored.
 * - What a device **pulls** is validated loosely — `key` and `value` are plain strings. A row
 *   written by a newer version of the app must not fail an older one's pull, which would strand
 *   that device at its cursor forever. Unknown keys are dropped when the rows are folded, by
 *   `foldPreferences`.
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
 * A stored preference row as the server hands it back — from `pull`, and from `push` reporting
 * what the merge settled on.
 */
export const preferenceSyncRow = z.object({
  key: z.string(),
  value: z.string(),
  clientUpdatedAt: syncInstant,
  /** Non-null means the row is a tombstone and the device should drop its local copy. */
  deletedAt: syncInstant.nullable(),
  serverSeq: z.number().int().nonnegative(),
});
export type PreferenceSyncRow = z.infer<typeof preferenceSyncRow>;

/**
 * Rows keyed by table, rather than one flat array carrying a `table` field per row. The grouping
 * §7 describes happens on the client, which already knows which table it is writing, and each
 * table then validates under its own schema — precision a single flat union cannot express, since
 * every table's payload differs. A new synced table is a new key here.
 */
export const syncPushInput = z.object({
  userPreferences: z.array(preferenceMutation).max(SYNC_PUSH_LIMIT).default([]),
});
export type SyncPushInput = z.input<typeof syncPushInput>;

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
export const syncPushResult = z.object({
  rows: z.object({ userPreferences: z.array(preferenceSyncRow) }),
});
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
  rows: z.object({ userPreferences: z.array(preferenceSyncRow) }),
});
export type SyncPullResult = z.infer<typeof syncPullResult>;
