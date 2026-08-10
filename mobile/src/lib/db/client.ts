/**
 * The device database (BACKEND_PLAN.md §6).
 *
 * On-device SQLite is the source of truth: every read and write in the app goes through here, and
 * the sync layer reconciles with the server behind it. That is what makes the app work offline and
 * open instantly — nothing on screen is ever waiting on a request.
 *
 * The tables come from `@guitar/db/schema.sqlite` rather than being declared here, so the parity
 * test can hold them against the server's Postgres tables. Only the SQLite half is imported; the
 * package's Neon client is a separate entrypoint and never reaches this bundle.
 */
import { syncState, userPreferences } from '@guitar/db/schema.sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

export const schema = { userPreferences, syncState };

/**
 * `enableChangeListener` is what `useLiveQuery` subscribes to — without it a screen showing a
 * preference would not notice the sync layer pulling a new value for it.
 */
const sqlite = openDatabaseSync('guitar.db', { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });

export type Database = typeof db;
