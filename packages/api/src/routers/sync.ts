/**
 * `sync.pull` and `sync.push` — the whole sync protocol (BACKEND_PLAN.md §7).
 *
 * The device's SQLite is the source of truth for reads and writes (§6); these two procedures are
 * how it reconciles with the server. There is no persistent connection and no third-party sync
 * service: two ordinary tRPC calls over the same Worker as everything else, which is what keeps
 * this compatible with Workers and free.
 *
 * Neither procedure names a table. Both walk `SERVER_SYNC_TABLE_LIST`, so a new synced table is
 * carried by declaring it rather than by editing these procedures — which would otherwise keep
 * compiling, keep passing, and keep leaving the new table out of every sync.
 *
 * Both are `protectedProcedure` and both scope every statement to `ctx.user.id`. A cursor is a
 * position in one global sequence shared by all users, so it is not secret and not a capability —
 * the ownership filter is what stops one account reading another's rows, not the cursor.
 */
import { syncMergeRules, type Db } from '@guitar/db';
import {
  emptySyncRows,
  syncPullInput,
  syncPullResult,
  syncPushInput,
  syncPushResult,
  SYNC_PULL_LIMIT,
  type SyncRowsByTable,
} from '@guitar/shared';
import { and, asc, eq, gt } from 'drizzle-orm';

import { MIN_VALID_CURSOR, resolvePage } from '../sync/cursor';
import { mergeValuesSql } from '../sync/merge';
import { SERVER_SYNC_TABLE_LIST } from '../sync/tables';
import type { ServerSyncTable } from '../sync/spec';
import { protectedProcedure, router } from '../trpc/init';

/** A row as the driver hands it back, before its table's adapter gives it a shape. */
type SelectedRow = Record<string, unknown>;

/**
 * Runs every statement as one Neon array-form transaction (§3) — the only kind `neon-http` has, and
 * one HTTP request rather than one per table.
 *
 * The queries are assembled in a loop, so the non-empty tuple type `batch` wants is gone by the
 * time it sees them. The cast restores it; the emptiness it asserts is checked by each caller.
 */
async function runBatch(db: Db, queries: unknown[]): Promise<SelectedRow[][]> {
  type Batch = Parameters<typeof db.batch>[0];

  return (await db.batch(queries as unknown as Batch)) as unknown as SelectedRow[][];
}

export const syncRouter = router({
  /**
   * Rows written since `cursor`, oldest first.
   *
   * Tombstones come back like any other row — a device learns about a deletion by receiving the
   * deleted row, which is the entire reason deletes are soft (§7).
   *
   * One page is read per table against a single shared sequence, so the cursor is the *lowest*
   * stopping point among the tables that filled theirs. `resolvePage` is where that boundary is
   * worked out and why it cannot simply be the highest sequence value seen.
   */
  pull: protectedProcedure
    .input(syncPullInput)
    .output(syncPullResult)
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? SYNC_PULL_LIMIT;

      const queries = SERVER_SYNC_TABLE_LIST.map((spec) =>
        ctx.db
          .select(spec.selection)
          .from(spec.table)
          .where(and(eq(spec.userId, ctx.user.id), gt(spec.serverSeq, input.cursor)))
          // Every synced table is indexed (user_id, server_seq), so this is a range scan not a sort.
          .orderBy(asc(spec.serverSeq))
          .limit(limit),
      );

      const results = await runBatch(ctx.db, queries);

      const rows = Object.fromEntries(
        SERVER_SYNC_TABLE_LIST.map((spec, index) => [
          spec.name,
          (results[index] ?? []).map((row) => spec.toWire(row)),
        ]),
      );

      const page = resolvePage(input.cursor, limit, rows);

      return {
        cursor: page.cursor,
        minValidCursor: MIN_VALID_CURSOR,
        hasMore: page.hasMore,
        rows: { ...emptySyncRows(), ...page.rows } as SyncRowsByTable,
      };
    }),

  /**
   * Applies a device's writes under each table's merge rule, and answers with what the server
   * settled on for every row the batch touched.
   *
   * Every table's merge and its read-back go out in one transaction, so the rows returned are the
   * merged state and not a snapshot something else has already moved past. This is the write path
   * that batch form exists for.
   */
  push: protectedProcedure
    .input(syncPushInput)
    .output(syncPushResult)
    .mutation(async ({ ctx, input }) => {
      const queries: unknown[] = [];
      // Where each table's read-back lands in `queries`, recorded as the pair is appended.
      const readBacks: { spec: ServerSyncTable; index: number }[] = [];

      for (const spec of SERVER_SYNC_TABLE_LIST) {
        const mutations = spec.dedupe([...(input[spec.name] ?? [])]);
        if (!mutations.length) continue;

        const where = spec.settledWhere(ctx.user.id, mutations);
        if (!where) continue;

        queries.push(
          ctx.db.execute(
            mergeValuesSql(
              spec.table,
              syncMergeRules[spec.name],
              mutations.map((mutation) => spec.toValues(ctx.user.id, mutation)),
            ),
          ),
        );

        // Every row the batch named, not just the ones that changed. A device whose write lost the
        // merge has to be told what won, or it re-pushes the same losing row forever — the winning
        // row may sit below its cursor and never be pulled again.
        readBacks.push({ spec, index: queries.length });
        queries.push(ctx.db.select(spec.selection).from(spec.table).where(where));
      }

      if (!queries.length) return { rows: emptySyncRows() };

      const results = await runBatch(ctx.db, queries);
      const rows = emptySyncRows();

      for (const { spec, index } of readBacks) {
        Object.assign(rows, {
          [spec.name]: (results[index] ?? []).map((row) => spec.toWire(row)),
        });
      }

      return { rows };
    }),
});
