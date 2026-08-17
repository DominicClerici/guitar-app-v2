import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

import { authClient } from './client';
import { describeAuthError } from './errors';

/**
 * Sign in with Apple and Google, natively (BACKEND_PLAN.md §5).
 *
 * Both run the platform's own sheet and hand the resulting id token to Better Auth's social
 * sign-in, rather than sending anyone out to a browser. The server verifies the token against the
 * provider's public keys, so nothing here is trusted — the device's only job is to obtain one.
 *
 * Neither provider tells us whether an account already existed, and neither ever writes
 * `user.name`: the server's `mapProfileToUser` files a provider's name under `oauthProfile`
 * instead. So the step the flow lands on afterwards is decided the same way for all four ways in,
 * by looking at what the account is still missing. See `features/onboarding/steps.ts`.
 */

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/**
 * Whether to offer each button at all.
 *
 * Google's native module is only in the build when its URL scheme was set (see app.config.ts), so
 * offering the button without the ids would be offering one that cannot work. Apple's sheet is
 * iOS-only by definition.
 */
export const canUseGoogle = Boolean(GOOGLE_WEB_CLIENT_ID);
export const canUseApple = Platform.OS === 'ios';

/** A cancelled sheet is not a failure — the caller puts the form back and says nothing. */
export const SOCIAL_CANCELLED = 'cancelled' as const;

/**
 * The signed-in account on success, so the caller does not have to wait for the session store to
 * catch up before deciding what to do with it. Typed loosely because what the flow asks of it is
 * only which fields are still empty.
 */
export type SocialResult =
  | { ok: true; user: unknown }
  | { ok: false; error: string | typeof SOCIAL_CANCELLED };

const cancelled = { ok: false, error: SOCIAL_CANCELLED } as const;

/**
 * Apple reports a cancelled sheet as a thrown error with this code, and Google as a result the
 * module marks `type: 'cancelled'`. Everything else is a real failure worth showing.
 */
function isAppleCancellation(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === 'ERR_REQUEST_CANCELED';
}

export async function signInWithApple(): Promise<SocialResult> {
  let credential: AppleAuthentication.AppleAuthenticationCredential;

  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (error) {
    if (isAppleCancellation(error)) return cancelled;
    return { ok: false, error: describeAuthError({ message: String(error) }) };
  }

  if (!credential.identityToken) {
    return { ok: false, error: 'Apple did not return a sign-in token. Try again.' };
  }

  const { data, error } = await authClient.signIn.social({
    provider: 'apple',
    idToken: {
      token: credential.identityToken,
      // Apple's token itself carries no name. It is handed over separately, and only on the very
      // first authorisation for this app — every later sign-in returns null here, which is why it
      // is worth passing through even though it only ever prefills a field.
      ...(credential.fullName?.givenName || credential.fullName?.familyName
        ? {
            user: {
              name: {
                firstName: credential.fullName.givenName ?? '',
                lastName: credential.fullName.familyName ?? '',
              },
            },
          }
        : {}),
    },
  });

  return error
    ? { ok: false, error: describeAuthError(error) }
    : { ok: true, user: (data as { user?: unknown } | null)?.user };
}

/**
 * Configured on the first call rather than at import: this module is reached from the onboarding
 * screen, and doing native setup work at module scope would run it for everyone who opens the app.
 */
let googleConfigured = false;

function configureGoogle(): void {
  if (googleConfigured) return;
  GoogleSignin.configure({
    // The token the server verifies is issued to the *web* client id, even on a device — that is
    // what `GOOGLE_CLIENT_ID` in the Worker is. The iOS id identifies the app making the request.
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });
  googleConfigured = true;
}

export async function signInWithGoogle(): Promise<SocialResult> {
  configureGoogle();

  let idToken: string | null;

  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') return cancelled;
    idToken = response.data.idToken;
  } catch (error) {
    return { ok: false, error: describeAuthError({ message: String(error) }) };
  }

  if (!idToken) {
    return { ok: false, error: 'Google did not return a sign-in token. Try again.' };
  }

  const { data, error } = await authClient.signIn.social({
    provider: 'google',
    idToken: { token: idToken },
  });

  return error
    ? { ok: false, error: describeAuthError(error) }
    : { ok: true, user: (data as { user?: unknown } | null)?.user };
}
