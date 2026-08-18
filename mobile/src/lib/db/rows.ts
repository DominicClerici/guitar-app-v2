/**
 * Reading and writing the device's synced rows (BACKEND_PLAN.md §6).
 *
 * Everything here is synchronous: `expo-sqlite` runs on the JS thread against a local file, so
 * there is nothing to await and no loading state for a screen to render. That is the whole point of
 * the local database being the source of truth.
 *
 * Every operation is generic over a `DeviceSyncTable` rather than written per table. The two that
 * sweep — `deleteRowsOfOtherUsers` and `deletePushedRows` — are why: both must cover every synced
 * table, and a table missing from either leaves rows from another account on the device, or
 * survives a full resync as stale data the cursor now claims to have seen. Neither failure raises
 * anything.
 *
 * Instants are `Date` in the schema and epoch milliseconds everywhere above it, because that is
 * what the wire contracts and the merge comparisons use. Each table's adapter is where the two meet.
 */
import { syncState } from '@guitar/db/schema.sqlite';
import type { SyncedTableName } from '@guitar/shared';
import {
  and,
  eq,
  getTableColumns,
  gt,
  inArray,
  isNotNull,
  isNull,
  ne,
  sql,
  type SQL,
} from 'drizzle-orm';
import type { SQLiteColumn } from 'drizzle-orm/sqlite-core';

import type { DeviceSyncTable, LocalSyncRow } from '@/lib/sync/spec';
import { DEVICE_SYNC_TABLE_LIST } from '@/lib/sync/tables';

import { db, type Database } from './client';

/** A transaction, or the database itself when a caller does not need one. */
export type Writer = Database | Parameters<Parameters<Database['transaction']>[0]>[0];

/** The cursor row is pinned to a single id — there is one device and one server (§7). */
const SYNC_STATE_ID = 1;

/**
 * Drizzle's query builders are typed against a concrete table, and these helpers are deliberately
 * not. The casts are confined to this module and each one is checked at runtime by `column()`,
 * which fails loudly on a property the table does not have rather than building silent SQL.
 */
type AnySyncTable = DeviceSyncTable<SyncedTableName, LocalSyncRow>;

function column(spec: AnySyncTable, field: string): SQLiteColumn {
  const columns = spec.table as unknown as Record<string, SQLiteColumn | undefined>;
  const found = columns[field];

  if (!found) throw new Error(`synced table "${spec.name}" has no column for "${field}"`);

  return found;
}

function whereOwner(spec: AnySyncTable, userId: string): SQL {
  return eq(column(spec, spec.userField), userId);
}

/**
 * The one column `identity` reads: the table's primary key, minus the owner.
 *
 * Derived rather than declared so it cannot drift from `conflictFields`, and checked here because
 * a table identified by two columns would otherwise be matched by one of them — every row of a
 * pathway would answer to the same identity, and a page would be merged against the wrong local
 * row. A table like that needs a widening here, not a silent narrowing.
 */
function identityColumn(spec: AnySyncTable): SQLiteColumn {
  const fields = spec.conflictFields.filter((field) => field !== spec.userField);

  if (fields.length !== 1) {
    throw new Error(`synced table "${spec.name}" is not identified by a single column`);
  }

  return column(spec, fields[0]);
}

/**
 * SQLite's implicit row id, which every synced table has — none is declared `WITHOUT ROWID`.
 *
 * It is what a backlog can be drained in order by. It is assigned once, on insert, and an upsert
 * leaves it alone, so it is the device's own arrival order and nothing an edit can move. The
 * alternative is no order at all: the rows a `LIMIT` happens to return are then whatever the
 * planner produced, and a row that keeps losing the draw is never sent.
 */
const ROWID = sql<number>`rowid`;

/** The key `ROWID` is selected under. Not a column, so every adapter's `toLocal` ignores it. */
const ROWID_FIELD = '$rowid';

