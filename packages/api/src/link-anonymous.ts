/**
 * Guest → real account linking (BACKEND_PLAN.md §5).
 *
 * Every synced row is keyed by `user_id`, so a guest who signs in with Apple, Google, or email
 * would otherwise leave all of it behind under a user row Better Auth deletes moments later. This
 * moves those rows onto the real account first, merging them under each table's rule from §7 —
 * which is what makes the "account already exists on another device" case a merge rather than one
 * side overwriting the other.
 *
 * The guest's own rows are not deleted here. Better Auth removes the anonymous user immediately
 * after this resolves, and `user_id` cascades, so deleting them would be doing the same work twice
 * and would strand the rows if the cascade were the thing that failed.
 */
import { syncedTables, syncMergeRules, type Db, type SyncedTableName } from '@guitar/db';
import type { PgTable } from 'drizzle-orm/pg-core';

import { mergeRowsIntoUserSql } from './sync/merge';

const tables = Object.entries(syncedTables) as [SyncedTableName, PgTable][];

/**
 * Statements run one at a time: `neon-http` cannot open an interactive transaction (§3), and
 * Neon's array-form transaction is reserved for the write path that needs it — `sync.push`, where
 * a batch is one user action. Here a failure part-way is safe without it. Throwing aborts Better
 * Auth's `onLinkAccount`, which leaves the guest user undeleted and the sign-in failed, so the
 * device still holds its guest session and the next attempt replays the whole merge. Both merge
 * rules are idempotent, so the replay converges.
 */
export async function linkAnonymousUser({
  db,
  anonymousUserId,
  userId,
}: {
  db: Db;
  anonymousUserId: string;
  userId: string;
}): Promise<void> {
  // Better Auth also fires the hook when a guest signs in as themselves again; there is nothing to
  // move, and the statement would merge a row with itself.
  if (anonymousUserId === userId) return;

  for (const [name, table] of tables) {
    await db.execute(
      mergeRowsIntoUserSql(table, syncMergeRules[name], {
        fromUserId: anonymousUserId,
        toUserId: userId,
      }),
    );
  }
}
