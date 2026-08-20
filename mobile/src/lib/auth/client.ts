import { expoClient } from '@better-auth/expo/client';
import {
  anonymousClient,
  emailOTPClient,
  inferAdditionalFields,
  phoneNumberClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

import { resolveApiBaseUrl } from '@/lib/api/baseUrl';

/** Must match `scheme` in app.json and the entries in the Worker's TRUSTED_ORIGINS. */
export const APP_SCHEME = 'guitarmobileexpo';

/** Where the reset-password email sends the user back to. See src/app/reset-password.tsx. */
export const RESET_PASSWORD_LINK = `${APP_SCHEME}://reset-password`;

/** Where the verification email sends the user back to — the app's root, with nothing to do. */
export const VERIFY_EMAIL_LINK = `${APP_SCHEME}://`;

const expoPlugin = expoClient({
  scheme: APP_SCHEME,
  // The module itself, rather than the two methods this once needed. The plugin reads and writes
  // the cookie on both a synchronous and an asynchronous path — `getCookie`, the session cache and
  // every outgoing auth request take the async one — and a storage object missing half of them does
  // not fail at the boundary but at the call, as `undefined is not a function` from inside a promise
  // nothing awaits. `ExpoClientStorage` is a `Pick` of this module, so handing over the whole thing
  // is what keeps the set from drifting again.
  storage: SecureStore,
  storagePrefix: 'guitar',
});

/**
 * Better Auth client (BACKEND_PLAN.md §5).
 *
 * The session cookie is kept in the device keychain by the Expo plugin, and read back out with
 * `getCookie()` for the tRPC client to attach. The client holds its own reactive session store, so
 * nothing here needs a React provider — `useSession` works from any component.
 */
export const authClient = createAuthClient({
  baseURL: resolveApiBaseUrl(),
  basePath: '/api/auth',
  // The anonymous plugin contributes `signIn.anonymous()` and puts `isAnonymous` on the session
  // user, which is what tells the Account tab apart a guest from someone with a real account
  // (BACKEND_PLAN.md §5). Linking a guest to a real account is entirely server-side — the ordinary
  // sign-in and sign-up calls trigger it, so nothing on this side has to ask for it.
  plugins: [
    expoPlugin,
    anonymousClient(),
    // Onboarding's two passwordless paths (BACKEND_PLAN.md §5): `emailOtp.sendVerificationOtp` /
    // `signIn.emailOtp`, and `phoneNumber.sendOtp` / `phoneNumber.verify`. Both create the account
    // if there isn't one, and both are matched by the anonymous plugin's linking hook — so a guest
    // signing in this way takes their rows with them without either side asking for it.
    emailOTPClient(),
    phoneNumberClient(),
    // Mirrors the server's `user.additionalFields` so the session's user carries it. Declared
    // rather than inferred from the server's `Auth` type: `@guitar/api` is a type-only entrypoint
    // that deliberately exposes the router alone, and widening it to reach the auth instance would
    // pull the Worker's whole dependency graph into the device's TypeScript program.
    inferAdditionalFields({
      user: {
        oauthProfile: { type: 'json', required: false },
        // The rest of onboarding, which the flow both reads off the session and writes back with
        // `updateUser`. Declared as input fields for the same reason the server declares them:
        // every step past the name is a write to one of these.
        skillLevel: { type: 'string', required: false, input: true },
        goals: { type: 'string[]', required: false, input: true },
        termsAcceptedAt: { type: 'date', required: false, input: true },
        marketingEmails: { type: 'boolean', required: false, input: true },
      },
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;