/** Matches exactly one row: the owner, plus whatever else the table's primary key names. */
function whereRow(spec: AnySyncTable, userId: string, row: LocalSyncRow): SQL {
  const fields = spec.conflictFields.filter((field) => field !== spec.userField);
  const values = row as unknown as Record<string, unknown>;

  return and(
    whereOwner(spec, userId),
    ...fields.map((field) => eq(column(spec, field), values[field])),
  ) as SQL;
}

function select(spec: AnySyncTable, writer: Writer, where: SQL): LocalSyncRow[] {
  return (writer.select().from(spec.table).where(where).all() as Record<string, unknown>[]).map(
    (row) => spec.toLocal(row),
  );
}

export function readRows<TSpec extends AnySyncTable>(
  spec: TSpec,
  userId: string,
  writer: Writer = db,
): ReturnType<TSpec['toLocal']>[] {
  return select(spec, writer, whereOwner(spec, userId)) as ReturnType<TSpec['toLocal']>[];
}

/**
 * Rows written on this device that the server has not accepted yet, oldest first, read `pageSize`
 * at a time.
 *
 * A generator rather than an array because the caller stops early — it sends one batch — and the
 * backlog behind that batch is not bounded by anything. A device that has been offline for a week
 * holds thousands of rows, and selecting all of them to send five hundred is work repeated on
 * every run of the drain: the same read, one batch shorter each time.
 *
 * Paging by row id rather than by `OFFSET` because the rows are leaving the result set as they go
 * — a pushed row gains a `server_seq` and stops matching — so an offset would step over exactly
 * what it just skipped. Only the caller knows when to stop, and stopping is what keeps the second
 * page from ever being read in the ordinary case.
 */
export function* readUnpushedRows<TSpec extends AnySyncTable>(
  spec: TSpec,
  userId: string,
  pageSize: number,
  writer: Writer = db,
): Generator<ReturnType<TSpec['toLocal']>> {
  const unpushed = and(whereOwner(spec, userId), isNull(column(spec, 'serverSeq')));
  let after = 0;

  for (;;) {
    const page = writer
      .select({ ...getTableColumns(spec.table), [ROWID_FIELD]: ROWID })
      .from(spec.table)
      .where(and(unpushed, gt(ROWID, after)) as SQL)
      .orderBy(ROWID)
      .limit(pageSize)
      .all() as Record<string, unknown>[];

    for (const row of page) yield spec.toLocal(row) as ReturnType<TSpec['toLocal']>;

    if (page.length < pageSize) return;

    after = page[page.length - 1][ROWID_FIELD] as number;
  }
}

/**
 * The stored rows for a named set of identities, as `identity` reports them.
 *
 * What a page arriving from the server is judged against. Reading the whole table instead is a
 * scan of everything the account has ever recorded to look up at most a page's worth of rows —
 * `quiz_attempts` never stops growing, and every attempt this device records reads all of them
 * twice, once for the push read-back and once for the pull that follows it.
 */
export function readRowsByIdentity<TSpec extends AnySyncTable>(
  spec: TSpec,
  userId: string,
  identities: string[],
  writer: Writer = db,
): ReturnType<TSpec['toLocal']>[] {
  if (!identities.length) return [];

  const where = and(whereOwner(spec, userId), inArray(identityColumn(spec), identities)) as SQL;

  return select(spec, writer, where) as ReturnType<TSpec['toLocal']>[];
}

/**
 * Writes a row, whether it came from the user or from the server.
 *
 * `serverSeq` is the marker the push path reads: null for a local edit waiting to be sent, a
 * number for a row the server has confirmed. Callers pass it deliberately — there is no default,
 * because getting it wrong either loses a write or re-sends it forever.
 *
 * The conflict update covers every column except the primary key, so a row arriving from the
 * server replaces the local copy wholesale rather than leaving a field behind from an older write.
 */
