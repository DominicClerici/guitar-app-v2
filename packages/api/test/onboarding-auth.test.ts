/**
 * The passwordless halves of onboarding (BACKEND_PLAN.md §5, §11).
 *
 * Two kinds of check. The configuration ones need nothing but the auth instance, and pin down the
 * decisions that would otherwise only show on a device: that a provider's name is filed away
 * rather than written to `user.name`, and that neither OTP plugin is tied to the anonymous kill
 * switch. The flow ones run a real code through a real Postgres, because the property the whole
 * onboarding step machine rests on — a brand-new account has an empty name — is decided inside
 * Better Auth rather than by anything we wrote.
 */
import { createDb, pgSchema } from '@guitar/db';
import { env } from 'cloudflare:test';
import { eq, sql } from 'drizzle-orm';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAuth } from '../src/auth';
import type { Env } from '../src/env';

const { user } = pgSchema;

const db = createDb(env.TEST_DATABASE_URL);

const reachable = await db
  .execute(sql`select 1 from ${user} limit 0`)
  .then(() => true)
  .catch(() => false);

if (!reachable) {
  console.warn(
    `Skipping onboarding auth flow tests: no migrated database at ${env.TEST_DATABASE_URL}.\n` +
      'Run `pnpm db db:up && pnpm db db:migrate` to exercise them.',
  );
}

function authFor(overrides: Partial<Env> = {}) {
  const merged = { ...(env as unknown as Env), ...overrides };
  return createAuth({ env: merged, db: createDb(merged.DATABASE_URL) });
}

function pluginIds(overrides: Partial<Env> = {}): string[] {
  return (authFor(overrides).options.plugins ?? []).map((plugin) => plugin.id);
}

describe('onboarding auth configuration', () => {
  it('registers both OTP plugins whatever the guest flag says', () => {
    // They are how someone signs in, not how a guest is created — tying them to that kill switch
    // would take the whole flow down with it.
    for (const ids of [pluginIds(), pluginIds({ ENABLE_ANONYMOUS_AUTH: 'false' })]) {
      expect(ids).toContain('email-otp');
      // The server half is `phone-number`; the client plugin of the same pair calls itself
      // `phoneNumber`, which is worth not being caught by twice.
      expect(ids).toContain('phone-number');
    }
  });

  it('keeps a provider’s name out of user.name', () => {
    const google = authFor({
      GOOGLE_CLIENT_ID: 'google-id',
      GOOGLE_CLIENT_SECRET: 'google-secret',
    }).options.socialProviders?.google;

    // A provider may also be declared as a function returning its options; ours is not, and the
    // mapping is only reachable on the plain form.
    const mapProfileToUser = typeof google === 'function' ? undefined : google?.mapProfileToUser;

    // The whole reason the name step is reached identically from all four ways in. Only the one
    // field the mapping reads is supplied; the rest of Google's profile is irrelevant to it.
    const profile = { name: 'Ada Lovelace' } as Parameters<NonNullable<typeof mapProfileToUser>>[0];

    expect(mapProfileToUser?.(profile)).toEqual({
      name: '',
      oauthProfile: { name: 'Ada Lovelace' },
    });
  });

  it('declares oauthProfile so the session carries the suggestion back', () => {
    expect(authFor().options.user?.additionalFields?.oauthProfile).toMatchObject({
      type: 'json',
      returned: true,
    });
  });
});

/**
 * Credentials are blanked rather than inherited: `.dev.vars` is loaded into this runtime, and a
 * real Resend or Twilio key here would send a stranger a code every time the suite ran. Without
 * them both senders log instead, which is also the only way to read the code back out.
 */
function liveAuth() {
  const auth = createAuth({
    env: {
      ...(env as unknown as Env),
      RESEND_API_KEY: undefined,
      EMAIL_FROM: undefined,
      TWILIO_ACCOUNT_SID: undefined,
      TWILIO_AUTH_TOKEN: undefined,
      TWILIO_FROM_NUMBER: undefined,
    },
    // The adapter is handed the database directly, so `DATABASE_URL` in the env above is never
    // read — this is the only thing that decides which server the flow writes to.
    db,
  });

  // `plugins()` is annotated with Better Auth's own widened plugin type, which is what keeps its
  // one conditional branch from making the return type a union — and which also erases every
  // plugin's endpoints from `auth.api`. The routes are still there at runtime, and the device
  // reaches them through the *client* plugins' inference rather than this type, so the erasure
  // costs nothing outside this file. Restated here rather than worked around in `auth.ts`.
  return auth as typeof auth & {
    api: {
      sendVerificationOTP(args: {
        body: { email: string; type: 'sign-in' };
      }): Promise<{ success: boolean }>;
      signInEmailOTP(args: {
        body: { email: string; otp: string };
      }): Promise<{ user: { email: string; name: string; emailVerified: boolean } }>;
    };
  };
}

/** The code, taken from what the dev sender printed instead of delivering. */
async function captureCode(send: () => Promise<unknown>): Promise<string> {
  const printed: string[] = [];
  const spy = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
    printed.push(args.map(String).join(' '));
  });

  try {
    await send();
  } finally {
    spy.mockRestore();
  }

  const found = printed.join('\n').match(/\b(\d{6})\b/)?.[1];
  if (!found) throw new Error(`No code in dev sender output:\n${printed.join('\n')}`);
  return found;
}

describe.skipIf(!reachable)('email OTP sign-up', () => {
  const created: string[] = [];

  afterEach(async () => {
    for (const address of created.splice(0)) {
      await db.delete(user).where(eq(user.email, address));
    }
  });

  it('creates an account with no name, which is what puts the flow on the name step', async () => {
    const auth = liveAuth();
    const address = `otp-${crypto.randomUUID()}@example.com`;
    created.push(address);

    const code = await captureCode(() =>
      auth.api.sendVerificationOTP({ body: { email: address, type: 'sign-in' } }),
    );

    const result = await auth.api.signInEmailOTP({ body: { email: address, otp: code } });

    expect(result.user.email).toBe(address);
    // The two properties onboarding depends on: possession of the address is proof enough to be
    // verified, and nothing has been said about who this person is yet.
    expect(result.user.emailVerified).toBe(true);
    expect(result.user.name).toBe('');
  });

  it('refuses a code that was not the one sent', async () => {
    const auth = liveAuth();
    const address = `otp-${crypto.randomUUID()}@example.com`;
    created.push(address);

    const code = await captureCode(() =>
      auth.api.sendVerificationOTP({ body: { email: address, type: 'sign-in' } }),
    );
    const wrong = code === '000000' ? '111111' : '000000';

    await expect(
      auth.api.signInEmailOTP({ body: { email: address, otp: wrong } }),
    ).rejects.toThrow();

    // And no account was left behind by the attempt.
    const rows = await db.select().from(user).where(eq(user.email, address));
    expect(rows).toHaveLength(0);
  });
});
