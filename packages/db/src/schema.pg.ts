/**
 * Server-side Postgres tables (BACKEND_PLAN.md §8).
 *
 * Two groups live here: Better Auth's own tables, whose shape is dictated by the library, and the
 * synced tables, which mirror `schema.sqlite.ts` and are guarded against drift by
 * `schema.parity.test.ts`.
 *
 * Column names are written out explicitly rather than left to the `casing: 'snake_case'` setting on
 * the Drizzle instance. The device schema is consumed by a separate Drizzle instance in the Expo
 * app, and parity between the two must not depend on both being configured the same way.
 */
import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  pgSequence,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * The single global sequence behind every sync cursor (§7). One sequence shared by all synced
 * tables, so `server_seq` is totally ordered across the whole database and `pull(cursor)` is one
 * `server_seq > cursor` scan per table. A sequence rather than `updated_at` removes clock skew
 * from the protocol entirely.
 */
export const serverSeqSequence = pgSequence('server_seq');

/**
 * The columns every synced table carries (§7).
 *
 * `server_seq` has a `nextval` default so plain inserts work, but the authority is the
 * `set_server_seq()` trigger installed by the custom migration, which reassigns it on UPDATE too.
 * Without that, an update — including the guest-to-real-account row reassignment in §5 — would
 * keep its old sequence value and stay invisible to every other device's pull. The trigger fires
 * on insert as well, so an insert burns two sequence values; gaps are harmless, since the cursor
 * only ever asks for "greater than".
 *
 * `deleted_at` is the tombstone (§7). Rows are never hard-deleted by the sync path; `pull` returns
 * tombstones so clients can drop the row locally, and they are purged after 90 days.
 */
const syncColumns = () => ({
  serverSeq: bigint('server_seq', { mode: 'number' })
    .notNull()
    .default(sql`nextval('server_seq')`),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
});

const timestamps = () => ({
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Better Auth (§5). Field names are the ones Better Auth resolves internally, so these keys are
// not free to rename — the Drizzle adapter looks each table up by model name and each column by
// field name. `is_anonymous` comes from the anonymous plugin and is kept in the table whether or
// not the plugin is currently enabled, so toggling the env flag is never a migration.
// ---------------------------------------------------------------------------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  ...timestamps(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps(),
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      withTimezone: true,
      mode: 'date',
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      withTimezone: true,
      mode: 'date',
    }),
    scope: text('scope'),
    /** Hashed by Better Auth; only ever set for the credential provider. */
    password: text('password'),
    ...timestamps(),
  },
  (table) => [index('account_user_id_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
    ...timestamps(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

/** Handed to `drizzleAdapter` as its `schema`. Keys must match Better Auth's model names. */
export const authSchema = { user, session, account, verification };

// ---------------------------------------------------------------------------
// Synced tables (§7). Anything added here needs the matching table in schema.sqlite.ts and a
// trigger in the server_seq migration — the parity test enforces both.
// ---------------------------------------------------------------------------

/**
 * One row per preference per user, so preferences merge independently under the last-write-wins
 * rule (§7): the row with the later `client_updated_at` wins its key, and a device that only
 * touched the theme cannot roll back another device's accidental spelling.
 *
 * `value` is opaque text. What may legally live in it is defined once, in `@guitar/shared`'s
 * `preferenceEntry`, and no constraint here duplicates it — a `CHECK` on `key` would turn every
 * new preference into a migration while still being unable to validate the value it pairs with.
 */
export const userPreferences = pgTable(
  'user_preferences',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    value: text('value').notNull(),
    /** Set by the writing device, and the sole input to the merge. Never trusted for ordering. */
    clientUpdatedAt: timestamp('client_updated_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    ...syncColumns(),
  },
  (table) => [
    // The identity a client pushes under is (user, key) rather than a UUID: the pair already
    // names the row, which makes a replayed push converge without a generated id.
    primaryKey({ columns: [table.userId, table.key] }),
    // Covers `pull`: user_id equality then server_seq range, in that order.
    index('user_preferences_pull_idx').on(table.userId, table.serverSeq),
  ],
);

/** Every table the sync protocol carries. The parity test compares this against SQLite's copy. */
export const syncedTables = { userPreferences };
