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
import {
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_SECONDS,
  isE164,
} from '@guitar/shared';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous, emailOTP, phoneNumber } from 'better-auth/plugins';
import type { KVNamespace } from '@cloudflare/workers-types';

import { createMailer } from './email';
import { type Env, trustedOrigins } from './env';
import { linkAnonymousUser } from './link-anonymous';
import { createTexter } from './sms';

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

/**
 * Someone who signs up with a phone number has no address, and `user.email` is unique and not null
 * either way — so the phone plugin stands one in. Same reserved TLD and same reasoning as above:
 * nothing we send can escape to it, and it can never collide with a real domain.
 */
const PHONE_EMAIL_DOMAIN = 'phone.invalid';

/**
 * What a provider tells us about someone, kept out of `user.name` (see `user.oauthProfile` in the
 * schema). Onboarding asks everyone for a display name; the provider's version prefills that field
 * rather than standing in for the answer, so `name` stays empty until a person has actually typed
 * one and the step that asks is reached the same way whichever button was pressed.
 */
function separateProviderName(profile: { name?: string; picture?: string; image?: string }) {
  const suggested = profile.name?.trim();
  const image = profile.picture ?? profile.image;

  return {
    name: '',
    oauthProfile: {
      ...(suggested ? { name: suggested } : {}),
      ...(image ? { image } : {}),
    },
  };
}

/** What `increment` remembers so a counter expires a fixed time after it was first created. */
interface CounterMeta {
  expiresAt: number;
}

function kvSecondaryStorage(kv: KVNamespace): SecondaryStorage {
  return {
    get: (key) => kv.get(key),
    set: (key, value, ttl) =>
      kv.put(key, value, ttl ? { expirationTtl: Math.max(ttl, KV_MIN_TTL_SECONDS) } : undefined),
    delete: (key) => kv.delete(key),
    // Better Auth asks for this to be atomic; KV has no read-modify-write, so it is a read and a
    // delete. What it is used for is one-time values — an OTP is consumed here — and the race it
    // loses is two requests redeeming the same code at once, which is a race the code's own attempt
    // counter is what actually bounds.
    getAndDelete: async (key) => {
      const value = await kv.get(key);
      if (value !== null) await kv.delete(key);

      return value;
    },
    // Likewise not atomic, and likewise the closest KV offers. The deadline is carried in the
    // entry's metadata rather than left to `expirationTtl`, which every write would otherwise push
    // out: rate limiting wants a window measured from the first request, and one that restarted on
    // every subsequent one would hold a hammering client out indefinitely instead of for `ttl`.
    increment: async (key, ttl) => {
      const { value, metadata } = await kv.getWithMetadata<CounterMeta>(key);
      const stored = Number(value);
      const next = (Number.isFinite(stored) ? stored : 0) + 1;
      const expiresAt = metadata?.expiresAt ?? Date.now() + ttl * 1000;

      await kv.put(key, String(next), {
        expirationTtl: Math.max(Math.ceil((expiresAt - Date.now()) / 1000), KV_MIN_TTL_SECONDS),
        metadata: { expiresAt } satisfies CounterMeta,
      });

      return next;
    },
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
      mapProfileToUser: separateProviderName,
    };
  }

  // Apple is reached natively and only natively: the device gets an identity token from
  // `expo-apple-authentication` and the server verifies it against Apple's public keys. That
  // check compares the token's audience against `appBundleIdentifier` and never reads a secret,
  // so the bundle id is the entire requirement. A Services identifier and the six-monthly JWT
  // that stands in for its secret belong to the browser redirect flow, which nothing in this app
  // can start — gating on them would leave the button dead in exchange for credentials no code
  // path ever spends.
  if (env.APPLE_APP_BUNDLE_IDENTIFIER) {
    providers.apple = {
      // Required by the provider's options, and not what the audience check above reads: that
      // prefers `appBundleIdentifier`. The Services identifier stands in wherever one exists, so
      // adding the web flow later is a variable to set rather than a change here.
      clientId: env.APPLE_CLIENT_ID || env.APPLE_APP_BUNDLE_IDENTIFIER,
      clientSecret: env.APPLE_CLIENT_SECRET,
      appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER,
      // Apple's own id token carries no name at all. The one that reaches here comes from the
      // `user` field the device sends alongside it, which Apple fills in on the very first
      // authorisation and never again — so it is worth keeping even though it is only a prefill.
      mapProfileToUser: separateProviderName,
    };
  }

  return providers;
}

