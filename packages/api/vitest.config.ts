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
        },
      },
    }),
  ],
  test: {
    include: ['test/**/*.test.ts'],
  },
});
