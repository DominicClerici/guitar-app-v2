import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema.pg';

/** Where docker-compose.yml publishes the local Neon HTTP proxy. */
const LOCAL_PROXY_PORT = 4444;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', 'host.docker.internal']);

/**
 * Routes a local `DATABASE_URL` through the HTTP proxy from docker-compose.yml, so development runs
 * the same driver as production against a plain local Postgres. Anything else is left alone and
 * goes straight to Neon over HTTPS.
 *
 * `fetchEndpoint` is global to the driver rather than per-client, which is fine here: a process is
 * either local or deployed, never both.
 */
function configureFetchEndpoint(host: string): void {
  if (!LOCAL_HOSTS.has(host)) return;

  neonConfig.fetchEndpoint = (endpointHost, port) =>
    LOCAL_HOSTS.has(endpointHost)
      ? `http://${endpointHost}:${LOCAL_PROXY_PORT}/sql`
      : `https://${endpointHost}:${port}/sql`;
}

/**
 * The `neon-http` driver issues one HTTP request per statement, so it cannot open interactive
 * transactions (`db.transaction(async (tx) => ...)`). Writes must be expressible as independent
 * statements or as Neon's array-form transaction — see BACKEND_PLAN.md §3.
 */
export function createDb(databaseUrl: string) {
  // Every auth route builds a client, so an unset URL surfaces as a 500 on sign-in long before any
  // query runs. Neon's own message for this doesn't say which variable or where it belongs.
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Locally: run `pnpm db db:up` and copy the connection string from ' +
        'packages/db/.env.example. Deployed: wrangler secret put DATABASE_URL.',
    );
  }

  configureFetchEndpoint(new URL(databaseUrl).hostname);

  return drizzle(neon(databaseUrl), { schema, casing: 'snake_case' });
}

export type Db = ReturnType<typeof createDb>;
