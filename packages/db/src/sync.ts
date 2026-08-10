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
 *
 * `SyncedTableName` comes from `@guitar/shared`'s wire registry rather than from `syncedTables`
 * here, which makes the `satisfies` below enforce both directions at compile time: a table with a
 * wire entry and no merge rule fails, and so does a merge rule for a table the protocol does not
 * carry.
 */
import type { SyncedTableName } from '@guitar/shared';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

import { pathwayEnrollments, quizAttempts, sectionProgress, userPreferences } from './schema.pg';

export type { SyncedTableName };

export type MergeRule =
  /** Rows are immutable once written, so the row already on the server always wins. */
  | { kind: 'append-only' }
  /** The row whose writing device stamped `clientTimestamp` later wins the whole row. */
  | { kind: 'last-write-wins'; clientTimestamp: AnyPgColumn }
  /**
   * Per-column convergence with no timestamp at all (§7).
   *
   * `earliest` columns keep the smaller value and `greatest` the larger, so a first-completion date
   * only ever moves backwards and a best score only ever moves forwards. Both operations are
   * commutative and idempotent, which is what lets this rule ignore clocks entirely — two devices
   * that each finished a lesson offline converge on the same row in either order, and replaying a
   * push changes nothing.
   *
   * Columns named in neither list keep the row already on the server. A column that must move with
   * its row belongs under a last-write-wins rule instead.
   */
  | { kind: 'monotonic'; earliest?: AnyPgColumn[]; greatest?: AnyPgColumn[] };

export const syncMergeRules = {
  userPreferences: { kind: 'last-write-wins', clientTimestamp: userPreferences.clientUpdatedAt },

  /** Started, worked on, dropped — a mutable state, so the later write owns the whole row. */
  pathwayEnrollments: {
    kind: 'last-write-wins',
    clientTimestamp: pathwayEnrollments.clientUpdatedAt,
  },

  /**
   * The first completion is the one that counts and the best score is the one worth keeping, which
   * is exactly `least` and `greatest`. Neither needs a clock, so this table carries no
   * `client_updated_at` at all — there is no ordering to be wrong about.
   */
  sectionProgress: {
    kind: 'monotonic',
    earliest: [sectionProgress.completedAt],
    greatest: [sectionProgress.bestScorePct],
  },

  /** An attempt is an event: immutable once written, so a replayed push is a no-op. */
  quizAttempts: { kind: 'append-only' },
} satisfies Record<SyncedTableName, MergeRule>;
