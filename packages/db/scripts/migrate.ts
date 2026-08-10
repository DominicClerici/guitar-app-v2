import 'dotenv/config';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

// Migrations never run from the Worker (BACKEND_PLAN.md §2) — only from Node, locally or in CI.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set. Add it to packages/db/.env or export it.');
  process.exit(1);
}

const db = drizzle(neon(databaseUrl));

await migrate(db, { migrationsFolder: './drizzle' });

console.log('Migrations applied.');
