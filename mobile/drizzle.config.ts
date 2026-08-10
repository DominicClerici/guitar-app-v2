import { defineConfig } from 'drizzle-kit';

/**
 * Migrations for the device's SQLite (BACKEND_PLAN.md §6, §8).
 *
 * The schema lives in `@guitar/db` beside its Postgres counterpart, because the parity test that
 * keeps the two from drifting has to see both. The generated migrations live here, in the app that
 * applies them: `driver: 'expo'` writes a `drizzle/migrations.js` that Metro bundles into the
 * binary, and there is no other consumer of it.
 *
 *   pnpm db:generate    # after changing packages/db/src/schema.sqlite.ts
 *
 * The server's migrations are generated separately, by `pnpm db db:generate`. They share a schema
 * source only in the sense that both dialects declare the same tables; neither output is derived
 * from the other.
 */
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: '../packages/db/src/schema.sqlite.ts',
  out: './drizzle',
});
