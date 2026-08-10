import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema.pg';

/**
 * The `neon-http` driver issues one HTTP request per statement, so it cannot open interactive
 * transactions (`db.transaction(async (tx) => ...)`). Writes must be expressible as independent
 * statements or as Neon's array-form transaction — see BACKEND_PLAN.md §3.
 */
export function createDb(databaseUrl: string) {
  return drizzle(neon(databaseUrl), { schema, casing: 'snake_case' });
}

export type Db = ReturnType<typeof createDb>;
