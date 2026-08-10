/**
 * Reading and writing the device's synced rows (BACKEND_PLAN.md §6).
 *
 * Everything here is synchronous: `expo-sqlite` runs on the JS thread against a local file, so
 * there is nothing to await and no loading state for a screen to render. That is the whole point of
 * the local database being the source of truth.
 *
 * Instants are `Date` in the schema and epoch milliseconds everywhere above it, because that is
 * what the wire contracts and the merge comparisons use. This module is where the two meet.
 */
import { syncState, userPreferences } from '@guitar/db/schema.sqlite';
import { and, eq, isNull, ne } from 'drizzle-orm';

import type { LocalPreferenceRow } from '@/lib/sync/reconcile';

import { db, type Database } from './client';

/** A transaction, or the database itself when a caller does not need one. */
export type Writer = Database | Parameters<Parameters<Database['transaction']>[0]>[0];

/** The cursor row is pinned to a single id — there is one device and one server (§7). */
const SYNC_STATE_ID = 1;

export interface SyncState {
  /** Whose rows the local database currently holds, or null before the first sign-in. */
  userId: string | null;
  /** Whether that user is a guest, which decides what happens to their rows if the account changes. */
  userIsAnonymous: boolean;
  cursor: number;
  lastPulledAt: Date | null;
}

const DEFAULT_SYNC_STATE: SyncState = {
  userId: null,
  userIsAnonymous: false,
  cursor: 0,
  lastPulledAt: null,
};

function toLocalRow(row: {
  key: string;
  value: string;
  clientUpdatedAt: Date;
  deletedAt: Date | null;
  serverSeq: number | null;
}): LocalPreferenceRow {
  return {
    key: row.key,
    value: row.value,
    clientUpdatedAt: row.clientUpdatedAt.getTime(),
    deletedAt: row.deletedAt?.getTime() ?? null,
    serverSeq: row.serverSeq,
  };
}

export function readPreferenceRows(userId: string, writer: Writer = db): LocalPreferenceRow[] {
  return writer
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .all()
    .map(toLocalRow);
}

/** Rows written on this device that the server has not accepted yet. */
export function readUnpushedRows(userId: string, writer: Writer = db): LocalPreferenceRow[] {
  return writer
    .select()
    .from(userPreferences)
    .where(and(eq(userPreferences.userId, userId), isNull(userPreferences.serverSeq)))
    .all()
    .map(toLocalRow);
}

/**
 * Writes a row, whether it came from the user or from the server.
 *
 * `serverSeq` is the marker the push path reads: null for a local edit waiting to be sent, a
 * number for a row the server has confirmed. Callers pass it deliberately — there is no default,
 * because getting it wrong either loses a write or re-sends it forever.
 */
export function writePreferenceRow(
  userId: string,
  row: LocalPreferenceRow,
  writer: Writer = db,
): void {
  const values = {
    userId,
    key: row.key,
    value: row.value,
    clientUpdatedAt: new Date(row.clientUpdatedAt),
    deletedAt: row.deletedAt === null ? null : new Date(row.deletedAt),
    serverSeq: row.serverSeq,
  };

  writer
    .insert(userPreferences)
    .values(values)
    .onConflictDoUpdate({
      target: [userPreferences.userId, userPreferences.key],
      set: {
        value: values.value,
        clientUpdatedAt: values.clientUpdatedAt,
        deletedAt: values.deletedAt,
        serverSeq: values.serverSeq,
      },
    })
    .run();
}

/**
 * Removes a row outright.
 *
 * Tombstones are a server concept: they exist so other devices learn about a deletion (§7). Once
 * the server has confirmed one, this device gains nothing by keeping the row — the cursor already
 * records that it has seen it.
 */
export function deletePreferenceRow(userId: string, key: string, writer: Writer = db): void {
  writer
    .delete(userPreferences)
    .where(and(eq(userPreferences.userId, userId), eq(userPreferences.key, key)))
    .run();
}

/** Drops everything belonging to anyone else, after an account change has moved what it wanted. */
export function deleteRowsOfOtherUsers(userId: string, writer: Writer = db): void {
  writer.delete(userPreferences).where(ne(userPreferences.userId, userId)).run();
}

/** Drops this account's rows entirely, for the full resync a purged cursor forces (§7). */
export function deleteAllRows(userId: string, writer: Writer = db): void {
  writer.delete(userPreferences).where(eq(userPreferences.userId, userId)).run();
}

export function readSyncState(writer: Writer = db): SyncState {
  const row = writer.select().from(syncState).where(eq(syncState.id, SYNC_STATE_ID)).get();
  if (!row) return DEFAULT_SYNC_STATE;

  return {
    userId: row.userId,
    userIsAnonymous: row.userIsAnonymous,
    cursor: row.cursor,
    lastPulledAt: row.lastPulledAt,
  };
}

export function writeSyncState(state: SyncState, writer: Writer = db): void {
  writer
    .insert(syncState)
    .values({ id: SYNC_STATE_ID, ...state })
    .onConflictDoUpdate({ target: syncState.id, set: state })
    .run();
}
