/**
 * Every table the device syncs (BACKEND_PLAN.md §6, §7).
 *
 * The engine, the account-change carry-over and the full-resync clear all walk this list rather
 * than naming tables, so a new synced table is an entry here plus its adapter.
 *
 * `satisfies Record<SyncedTableName, unknown>` is what ties the keys to `@guitar/shared`'s wire
 * registry: a table the protocol carries with no adapter here fails to compile. It asserts nothing
 * about the values because each adapter is already annotated as a `DeviceSyncTable` at its own
 * definition, which is where its table name and row type get pinned together.
 */
import type { SyncedTableName } from '@guitar/shared';

import type { DeviceSyncTable } from '../spec';

import { attemptsSyncTable } from './attempts';
import { enrollmentsSyncTable } from './enrollments';
import { preferencesSyncTable } from './preferences';
import { progressSyncTable } from './progress';

export const DEVICE_SYNC_TABLES = {
  userPreferences: preferencesSyncTable,
  pathwayEnrollments: enrollmentsSyncTable,
  sectionProgress: progressSyncTable,
  quizAttempts: attemptsSyncTable,
} satisfies Record<SyncedTableName, unknown>;

/** The same adapters as a list, for the paths that treat every table alike. */
export const DEVICE_SYNC_TABLE_LIST = Object.values(
  DEVICE_SYNC_TABLES,
) as unknown as DeviceSyncTable[];

export { attemptsSyncTable, type LocalAttemptRow } from './attempts';
export { enrollmentsSyncTable, type LocalEnrollmentRow } from './enrollments';
export { preferencesSyncTable, type LocalPreferenceRow } from './preferences';
export { progressSyncTable, type LocalProgressRow } from './progress';