export function writeRow<TSpec extends AnySyncTable>(
  spec: TSpec,
  userId: string,
  row: Parameters<TSpec['toValues']>[1],
  writer: Writer = db,
): void {
  const values = spec.toValues(userId, row);
  const target = spec.conflictFields.map((field) => column(spec, field));
  const set = Object.fromEntries(
    Object.entries(values).filter(([field]) => !spec.conflictFields.includes(field)),
  );

  writer
    .insert(spec.table)
    .values(values as never)
    .onConflictDoUpdate({ target, set })
    .run();
}

/** The row already stored under the same identity, if there is one. */
function readRow(
  spec: AnySyncTable,
  userId: string,
  row: LocalSyncRow,
  writer: Writer,
): LocalSyncRow | undefined {
  return select(spec, writer, whereRow(spec, userId, row))[0];
}

/**
 * Writes a row **the app itself produced**, folded with whatever is already stored.
 *
 * This is the write every feature should use; `writeRow` is the raw one, for the sync engine, which
 * has already decided what the row should be. The difference matters on a monotonic table: a retake
 * scoring worse than a previous attempt must not lower the best score, and a blind overwrite would
 * un-pass a checkpoint on this device until a pull happened to restore it — the device
 * contradicting the server about data it just wrote itself. Each table's `mergeLocal` is where that
 * rule lives, so the same fold governs two writes on one device as governs two devices.
 */
export function writeLocalRow<TSpec extends AnySyncTable>(
  spec: TSpec,
  userId: string,
  row: Parameters<TSpec['toValues']>[1],
  writer: Writer = db,
): void {
  const existing = readRow(spec, userId, row, writer);

  writeRow(spec, userId, spec.mergeLocal(existing, row), writer);
}

/**
 * Removes a row outright.
 *
 * Tombstones are a server concept: they exist so other devices learn about a deletion (§7). Once
 * the server has confirmed one, this device gains nothing by keeping the row — the cursor already
 * records that it has seen it.
 */
export function deleteRow(
  spec: AnySyncTable,
  userId: string,
  row: LocalSyncRow,
  writer: Writer = db,
): void {
  writer
    .delete(spec.table)
    .where(whereRow(spec, userId, row))
    .run();
}

/** Drops everything belonging to anyone else, after an account change has moved what it wanted. */
export function deleteRowsOfOtherUsers(userId: string, writer: Writer = db): void {
  for (const spec of DEVICE_SYNC_TABLE_LIST) {
    writer
      .delete(spec.table)
      .where(ne(column(spec, spec.userField), userId))
      .run();
  }
}

/**
 * Drops what this account learned from the server, for the full resync a purged cursor forces (§7).
 *
 * Rows still waiting to be pushed are kept. What a resync repairs is the device's copy of the
 * server's history — the deletions it missed while their tombstones were purged out from under it —
 * and a row the server has never seen is not part of that history. It exists nowhere else, so
 * clearing it would destroy offline work rather than repair anything. The next push sends it, and
 * every merge rule already judges an unpushed local row against whatever the resync pulls back.
 */
export function deletePushedRows(userId: string, writer: Writer = db): void {
  for (const spec of DEVICE_SYNC_TABLE_LIST) {
    writer
      .delete(spec.table)
      .where(and(whereOwner(spec, userId), isNotNull(column(spec, 'serverSeq'))))
      .run();
  }
}

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

/**
 * Moves the cursor without disturbing who owns the local database.
 *
 * The two halves of `sync_state` are decided by different things at different times: `adoptUser`
 * says whose rows these are, and the pull loop says how far through that account's history the
 * device has read. A pull holds its own copy of the state across a network round trip, and an
 * account change lands in the middle of one often enough to matter — signing in is precisely when a
 * pull is already in flight. Writing the struct back whole would carry the previous owner's id over
 * the new one, and hand the new account a cursor measured against the old account's position in the
 * shared sequence, so every row below it looks already seen. Reading fresh here, under the caller's
 * transaction, is what keeps the two halves independent.
 */
export function writeSyncCursor(
  next: { cursor: number; lastPulledAt?: Date },
  writer: Writer = db,
): void {
  writeSyncState({ ...readSyncState(writer), ...next }, writer);
}
