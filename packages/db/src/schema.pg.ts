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
  integer,
  jsonb,
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
  phoneNumber: text('phone_number').unique(),
  phoneNumberVerified: boolean('phone_number_verified').notNull().default(false),
  /**
   * What Apple or Google said about this person, kept apart from the columns the app owns.
   *
   * `name` is deliberately not filled from a provider (see `mapProfileToUser` in
   * `packages/api/src/auth.ts`): onboarding asks for a display name whichever way someone signs
   * in, and a provider's version is a suggestion to prefill that field with, not an answer. Its
   * own column so the two can never be confused, and JSON so a second hint costs no migration.
   */
  oauthProfile: jsonb('oauth_profile').$type<{ name?: string; image?: string }>(),

  /**
   * What onboarding asked for after the name (`@guitar/shared`'s `onboarding.ts`).
   *
   * All four are here rather than in `user_preferences` because the flow decides what it still owes
   * by reading the session's account, and the session carries these the moment a sign-in returns.
   * A preference row arrives by sync instead, so a returning user on a new device would be asked
   * the whole flow again while the first pull was still in the air.
   *
   * Null means the question has not been put yet, and it is the only thing that does. Both optional
   * questions can be declined without leaving a gap: `skill_level` takes `no_answer` and `goals`
   * takes an empty array, so skipping a step is recorded as having skipped it.
   */
  skillLevel: text('skill_level'),
  goals: jsonb('goals').$type<string[]>(),
  /**
   * When the terms were accepted, as the device reported it. Client-sent, so it is the user's own
   * claim of when rather than a server attestation — enough to gate the flow, and the thing to
   * revisit if it ever has to hold up as a record.
   */
  termsAcceptedAt: timestamp('terms_accepted_at', { withTimezone: true, mode: 'date' }),
  /** Opt-in, so it defaults off and stays off for every account that never reaches the step. */
  marketingEmails: boolean('marketing_emails').notNull().default(false),

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

/**
 * Which pathways a user is working through (the learning system, §7).
 *
 * Enrollment is a mutable state — started, worked on, dropped — so it merges last-write-wins on
 * `client_updated_at`, and dropping a pathway is a tombstone like any other delete.
 *
 * The product rule of at most three active pathways is **not** enforced here, and cannot be. Rows
 * merge independently and commutatively, so two devices each starting a fourth pathway offline both
 * succeed and converge on five. The client reconciles by keeping the three most recently active and
 * tombstoning the rest; a server-side constraint would instead reject one device's push forever.
 *
 * Dropping a pathway deliberately leaves `section_progress` alone, so starting it again resumes
 * rather than restarts. That is also what lets progress be monotonic — nothing ever needs to un-do
 * a completion.
 */
export const pathwayEnrollments = pgTable(
  'pathway_enrollments',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    pathwayId: text('pathway_id').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).notNull(),
    /** Drives both the "continue" ordering and which three enrollments survive the cap. */
    lastActiveAt: timestamp('last_active_at', { withTimezone: true, mode: 'date' }).notNull(),
    clientUpdatedAt: timestamp('client_updated_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    ...syncColumns(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.pathwayId] }),
    index('pathway_enrollments_pull_idx').on(table.userId, table.serverSeq),
  ],
);

/**
 * How far a user has got in each section (§7).
 *
 * The one **monotonic** table: `completed_at` only ever moves earlier and `best_score_pct` only
 * ever moves higher, so the merge needs no client timestamp and no ordering. Two devices that each
 * finished a different section offline converge whichever arrives first, and replaying a push
 * changes nothing — which is the property that makes progress safe to sync without a clock.
 *
 * The consequence is that progress cannot be un-done, and nothing in the app offers to. A reset
 * would have to be a tombstone, and a tombstone racing a monotonic upsert resurrects the row.
 *
 * `best_score_pct` is null for a section that is not a quiz, and is deliberately denormalised from
 * `quiz_attempts` so a chapter's view is one query rather than a join and an aggregate. Counts —
 * how many attempts, when each was — are derived from the attempts themselves (§7), never stored
 * here as something that would have to be summed.
 */
