/**
 * Every table `sync.pull` and `sync.push` carry, as the server handles them (BACKEND_PLAN.md §7).
 *
 * The router never names a table. It iterates this list, so adding a synced table is an entry here
 * plus its adapter — not a fifth place to remember to edit in a procedure that would otherwise keep
 * working, and keep silently omitting the new table from every sync.
 *
 * `satisfies` ties the keys to `@guitar/shared`'s wire registry: a table on the wire with no
 * adapter fails to compile here, which is the same guarantee `syncMergeRules` gives for merges.
 */
import type { SyncedTableName } from '@guitar/shared';

import { attemptsSyncTable } from './attempts';
import { enrollmentsSyncTable } from './enrollments';
import { preferencesSyncTable } from './preferences';
import { progressSyncTable } from './progress';
import type { ServerSyncTable } from './spec';

export const SERVER_SYNC_TABLES = {
  userPreferences: preferencesSyncTable,
  pathwayEnrollments: enrollmentsSyncTable,
  sectionProgress: progressSyncTable,
  quizAttempts: attemptsSyncTable,
} satisfies { [K in SyncedTableName]: ServerSyncTable<K> };

/** The same adapters as a list, for the paths that treat every table alike. */
export const SERVER_SYNC_TABLE_LIST = Object.values(
  SERVER_SYNC_TABLES,
) as unknown as ServerSyncTable[];
