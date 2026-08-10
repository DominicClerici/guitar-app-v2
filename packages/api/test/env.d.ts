/**
 * What `cloudflare:test`'s `env` holds beyond the Worker's own bindings: the extras
 * vitest.config.ts adds for the tests themselves.
 */
declare namespace Cloudflare {
  interface Env {
    /** Postgres for the database-backed tests. See the comment on the binding in vitest.config.ts. */
    TEST_DATABASE_URL: string;
  }
}
