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

/** Mirror of `pathwayEnrollments` in schema.pg.ts. */
export const pathwayEnrollments = sqliteTable(
  'pathway_enrollments',
  {
    userId: text('user_id').notNull(),
    pathwayId: text('pathway_id').notNull(),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }).notNull(),
    lastActiveAt: integer('last_active_at', { mode: 'timestamp_ms' }).notNull(),
    clientUpdatedAt: integer('client_updated_at', { mode: 'timestamp_ms' }).notNull(),
    ...syncColumns(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.pathwayId] }),
    index('pathway_enrollments_pull_idx').on(table.userId, table.serverSeq),
  ],
);

/** Mirror of `sectionProgress` in schema.pg.ts. */
export const sectionProgress = sqliteTable(
  'section_progress',
  {
    userId: text('user_id').notNull(),
    sectionId: text('section_id').notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
    bestScorePct: integer('best_score_pct'),
    ...syncColumns(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.sectionId] }),
    index('section_progress_pull_idx').on(table.userId, table.serverSeq),
  ],
);

/** Mirror of `quizAttempts` in schema.pg.ts. */
export const quizAttempts = sqliteTable(
  'quiz_attempts',
  {
    attemptId: text('attempt_id').notNull(),
    userId: text('user_id').notNull(),
    sectionId: text('section_id').notNull(),
    scorePct: integer('score_pct').notNull(),
    passed: integer('passed', { mode: 'boolean' }).notNull(),
    answeredAt: integer('answered_at', { mode: 'timestamp_ms' }).notNull(),
    ...syncColumns(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.attemptId] }),
    index('quiz_attempts_pull_idx').on(table.userId, table.serverSeq),
    index('quiz_attempts_section_idx').on(table.userId, table.sectionId),
  ],
);

/** Every table the sync protocol carries. The parity test compares this against Postgres's copy. */
export const syncedTables = {
  userPreferences,
  pathwayEnrollments,
  sectionProgress,
  quizAttempts,
};

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
/**
 * Cached content documents — articles and quizzes the device has fetched (§6, §8).
 *
 * Device-local and not synced: content is published, not owned, so there is nothing to merge and
 * nothing to push. It lives in SQLite rather than on the filesystem for one reason — reads here are
 * synchronous, so a cached article renders on the first frame with no loading state, which is how
 * everything else in the app already behaves.
 *
 * `body` is the document's JSON as text. It is parsed and validated at the repository boundary by
 * the same parsers the server publishes through, so a row written by a newer build that this one
 * cannot understand degrades under the forward-compatibility rules rather than crashing a screen.
 *
 * `pathway_slug` and `chapter_id` are what a row is evicted by: the cache holds the current chapter
 * of each active pathway and nothing else. Both null marks a standalone article from the library,
 * which is evicted on its own terms.
 */
export const cachedDocuments = sqliteTable(
  'cached_documents',
  {
    slug: text('slug').primaryKey(),
    kind: text('kind').notNull(),
    version: text('version').notNull(),
    body: text('body').notNull(),
    pathwaySlug: text('pathway_slug'),
    chapterId: text('chapter_id'),
    fetchedAt: integer('fetched_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [index('cached_documents_chapter_idx').on(table.pathwaySlug, table.chapterId)],
);

/**
 * Which chapters are cached, and at what version.
 *
 * Separate from the documents because the version being tracked is the *chapter's* — the hash of
 * its documents' versions, which is what `content.chapter` compares against to answer `unchanged`.
 * Storing it on each document instead would mean deciding which document's row speaks for the
 * chapter, and getting a partially-fetched chapter wrong in the process.
 */
export const cachedChapters = sqliteTable(
  'cached_chapters',
  {
    pathwaySlug: text('pathway_slug').notNull(),
    chapterId: text('chapter_id').notNull(),
    version: text('version').notNull(),
    fetchedAt: integer('fetched_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.pathwaySlug, table.chapterId] })],
);

/**
 * The curriculum tree itself: the catalogue index under scope `index`, and one row per pathway
 * under its slug. Both are small and both are version-checked on every refresh.
 */
export const cachedCurriculum = sqliteTable('cached_curriculum', {
  scope: text('scope').primaryKey(),
  version: text('version').notNull(),
  body: text('body').notNull(),
  fetchedAt: integer('fetched_at', { mode: 'timestamp_ms' }).notNull(),
});

/**
 * Where a tool remembers how it was left — the rhythm trainer's note values, tempo and input mode,
 * so far (§6).
 *
 * Device-local and not synced, and that is the decision rather than an omission: these are the
 * settings of one practice session on one phone, not something an account owns, so there is nothing
 * to merge and no reason for a tempo chosen on a tablet to arrive on a phone mid-drill. A tool that
 * later wants its settings to follow the user belongs in `user_preferences` instead, with the four
 * declarations §7 asks for.
 *
 * `body` is the tool's own JSON as text, parsed and validated by that tool at its boundary. One row
 * per tool rather than one per setting: nothing here merges, so there is no reason to split a
 * tool's settings into rows that could disagree, and a body written by a newer build degrades to
 * defaults under the tool's own parser rather than breaking an older one.
 */
export const toolSettings = sqliteTable('tool_settings', {
  tool: text('tool').primaryKey(),
  body: text('body').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
});

export const syncState = sqliteTable('sync_state', {
  id: integer('id').primaryKey(),
  userId: text('user_id'),
  userIsAnonymous: integer('user_is_anonymous', { mode: 'boolean' }).notNull().default(false),
  cursor: integer('cursor').notNull().default(0),
  lastPulledAt: integer('last_pulled_at', { mode: 'timestamp_ms' }),
});
