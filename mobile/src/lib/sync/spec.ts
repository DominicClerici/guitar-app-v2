/**
 * What the device's sync loop needs to know about one table (BACKEND_PLAN.md §6, §7).
 *
 * The loop itself — pushing unsent rows, applying a pulled page, carrying rows across an account
 * change, clearing everything for a full resync — is generic and lives in `engine.ts`, `adopt.ts`
 * and `db/rows.ts`. Everything a table cannot share with its neighbours is named here, and there is
 * exactly one implementation per synced table.
 *
 * The split exists because the failures it prevents are silent ones. A resync that forgets to clear
 * a table leaves stale rows behind; a push loop that forgets a table simply never sends it. Neither
 * throws, and neither shows up on screen until a user notices their progress is wrong on a second
 * device. Iterating a registry is what makes "forgot a table" impossible to express.
 */
import type { SyncedTableName, SyncMutation, SyncRow } from '@guitar/shared';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';

/**
 * The columns every synced row carries on the device, with instants as epoch milliseconds — the
 * representation the wire and the merge comparisons both use.
 */
export interface LocalSyncRow {
  /** Non-null means a tombstone: the row is deleted, and the deletion may not be pushed yet. */
  deletedAt: number | null;
  /** `null` means "written here and not yet accepted by the server". */
  serverSeq: number | null;
}

export interface DeviceSyncTable<
  K extends SyncedTableName = SyncedTableName,
  TLocal extends LocalSyncRow = LocalSyncRow,
> {
  name: K;
  table: SQLiteTable;
  /** The property naming the owning account. Every synced table has one (§7). */
  userField: string;
  /**
   * The table's primary key, as property names — what `ON CONFLICT` targets on an upsert.
   *
   * It includes `userField` for tables whose identity is scoped to the account, like the
   * `(user_id, key)` of a preference, and omits it for tables the client names outright with a
   * generated id. `identity` is the narrower notion: which row this is *within* one account.
   */
  conflictFields: string[];

  /** A local row's identity as one string, for matching against a pulled page. */
  identity(row: TLocal): string;
  /** The same identity read off a row that arrived from the server. */
  wireIdentity(wire: SyncRow<K>): string;

  /** A selected Drizzle row as the device holds it. Instants become epoch milliseconds. */
  toLocal(row: Record<string, unknown>): TLocal;
  /** The reverse, as Drizzle insert values keyed by property name. */
  toValues(userId: string, row: TLocal): Record<string, unknown>;
  /** A pulled row as this device would store it. */
  fromWire(wire: SyncRow<K>): TLocal;

  /**
   * An unpushed local row as the mutation that sends it, or `null` when this build can no longer
   * represent the row — which happens only after a downgrade below the build that wrote it.
   * Dropping one row is the alternative to the server rejecting the whole batch and nothing on the
   * device ever syncing again.
   */
  toMutation(row: TLocal): SyncMutation<K> | null;

  /**
   * What to store given the row this device holds and the row that arrived from the server, or
   * `null` to leave the local row alone.
   *
   * A row rather than a yes/no, because "replace or keep" is only the right question for
   * last-write-wins. A monotonic table has to *fold* the two — the server's row is the fold of
   * everything it has been told, which is not everything this device knows if a local write has
   * not been pushed yet. Answering "replace" there would silently discard exactly the offline
   * progress the local row was holding.
   *
   * The returned row also decides whether the merge still owes the server something: carry the
   * remote `serverSeq` when the server already has everything, and `null` when the fold produced
   * something it has not seen, so the next push sends it.
   */
  merge(local: TLocal | undefined, remote: SyncRow<K>): TLocal | null;

  /**
   * The same decision for a row carried over from the previous account (§5), or `null` to leave
   * the new account's row alone. The result is always unpushed — under this account the server has
   * never seen it.
   */
  mergeAdopted(existing: TLocal | undefined, adopted: TLocal): TLocal | null;

  /**
   * What to store when the **app itself** writes a row, given whatever is already there.
   *
   * A local write is not automatically a replacement, and assuming it is quietly breaks the
   * monotonic table: a retake scoring worse than a previous attempt would lower `best_score_pct`
   * and un-pass a checkpoint until a server pull happened to correct it. The rule that folds two
   * devices' rows has to be the same rule that folds two writes on one device — otherwise the
   * device disagrees with the server about its own data between syncs.
   *
   * The result is always unpushed, because a local write is by definition something the server has
   * not been told.
   */
  mergeLocal(existing: TLocal | undefined, incoming: TLocal): TLocal;
}
