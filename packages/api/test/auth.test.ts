import { createDb } from '@guitar/db';
import { env, SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

import { createAuth } from '../src/auth';
import type { Env } from '../src/env';

/**
 * Configuration assertions rather than sign-in flows: the auth config is what decides which
 * providers exist and whether guest accounts are reachable, and it can be checked without a
 * database. Flows that write rows belong in the integration tests against a Neon branch (§11).
 */
function authFor(overrides: Partial<Env> = {}) {
  const merged = { ...(env as unknown as Env), ...overrides };

  // No connection is opened until a statement runs, so this stays offline.
  return createAuth({ env: merged, db: createDb(merged.DATABASE_URL) });
}

describe('auth configuration', () => {
  it('enables email + password without requiring verification to sign in', () => {
    const options = authFor().options;

    expect(options.emailAndPassword?.enabled).toBe(true);
    expect(options.emailAndPassword?.requireEmailVerification).toBe(false);
    expect(options.emailVerification?.sendOnSignUp).toBe(true);
  });

  it('omits social providers whose credentials are unset', () => {
    expect(Object.keys(authFor().options.socialProviders ?? {})).toEqual([]);
  });

  it('registers google and apple once their credentials are present', () => {
    const options = authFor({
      GOOGLE_CLIENT_ID: 'google-id',
      GOOGLE_CLIENT_SECRET: 'google-secret',
      APPLE_CLIENT_ID: 'apple-service-id',
      APPLE_CLIENT_SECRET: 'apple-secret',
      APPLE_APP_BUNDLE_IDENTIFIER: 'com.example.guitar',
    }).options;

    expect(Object.keys(options.socialProviders ?? {}).sort()).toEqual(['apple', 'google']);
    // Native Sign in with Apple sends a token issued for the bundle id, not the Services id, so
    // omitting this would reject every id token coming from the Expo app.
    expect(options.socialProviders?.apple).toMatchObject({
      appBundleIdentifier: 'com.example.guitar',
    });
  });

  it('leaves the anonymous plugin off unless the flag is explicitly true', () => {
    const names = (overrides: Partial<Env>) =>
      (authFor(overrides).options.plugins ?? []).map((plugin) => plugin.id);

    expect(names({})).not.toContain('anonymous');
    expect(names({ ENABLE_ANONYMOUS_AUTH: 'false' })).not.toContain('anonymous');
    expect(names({ ENABLE_ANONYMOUS_AUTH: 'true' })).toContain('anonymous');
  });

  it('keeps sessions in Postgres and uses KV only when the binding exists', () => {
    // Without the binding, session reads fall to Neon — correct, but the thing §12 wants to avoid,
    // so the two halves of that arrangement are worth pinning down.
    expect(authFor().options.secondaryStorage).toBeUndefined();
    expect(authFor().options.session?.storeSessionInDatabase).toBe(true);
  });
});

describe('auth routes', () => {
  it('is mounted at /api/auth/*', async () => {
    const res = await SELF.fetch('https://api.test/api/auth/ok');

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true });
  });

  it('404s an unknown auth route rather than falling through to tRPC', async () => {
    const res = await SELF.fetch('https://api.test/api/auth/not-a-route');

    expect(res.status).toBe(404);
  });
});
