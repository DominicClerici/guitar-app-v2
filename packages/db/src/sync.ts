/**
 * How each synced table merges when the same row arrives from two places (BACKEND_PLAN.md §7).
 *
 * The rule is declared here rather than written into each caller because two separate paths merge
 * rows and must agree: `sync.push`, and the guest-to-real-account reassignment in §5. Adding a
 * synced table is then a rule declaration, not new merge code — the parity test fails if one is
 * missing.
 *
 * Columns are referenced as Drizzle columns rather than as name strings so renaming a column in
 * `schema.pg.ts` moves the rule with it instead of silently pointing at nothing.
 */
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

import { syncedTables, userPreferences } from './schema.pg';

/**
 * `monotonic` from §7's table is deliberately absent: no table declares it yet, and it needs
 * per-column `GREATEST`/`LEAST` metadata that would be invented rather than derived. It joins this
 * union when the first lesson-progress table arrives.
 */
export type MergeRule =
  /** Rows are immutable once written, so the row already on the server always wins. */
  | { kind: 'append-only' }
  /** The row whose writing device stamped `clientTimestamp` later wins the whole row. */
  | { kind: 'last-write-wins'; clientTimestamp: AnyPgColumn };

export type SyncedTableName = keyof typeof syncedTables;

export const syncMergeRules = {
  userPreferences: { kind: 'last-write-wins', clientTimestamp: userPreferences.clientUpdatedAt },
} satisfies Record<SyncedTableName, MergeRule>;