export const sectionProgress = pgTable(
  'section_progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    /** Stable across a section being retitled, reordered, or moved between chapters. */
    sectionId: text('section_id').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    bestScorePct: integer('best_score_pct'),
    ...syncColumns(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.sectionId] }),
    index('section_progress_pull_idx').on(table.userId, table.serverSeq),
  ],
);

/**
 * One row per quiz or checkpoint attempt (§7), append-only.
 *
 * Immutable once written, so the row already on the server always wins and a replayed push is a
 * no-op. The id is client-generated UUIDv7 because an attempt is an event with nothing else to name
 * it — unlike a preference, whose `(user_id, key)` already identifies the row.
 *
 * This is the audit trail behind `section_progress.best_score_pct`: how many attempts a checkpoint
 * took and what each scored are read from here rather than kept as counters, so every merge in the
 * system stays commutative.
 */
export const quizAttempts = pgTable(
  'quiz_attempts',
  {
    attemptId: text('attempt_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    sectionId: text('section_id').notNull(),
    scorePct: integer('score_pct').notNull(),
    passed: boolean('passed').notNull(),
    answeredAt: timestamp('answered_at', { withTimezone: true, mode: 'date' }).notNull(),
    ...syncColumns(),
  },
  (table) => [
    // Keyed by (user, attempt) even though a UUIDv7 is unique on its own, because every synced
    // table has to be copyable from one account to another (§5). With `attempt_id` alone the
    // guest-to-real-account copy collides with the guest's own row and `ON CONFLICT DO NOTHING`
    // silently drops it — and a client pushing an id another account already holds would be
    // dropped the same way, then re-push it forever because the read-back finds nothing.
    primaryKey({ columns: [table.userId, table.attemptId] }),
    index('quiz_attempts_pull_idx').on(table.userId, table.serverSeq),
    index('quiz_attempts_section_idx').on(table.userId, table.sectionId),
  ],
);

/** Every table the sync protocol carries. The parity test compares this against SQLite's copy. */
export const syncedTables = {
  userPreferences,
  pathwayEnrollments,
  sectionProgress,
  quizAttempts,
};

// ---------------------------------------------------------------------------
// Published content. Server-only by design: these tables belong to nobody, carry no `user_id` and
// no `server_seq`, and are deliberately absent from `syncedTables` — content is *published*, not
// synced. The device keeps its own cache of whatever it has fetched (§6), which is a different
// thing with a different lifetime, and the parity test correctly ignores both.
// ---------------------------------------------------------------------------

/**
 * One article or quiz, exactly as the publish script validated it.
 *
 * `body` is `jsonb` rather than a set of columns because the document schema is the app's, not the
 * database's: the shape is versioned by `schemaVersion` inside the document and evolves under the
 * forward-compatibility rules in `mobile/docs/articles.md`. Modelling blocks as rows would turn
 * every new block type into a migration and still not let Postgres validate one.
 *
 * `version` is the content hash the device compares against to decide whether its cached copy is
 * stale — see `contentHash` in `@guitar/shared`.
 */
export const contentDocuments = pgTable('content_documents', {
  slug: text('slug').primaryKey(),
  /** `article` or `quiz`. Not an enum: adding a third kind should not be a migration. */
  kind: text('kind').notNull(),
  version: text('version').notNull(),
  body: jsonb('body').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
});

/**
 * One pathway's full chapter and section tree.
 *
 * The curriculum *index* is not stored. It is derived from these rows on request, so it cannot
 * claim to be current after a pathway underneath it has been republished — a stored index would
 * need a second write that could be forgotten or fail on its own.
 */
export const curriculumPathways = pgTable('curriculum_pathways', {
  slug: text('slug').primaryKey(),
  version: text('version').notNull(),
  body: jsonb('body').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
});
