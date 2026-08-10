/**
 * `sync.pull` and `sync.push` — the whole sync protocol (BACKEND_PLAN.md §7).
 *
 * The device's SQLite is the source of truth for reads and writes (§6); these two procedures are
 * how it reconciles with the server. There is no persistent connection and no third-party sync
 * service: two ordinary tRPC calls over the same Worker as everything else, which is what keeps
 * this compatible with Workers and free.
 *
 * Both are `protectedProcedure` and both scope every statement to `ctx.user.id`. A cursor is a
 * position in one global sequence shared by all users, so it is not secret and not a capability —
 * the ownership filter is what stops one account reading another's rows, not the cursor.
 */
import { pgSchema, syncMergeRules } from '@guitar/db';
import {
  syncPullInput,
  syncPullResult,
  syncPushInput,
  syncPushResult,
  SYNC_PULL_LIMIT,
  mutationKey,
} from '@guitar/shared';
import { and, asc, eq, gt, inArray } from 'drizzle-orm';

import { MIN_VALID_CURSOR, resolvePage } from '../sync/cursor';
import { mergeValuesSql } from '../sync/merge';
import {
  latestPerKey,
  preferenceSelection,
  preferenceValues,
  toSyncRow,
} from '../sync/preferences';
import { protectedProcedure, router } from '../trpc/init';

const { userPreferences } = pgSchema;

export const syncRouter = router({
  /**
   * Rows written since `cursor`, oldest first.
   *
   * Tombstones come back like any other row — a device learns about a deletion by receiving the
   * deleted row, which is the entire reason deletes are soft (§7).
   */
  pull: protectedProcedure
    .input(syncPullInput)
    .output(syncPullResult)
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? SYNC_PULL_LIMIT;

      const rows = await ctx.db
        .select(preferenceSelection)
        .from(userPreferences)
        .where(
          and(eq(userPreferences.userId, ctx.user.id), gt(userPreferences.serverSeq, input.cursor)),
        )
        // The index is (user_id, server_seq), so this is a range scan rather than a sort.
        .orderBy(asc(userPreferences.serverSeq))
        .limit(limit);

      const page = resolvePage(input.cursor, limit, { userPreferences: rows.map(toSyncRow) });

      return {
        cursor: page.cursor,
        minValidCursor: MIN_VALID_CURSOR,
        hasMore: page.hasMore,
        rows: { userPreferences: page.rows.userPreferences ?? [] },
      };
    }),

  /**
   * Applies a device's writes under each table's merge rule, and answers with what the server
   * settled on for every key the batch touched.
   *
   * The merge and the read-back go out as one Neon array-form transaction (§3), so the rows
   * returned are the merged state and not a snapshot something else has already moved past. This
   * is the write path that batch form exists for.
   */
  push: protectedProcedure
    .input(syncPushInput)
    .output(syncPushResult)
    .mutation(async ({ ctx, input }) => {
      const mutations = latestPerKey(input.userPreferences);

      if (!mutations.length) return { rows: { userPreferences: [] } };

      const merge = ctx.db.execute(
        mergeValuesSql(
          userPreferences,
          syncMergeRules.userPreferences,
          mutations.map((mutation) => preferenceValues(ctx.user.id, mutation)),
        ),
      );

      // Every key the batch named, not just the ones that changed. A device whose write lost the
      // merge has to be told what won, or it re-pushes the same losing row forever — the winning
      // row may sit below its cursor and never be pulled again.
      const settled = ctx.db
        .select(preferenceSelection)
        .from(userPreferences)
        .where(
          and(
            eq(userPreferences.userId, ctx.user.id),
            inArray(userPreferences.key, mutations.map(mutationKey)),
          ),
        );

      const [, rows] = await ctx.db.batch([merge, settled]);

      return { rows: { userPreferences: rows.map(toSyncRow) } };
    }),
});
