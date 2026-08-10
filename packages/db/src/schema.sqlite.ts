/**
 * On-device SQLite mirror of the synced tables (BACKEND_PLAN.md §6, §8).
 *
 * Never imported by the Worker — this is consumed by the Expo app's Drizzle instance over
 * expo-sqlite, where it is the app's source of truth. Auth tables have no mirror; the device holds
 * a session cookie, not a user table.
 *
 * Table and column names must match `schema.pg.ts` exactly, which `schema.parity.test.ts` asserts.
 * Types deliberately do not: SQLite has no timestamp type, so instants are integer epoch
 * milliseconds here and `timestamptz` on the server.
 */
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * The device half of the sync columns (§7).
 *
 * `server_seq` is nullable here and not null on the server, which is the one intended difference:
 * a row created offline has no sequence value until the server assigns one on push. A null
 * `server_seq` is therefore also the "not yet pushed" marker.
 */
const syncColumns = () => ({
  serverSeq: integer('server_seq'),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
});

/** Mirror of `userPreferences` in schema.pg.ts. */
export const userPreferences = sqliteTable(
  'user_preferences',
  {
    userId: text('user_id').notNull(),
    key: text('key').notNull(),
    value: text('value').notNull(),
    clientUpdatedAt: integer('client_updated_at', { mode: 'timestamp_ms' }).notNull(),
    ...syncColumns(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.key] }),
    index('user_preferences_pull_idx').on(table.userId, table.serverSeq),
  ],
);

/** Every table the sync protocol carries. The parity test compares this against Postgres's copy. */
export const syncedTables = { userPreferences };

// ---------------------------------------------------------------------------
// Device-local tables. These have no server counterpart by design and are excluded from
// `syncedTables`, so the parity test does not look at them.
// ---------------------------------------------------------------------------

/**
 * The pull cursor (§7), as a single row pinned to `id = 1`.
 *
 * `cursor` is the highest `server_seq` this device has successfully pulled. The server also
 * publishes a `min_valid_cursor`; if this one falls below it — because tombstones it never saw
 * have since been purged — the device must discard its data and resync from zero.
 *
 * `user_id` is who that cursor belongs to. A sequence value means nothing across accounts, so the
 * device compares this against the signed-in user on every launch: when it changes the cursor
 * restarts at zero.
 *
 * `user_is_anonymous` is what tells the two reasons for that change apart. A guest claiming their
 * account (§5) should take the rows they wrote as a guest with them; someone signing in as a
 * different person should not inherit the previous account's. Both look identical from the new
 * session alone — the difference is what the *previous* owner was, which is why it is stored.
 */
export const syncState = sqliteTable('sync_state', {
  id: integer('id').primaryKey(),
  userId: text('user_id'),
  userIsAnonymous: integer('user_is_anonymous', { mode: 'boolean' }).notNull().default(false),
  cursor: integer('cursor').notNull().default(0),
  lastPulledAt: integer('last_pulled_at', { mode: 'timestamp_ms' }),
});
