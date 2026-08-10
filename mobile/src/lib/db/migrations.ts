/**
 * Applying the device's schema at launch (BACKEND_PLAN.md §6).
 *
 * The migrations are generated from the same `schema.sqlite.ts` the queries are typed against —
 * see `drizzle.config.ts` — and bundled into the binary by Metro, so this runs offline like
 * everything else. It is fast enough to happen during the splash screen: SQLite DDL against a
 * local file, no network.
 */
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '../../../drizzle/migrations';

import { db } from './client';

export interface MigrationState {
  /** Whether the local tables are ready to be read or written. */
  ready: boolean;
  error?: Error;
}

/**
 * Nothing waits on this and nothing is rendered for it. A failure leaves the app running against
 * an empty database — every screen still works, preferences fall back to their defaults, and sync
 * stays parked until the next launch rather than writing into tables that may not exist.
 */
export function useDatabaseMigrations(): MigrationState {
  const { success, error } = useMigrations(db, migrations);

  return { ready: success, error };
}
