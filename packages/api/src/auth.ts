/**
 * Better Auth, self-hosted in the Worker (BACKEND_PLAN.md §5).
 *
 * Users and sessions live in our own Neon Postgres through the Drizzle adapter, so progress rows
 * can join directly against `user`. The instance is built per request because its configuration
 * comes from the Worker's env, which only exists inside a request scope.
 *
 * Auth routes never pass through tRPC — Better Auth serves its own handler, mounted in Hono at
 * `/api/auth/*` (§4).
 */
import { expo } from '@better-auth/expo';
import { authSchema, type Db } from '@guitar/db';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import type { KVNamespace } from '@cloudflare/workers-types';

import { createMailer } from './email';
import { type Env, trustedOrigins } from './env';
import { linkAnonymousUser } from './link-anonymous';

type SecondaryStorage = NonNullable<BetterAuthOptions['secondaryStorage']>;
type SocialProviders = NonNullable<BetterAuthOptions['socialProviders']>;

/** KV rejects any shorter expiry outright, so a short session TTL has to be rounded up. */
const KV_MIN_TTL_SECONDS = 60;

/**
 * Guest accounts still need an address, because `user.email` is unique and not null. A reserved
 * TLD (RFC 2606) is used rather than the plugin's default `temp@<id>.com`, so a guest address can
 * never collide with a domain somebody actually owns and nothing we send can escape to it.
 */
const ANONYMOUS_EMAIL_DOMAIN = 'guest.invalid';

function kvSecondaryStorage(kv: KVNamespace): SecondaryStorage {
  return {
    get: (key) => kv.get(key),
    set: (key, value, ttl) =>
      kv.put(key, value, ttl ? { expirationTtl: Math.max(ttl, KV_MIN_TTL_SECONDS) } : undefined),
    delete: (key) => kv.delete(key),
  };
}

/**
 * Providers appear only once their credentials are present, so a developer without OAuth apps
 * gets a working email + password server rather than a boot failure.
 */
function socialProviders(env: Env): SocialProviders {
  const providers: SocialProviders = {};

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }

  if (env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET) {
    providers.apple = {
      // The Services identifier, which is what the web redirect flow is issued against. The
      // native `expo-apple-authentication` token is issued against the bundle id instead, so both
      // have to be declared for tokens from either path to be accepted.
      clientId: env.APPLE_CLIENT_ID,
      clientSecret: env.APPLE_CLIENT_SECRET,
      appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER,
    };
  }

  return providers;
}

function plugins({ env, db }: { env: Env; db: Db }): NonNullable<BetterAuthOptions['plugins']> {
  // Unconditional — the native app needs two things from it. Requests from React Native carry no
  // `origin`, so the client sends `expo-origin` instead and this promotes it to the real header for
  // the origin check. And when a verification or OAuth callback redirects to a non-http URL — our
  // `guitarmobileexpo://` deep links — it copies the session cookie onto that redirect, which is
  // the only way the cookie reaches a device that has no cookie jar.
  //
  // It does not trust our URL scheme: that comes from TRUSTED_ORIGINS in wrangler.jsonc, and the
  // plugin's own contribution is `exp://` in development only.
  const enabled: NonNullable<BetterAuthOptions['plugins']> = [expo()];

  if (env.ENABLE_ANONYMOUS_AUTH === 'false') return enabled;

  return [
    ...enabled,
    anonymous({
      emailDomainName: ANONYMOUS_EMAIL_DOMAIN,
      // Every synced row is keyed by user_id, so a guest signing in has to take those rows with
      // them (§5). Better Auth deletes the guest user as soon as this resolves, so anything left
      // behind here is lost — and a throw is the only way to stop that deletion.
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        await linkAnonymousUser({
          db,
          anonymousUserId: anonymousUser.user.id,
          userId: newUser.user.id,
        });
      },
    }),
  ];
}

export function createAuth({ env, db }: { env: Env; db: Db }) {
  const mailer = createMailer(env);

  return betterAuth({
    appName: 'Guitar App',
    baseURL: env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    // The Expo scheme must be in this list or OAuth redirects and cookie handling fail (§10).
    trustedOrigins: trustedOrigins(env),

    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: authSchema,
      // The neon-http driver cannot open an interactive transaction (§3), so the adapter must
      // issue its statements sequentially rather than wrapping them in one.
      transaction: false,
    }),

    // Session lookups are the hottest read in the API and Neon compute-hours are the free-tier
    // limit we expect to reach first (§12), so KV answers them when the binding exists. Sessions
    // are still written to Postgres, so they survive a KV eviction and stay revocable.
    secondaryStorage: env.SESSION_KV ? kvSecondaryStorage(env.SESSION_KV) : undefined,
    session: { storeSessionInDatabase: true },
    verification: { storeInDatabase: true },

    emailAndPassword: {
      enabled: true,
      // Verification mail still goes out on sign-up, but an unverified address can sign in.
      // Blocking here would lock out anyone whose mail never arrived, with no way to ask for
      // another one.
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await mailer.send({
          to: user.email,
          subject: 'Reset your password',
          text: `Reset your Guitar App password:\n\n${url}\n\nIf you didn't ask for this, ignore this email.`,
        });
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await mailer.send({
          to: user.email,
          subject: 'Verify your email',
          text: `Confirm your Guitar App email address:\n\n${url}`,
        });
      },
    },

    socialProviders: socialProviders(env),
    plugins: plugins({ env, db }),
  });
}

export type Auth = ReturnType<typeof createAuth>;

/** `{ session, user }` when signed in, `null` otherwise. */
export type AuthSession = Awaited<ReturnType<Auth['api']['getSession']>>;
