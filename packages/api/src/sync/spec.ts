/**
 * What `sync.pull` and `sync.push` need to know about one table (BACKEND_PLAN.md §7).
 *
 * The protocol itself — paging, the merge statement, the read-back of what settled — is generic
 * and lives in `cursor.ts`, `merge.ts` and the router. Everything a table cannot share with its
 * neighbours is named here, and there is exactly one implementation per synced table.
 *
 * The split is deliberate: the router should be unable to handle a table by forgetting it. It
 * iterates the registry in `tables.ts`, so a table that is declared is carried, and a table that is
 * not declared fails the parity test rather than silently never syncing.
 */
import type { SyncedTableName, SyncMutation, SyncRow } from '@guitar/shared';
import type { SQL } from 'drizzle-orm';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';

export interface ServerSyncTable<K extends SyncedTableName = SyncedTableName> {
  name: K;
  table: PgTable;
  /** Scopes every statement to the requesting account. Ownership, not the cursor, is the boundary. */
  userId: AnyPgColumn;
  /** The paging column, drawn from the one global sequence (§7). */
  serverSeq: AnyPgColumn;
  /**
   * The columns both `pull` and `push` return, keyed by their wire names. Selected explicitly
   * rather than with `select()`: `user_id` is never sent back, because the device asked as that
   * user and echoing it would only invite a client to trust it.
   */
  selection: Record<string, AnyPgColumn>;
  /** One selected row as the wire carries it — instants become epoch milliseconds (§8). */
  toWire(row: Record<string, unknown>): SyncRow<K>;
  /**
   * Reduces a batch to one mutation per row identity.
   *
   * `INSERT ... ON CONFLICT` cannot touch the same row twice in one statement — Postgres errors
   * rather than merging — so a device that wrote the same row three times offline has to arrive as
   * one. How three writes become one is the table's own business: the latest wins under
   * last-write-wins, they fold together under monotonic, and the first is kept under append-only.
   */
  dedupe(mutations: SyncMutation<K>[]): SyncMutation<K>[];
  /** One mutation as a row for `mergeValuesSql`, keyed by database column name. */
  toValues(userId: string, mutation: SyncMutation<K>): Record<string, unknown>;
  /**
   * Matches every row the batch named — including the ones whose merge the device lost, which is
   * the whole reason push answers with rows (§7).
   */
  settledWhere(userId: string, mutations: SyncMutation<K>[]): SQL | undefined;
}
