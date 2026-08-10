import 'dotenv/config';

import { migrate } from 'drizzle-orm/neon-http/migrator';

import { createDb } from '../src/client';

// Migrations never run from the Worker (BACKEND_PLAN.md §2) — only from Node, locally or in CI.
// Going through `createDb` rather than building a client here means a local DATABASE_URL is routed
// through the HTTP proxy exactly as the Worker's own client would be.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set. Add it to packages/db/.env or export it.');
  process.exit(1);
}

await migrate(createDb(databaseUrl), { migrationsFolder: './drizzle' });

console.log('Migrations applied.');
