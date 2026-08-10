import { expoClient } from '@better-auth/expo/client';
import type { BetterAuthClientPlugin } from 'better-auth';
import { anonymousClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

import { resolveApiBaseUrl } from '@/lib/api/baseUrl';

/** Must match `scheme` in app.json and the entries in the Worker's TRUSTED_ORIGINS. */
export const APP_SCHEME = 'guitarmobileexpo';

/** Where the reset-password email sends the user back to. See src/app/reset-password.tsx. */
export const RESET_PASSWORD_LINK = `${APP_SCHEME}://reset-password`;

/** Where the verification email sends the user back to — the app's root, with nothing to do. */
export const VERIFY_EMAIL_LINK = `${APP_SCHEME}://`;

/**
 * Better Auth client (BACKEND_PLAN.md §5).
 *
 * The session cookie is kept in the device keychain by the Expo plugin, and read back out with
 * `getCookie()` for the tRPC client to attach. The client holds its own reactive session store, so
 * nothing here needs a React provider — `useSession` works from any component.
 */
type PluginActions = NonNullable<BetterAuthClientPlugin['getActions']>;

/**
 * The Expo plugin, with only its `getActions` signature restated.
 *
 * The plugin declares that parameter's `$fetch` more narrowly than `BetterAuthClientPlugin` does,
 * so under `strictFunctionTypes` it fails to satisfy the very interface it is built for. Swapping
 * in the interface's own parameter types fixes that while keeping the precise return type, which is
 * what `getCookie()` is inferred from. Restated rather than intersected with the whole interface:
 * that drags in an optional `$InferServerPlugin`, and the session type inferred through it collapses
 * to `never`. The runtime object is untouched either way — this is a declaration mismatch only.
 */
type ExpoPlugin = Omit<ReturnType<typeof expoClient>, 'getActions'> & {
  getActions: (
    ...args: Parameters<PluginActions>
  ) => ReturnType<ReturnType<typeof expoClient>['getActions']>;
};

const expoPlugin = expoClient({
  scheme: APP_SCHEME,
  // Synchronous by design: the plugin reads the cookie during request setup and cannot await.
  storage: {
    getItem: (key) => SecureStore.getItem(key),
    setItem: (key, value) => SecureStore.setItem(key, value),
  },
  storagePrefix: 'guitar',
}) as ExpoPlugin;

export const authClient = createAuthClient({
  baseURL: resolveApiBaseUrl(),
  basePath: '/api/auth',
  // The anonymous plugin contributes `signIn.anonymous()` and puts `isAnonymous` on the session
  // user, which is what tells the Account tab apart a guest from someone with a real account
  // (BACKEND_PLAN.md §5). Linking a guest to a real account is entirely server-side — the ordinary
  // sign-in and sign-up calls trigger it, so nothing on this side has to ask for it.
  plugins: [expoPlugin, anonymousClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