function plugins({ env, db }: { env: Env; db: Db }): NonNullable<BetterAuthOptions['plugins']> {
  const mailer = createMailer(env);
  const texter = createTexter(env);

  // Unconditional — the native app needs two things from it. Requests from React Native carry no
  // `origin`, so the client sends `expo-origin` instead and this promotes it to the real header for
  // the origin check. And when a verification or OAuth callback redirects to a non-http URL — our
  // `guitarmobileexpo://` deep links — it copies the session cookie onto that redirect, which is
  // the only way the cookie reaches a device that has no cookie jar.
  //
  // It does not trust our URL scheme: that comes from TRUSTED_ORIGINS in wrangler.jsonc, and the
  // plugin's own contribution is `exp://` in development only.
  const enabled: NonNullable<BetterAuthOptions['plugins']> = [
    expo(),

    // Onboarding's email path (§5). Passwordless: possession of the address is the proof, so a
    // code signs someone in whether or not the account already exists — and creates it if it does
    // not. `emailAndPassword` stays on beside it for accounts that already have a password.
    emailOTP({
      otpLength: OTP_LENGTH,
      expiresIn: OTP_TTL_SECONDS,
      allowedAttempts: OTP_MAX_ATTEMPTS,
      // A code in the database is a bearer credential for the account until it expires. Hashed
      // costs us the ability to resend the same one, which `resendStrategy` would otherwise allow
      // — a new code on every request is the right trade.
      storeOTP: 'hashed',
      sendVerificationOTP: async ({ email, otp, type }) => {
        const purpose =
          type === 'forget-password'
            ? 'reset your password'
            : type === 'change-email'
              ? 'confirm your new email address'
              : 'sign in';

        await mailer.send({
          to: email,
          subject: `${otp} is your Guitar App code`,
          text: `Use this code to ${purpose}:\n\n${otp}\n\nIt expires in ${Math.round(
            OTP_TTL_SECONDS / 60,
          )} minutes. If you didn't ask for it, ignore this email.`,
        });
      },
    }),

    // Onboarding's phone path (§5). The columns it needs are declared on `user` in the schema.
    phoneNumber({
      otpLength: OTP_LENGTH,
      expiresIn: OTP_TTL_SECONDS,
      allowedAttempts: OTP_MAX_ATTEMPTS,
      // An unverified number must not be a way in: without this, the plugin would let a number be
      // claimed before the code that proves it was ever entered.
      requireVerification: true,
      phoneNumberValidator: isE164,
      signUpOnVerification: {
        getTempEmail: (phone) => `${phone.replace(/\D/g, '')}@${PHONE_EMAIL_DOMAIN}`,
        // Empty rather than the plugin's default of the phone number itself, which would leave the
        // account looking like it already had a display name and skip the step that asks for one.
        getTempName: () => '',
      },
      sendOTP: async ({ phoneNumber: to, code }) => {
        await texter.send({ to, body: `${code} is your Guitar App code.` });
      },
    }),
  ];

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

    user: {
      additionalFields: {
        /**
         * Filled by `mapProfileToUser` above and read by onboarding to prefill the name field.
         * `input` is left open because Better Auth only forwards a provider profile's extra fields
         * through the same parser it uses for client input — closing it would drop the value on
         * the one path that sets it. Nothing trusts it: it is a suggested display name.
         */
        oauthProfile: { type: 'json', required: false, returned: true },

        /**
         * What onboarding collects after the name (`@guitar/shared`'s `onboarding.ts`). All four
         * take client input, because onboarding writes them with `updateUser` as each step is
         * answered — which is also what makes a half-finished flow resumable: the account carries
         * what it has been told, so the next step is whatever is still null.
         *
         * Values are validated by the screens against the shared schemas before they are sent, and
         * again on the way out by `parseSkillLevel` / `parseLearningGoals`. Nothing downstream
         * trusts the column: an unrecognised value degrades rather than throwing.
         */
        skillLevel: { type: 'string', required: false, input: true, returned: true },
        goals: { type: 'string[]', required: false, input: true, returned: true },
        termsAcceptedAt: { type: 'date', required: false, input: true, returned: true },
        marketingEmails: {
          type: 'boolean',
          required: false,
          input: true,
          returned: true,
          defaultValue: false,
        },
      },
    },

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
