import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

// Tests execute inside the real workerd runtime, not a Node shim, so the same runtime constraints
// that apply in production apply here.
export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: {
        bindings: {
          DATABASE_URL: 'postgresql://test:test@localhost/test',
          BETTER_AUTH_SECRET: 'test-secret',
          BETTER_AUTH_URL: 'http://localhost:8788',
          // Not a Worker binding: the one place the database-backed tests look for a server
          // (BACKEND_PLAN.md §11). Locally that is docker-compose.yml in packages/db, reached
          // through the same Neon HTTP proxy the Worker uses; CI points it at a Neon branch.
          // Tests that need it skip themselves when nothing answers, so a checkout without
          // Docker still runs green.
          TEST_DATABASE_URL: 'postgres://guitar:guitar@localhost:5434/guitar',
        },
      },
    }),
  ],
  test: {
    include: ['test/**/*.test.ts'],
  },
});
