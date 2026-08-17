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

/**
 * The pool loads `.dev.vars` into the bindings, so a developer who has real OAuth apps set up
 * locally starts from a different set of providers than CI does. Every provider case below spreads
 * this first and then names the credentials it actually means.
 */
const NO_PROVIDER_CREDENTIALS: Partial<Env> = {
  GOOGLE_CLIENT_ID: undefined,
  GOOGLE_CLIENT_SECRET: undefined,
  APPLE_APP_BUNDLE_IDENTIFIER: undefined,
  APPLE_CLIENT_ID: undefined,
  APPLE_CLIENT_SECRET: undefined,
};

describe('auth configuration', () => {
  it('enables email + password without requiring verification to sign in', () => {
    const options = authFor().options;

    expect(options.emailAndPassword?.enabled).toBe(true);
    expect(options.emailAndPassword?.requireEmailVerification).toBe(false);
    expect(options.emailVerification?.sendOnSignUp).toBe(true);
  });

  it('omits social providers whose credentials are unset', () => {
    const providers = authFor(NO_PROVIDER_CREDENTIALS).options.socialProviders ?? {};

    expect(Object.keys(providers)).toEqual([]);
  });

  it('registers google and apple once their credentials are present', () => {
    const options = authFor({
      ...NO_PROVIDER_CREDENTIALS,
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
      clientId: 'apple-service-id',
    });
  });

  it('registers apple on the bundle id alone, with no Services id or secret', () => {
    // The only credentials the app can actually produce. Verifying a native id token compares its
    // audience to the bundle id and never reads a secret, so requiring the redirect flow's half
    // would leave the button dead for everyone who has not set up a web client they never use.
    const options = authFor({
      ...NO_PROVIDER_CREDENTIALS,
      APPLE_APP_BUNDLE_IDENTIFIER: 'com.example.guitar',
    }).options;

    expect(Object.keys(options.socialProviders ?? {})).toEqual(['apple']);
    expect(options.socialProviders?.apple).toMatchObject({
      appBundleIdentifier: 'com.example.guitar',
      // Standing in for the Services id, which is what the audience check falls back to when no
      // bundle id is given — here it is set, so this value is never what a token is matched on.
      clientId: 'com.example.guitar',
    });
  });

  it('always registers the expo plugin', () => {
    // It carries the session cookie onto deep-link redirects and promotes the app's `expo-origin`
    // header, so it must survive every combination of the optional flags below. Asserted on the
    // config because its effects only show on a device.
    const ids = (overrides: Partial<Env>) =>
      (authFor(overrides).options.plugins ?? []).map((plugin) => plugin.id);

    expect(ids({})).toContain('expo');
    expect(ids({ ENABLE_ANONYMOUS_AUTH: 'false' })).toContain('expo');
  });

  it('enables the anonymous plugin unless the flag is explicitly false', () => {
    const names = (overrides: Partial<Env>) =>
      (authFor(overrides).options.plugins ?? []).map((plugin) => plugin.id);

    // On by default, and on where the var is simply missing — the kill switch has to be turned
    // on deliberately, not reached by forgetting to set something.
    expect(names({})).toContain('anonymous');
    expect(names({ ENABLE_ANONYMOUS_AUTH: undefined })).toContain('anonymous');
    expect(names({ ENABLE_ANONYMOUS_AUTH: 'false' })).not.toContain('anonymous');
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
