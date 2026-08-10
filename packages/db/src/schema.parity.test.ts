/**
 * The parity test from BACKEND_PLAN.md §8.
 *
 * Drizzle schemas are dialect-specific, so the server's Postgres tables and the device's SQLite
 * mirror are two separate declarations of the same thing. Nothing in the type system connects
 * them; this test is the connection. It compares names only — types are expected to differ, since
 * SQLite has neither a timestamp nor a bigint column type.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { getTableConfig as getPgTableConfig, type PgTable } from 'drizzle-orm/pg-core';
import { getTableConfig as getSqliteTableConfig, type SQLiteTable } from 'drizzle-orm/sqlite-core';
import { describe, expect, it } from 'vitest';

import { syncedTables as pgSynced, serverSeqSequence } from './schema.pg';
import { syncedTables as sqliteSynced } from './schema.sqlite';

const SYNC_COLUMNS = ['server_seq', 'deleted_at'];

const pgTables = pgSynced as Record<string, PgTable>;
const sqliteTables = sqliteSynced as Record<string, SQLiteTable>;

const syncedNames = Object.keys(pgTables).sort();

function declared<T>(tables: Record<string, T>, name: string, dialect: string): T {
  const table = tables[name];
  if (!table) throw new Error(`no ${dialect} table declared for "${name}"`);
  return table;
}

const pgConfig = (name: string) => getPgTableConfig(declared(pgTables, name, 'Postgres'));
const sqliteConfig = (name: string) => getSqliteTableConfig(declared(sqliteTables, name, 'SQLite'));

function columnNames(config: { columns: readonly { name: string }[] }): string[] {
  return config.columns.map((column) => column.name).sort();
}

describe('synced schema parity', () => {
  it('declares the same synced tables in both dialects', () => {
    expect(Object.keys(sqliteTables).sort()).toEqual(syncedNames);
  });

  it.each(syncedNames)('%s matches across dialects', (name) => {
    expect(sqliteConfig(name).name).toBe(pgConfig(name).name);
    expect(columnNames(sqliteConfig(name))).toEqual(columnNames(pgConfig(name)));
  });

  it.each(syncedNames)('%s carries the sync columns in both dialects', (name) => {
    for (const column of SYNC_COLUMNS) {
      expect(columnNames(pgConfig(name))).toContain(column);
      expect(columnNames(sqliteConfig(name))).toContain(column);
    }
  });
});

describe('server_seq assignment', () => {
  const migrations = readdirSync(fileURLToPath(new URL('../drizzle', import.meta.url)))
    .filter((file) => file.endsWith('.sql'))
    .map((file) =>
      readFileSync(fileURLToPath(new URL(`../drizzle/${file}`, import.meta.url)), 'utf8'),
    )
    .join('\n');

  it('creates the single global sequence', () => {
    expect(serverSeqSequence.seqName).toBe('server_seq');
    expect(migrations).toMatch(/CREATE SEQUENCE\s+(IF NOT EXISTS\s+)?("[^"]+"\.)?"?server_seq"?/i);
  });

  /**
   * The reason `server_seq` is a trigger rather than a column default: a default only fires on
   * insert, so an updated row would keep its old sequence value and never appear in another
   * device's pull again. A synced table without a trigger is silently half-synced, so adding one
   * to the schema without adding its trigger has to fail here.
   */
  it.each(syncedNames)('%s has a trigger that reassigns server_seq on update', (name) => {
    const table = pgConfig(name).name;
    const trigger = new RegExp(
      `CREATE (OR REPLACE )?TRIGGER\\s+\\S+\\s+BEFORE INSERT OR UPDATE ON\\s+"?${table}"?`,
      'i',
    );

    expect(migrations).toMatch(trigger);
  });
});
