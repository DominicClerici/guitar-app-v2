/**
 * The one statement that merges rows of a synced table into another user's rows, built from that
 * table's declared merge rule (BACKEND_PLAN.md §7).
 *
 * Generic over the table rather than written per table: §6 promises that adding a synced table is
 * configuration rather than new sync code, and there are already two callers that must agree on
 * what a merge rule means — the guest-to-real-account reassignment in §5 and, later, `sync.push`.
 *
 * `server_seq` is deliberately never written here. The `set_server_seq()` trigger assigns it on
 * both insert and update, so every row this statement touches surfaces above every other device's
 * cursor on its next pull. Naming it in the column list would only give the trigger something to
 * overwrite.
 */
import type { MergeRule } from '@guitar/db';
import { sql, type SQL } from 'drizzle-orm';
import { getTableConfig, type AnyPgColumn, type PgTable } from 'drizzle-orm/pg-core';

/** Assigned by the database, never copied. */
const SERVER_ASSIGNED = new Set(['server_seq']);

/** The owner column every synced table carries, asserted by the parity test in `@guitar/db`. */
const OWNER_COLUMN = 'user_id';

/** The source table needs a name of its own, or `ON CONFLICT`'s target would be ambiguous. */
const SOURCE = 'source';

function columnList(columns: readonly AnyPgColumn[]): SQL {
  return sql.join(
    columns.map((column) => sql.identifier(column.name)),
    sql`, `,
  );
}

/** The columns `ON CONFLICT` infers its unique index from — the table's primary key. */
function conflictTarget(table: PgTable): AnyPgColumn[] {
  const { name, columns, primaryKeys } = getTableConfig(table);
  const key = primaryKeys[0]?.columns ?? columns.filter((column) => column.primary);

  if (!key.length) throw new Error(`synced table "${name}" has no primary key to merge on`);

  return key;
}

/**
 * Copies every row of `table` belonging to `fromUserId` onto `toUserId`, merging with whatever
 * `toUserId` already has under the table's own rule. The source rows are left alone: the caller
 * decides what happens to them, which for §5 is the cascade from deleting the guest user.
 *
 * Replaying this is safe. Both rules are idempotent — append-only ignores a row it already has,
 * and last-write-wins re-applies a timestamp that is no longer greater than its own — so a
 * reassignment interrupted halfway converges when it is retried.
 */
export function mergeRowsIntoUserSql(
  table: PgTable,
  rule: MergeRule,
  { fromUserId, toUserId }: { fromUserId: string; toUserId: string },
): SQL {
  const { name, columns } = getTableConfig(table);

  const owner = columns.find((column) => column.name === OWNER_COLUMN);
  if (!owner) throw new Error(`synced table "${name}" has no ${OWNER_COLUMN} column`);

  const copied = columns.filter((column) => !SERVER_ASSIGNED.has(column.name));

  // The one column that does not come from the source row: it is what the copy is for.
  const selected = copied.map((column) =>
    column.name === OWNER_COLUMN
      ? sql`cast(${toUserId} as ${sql.raw(owner.getSQLType())})`
      : sql`${sql.identifier(SOURCE)}.${sql.identifier(column.name)}`,
  );

  const copy = sql`
    insert into ${sql.identifier(name)} (${columnList(copied)})
    select ${sql.join(selected, sql`, `)}
    from ${sql.identifier(name)} as ${sql.identifier(SOURCE)}
    where ${sql.identifier(SOURCE)}.${sql.identifier(OWNER_COLUMN)} = ${fromUserId}
  `;

  return sql`${copy} ${onConflict(table, rule)}`;
}

/**
 * Merges rows a device pushed into that device's own account, under the table's rule — the write
 * half of §7's push, and the other caller `onConflict` exists to serve.
 *
 * Rows are plain records keyed by **database column name**, and every column the table has except
 * the server-assigned ones must be present: a partial row would be an insert with a hole in it,
 * and under last-write-wins the whole row moves or none of it does.
 *
 * Two rows with the same primary key in one statement is a Postgres error, not a merge — the
 * caller reduces a batch to one row per key before calling this.
 */
export function mergeValuesSql(
  table: PgTable,
  rule: MergeRule,
  rows: readonly Record<string, unknown>[],
): SQL {
  const { name, columns } = getTableConfig(table);

  if (!rows.length) throw new Error(`nothing to merge into "${name}"`);

  const copied = columns.filter((column) => !SERVER_ASSIGNED.has(column.name));

  const tuples = rows.map((row) => {
    const values = copied.map((column) => {
      if (!(column.name in row)) {
        throw new Error(`row for "${name}" is missing a value for ${column.name}`);
      }

      // Bound as a parameter, so Postgres infers its type from the column it is being inserted
      // into — which is what lets an ISO string land in a `timestamptz` without a cast here.
      return sql`${row[column.name]}`;
    });

    return sql`(${sql.join(values, sql`, `)})`;
  });

  return sql`
    insert into ${sql.identifier(name)} (${columnList(copied)})
    values ${sql.join(tuples, sql`, `)}
    ${onConflict(table, rule)}
  `;
}

function onConflict(table: PgTable, rule: MergeRule): SQL {
  if (rule.kind === 'append-only') return sql`on conflict do nothing`;

  const { name, columns } = getTableConfig(table);
  const key = new Set(conflictTarget(table).map((column) => column.name));

  const stamp = rule.clientTimestamp.name;
  if (!columns.some((column) => column.name === stamp)) {
    throw new Error(`merge rule for "${name}" names a timestamp column it does not have: ${stamp}`);
  }

  const overwritten = columns.filter(
    (column) => !key.has(column.name) && !SERVER_ASSIGNED.has(column.name),
  );
  if (!overwritten.length) {
    throw new Error(`synced table "${name}" is entirely primary key — declare it append-only`);
  }

  const assignments = sql.join(
    overwritten.map(
      (column) => sql`${sql.identifier(column.name)} = excluded.${sql.identifier(column.name)}`,
    ),
    sql`, `,
  );

  // The whole row moves or none of it does. A per-column merge would let a preference's value
  // come from one device and its timestamp from another, which converges to a row neither device
  // ever held.
  return sql`
    on conflict (${columnList(conflictTarget(table))}) do update set ${assignments}
    where excluded.${sql.identifier(stamp)} > ${sql.identifier(name)}.${sql.identifier(stamp)}
  `;
}
