import { z } from 'zod';

/**
 * Credential shapes for the email + password flows (BACKEND_PLAN.md §5, §8).
 *
 * Better Auth validates independently on the server; these exist so a client can reject a password
 * the server would reject anyway, before spending a round trip, and so both halves agree on what
 * "too short" means. The bounds therefore have to match Better Auth's own defaults — see the
 * constants below.
 */

/** Better Auth's default `emailAndPassword.minPasswordLength`. */
export const MIN_PASSWORD_LENGTH = 8;
/** Better Auth's default `emailAndPassword.maxPasswordLength`. */
export const MAX_PASSWORD_LENGTH = 128;

export const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .max(254)
  .pipe(z.email('That does not look like an email address'))
  // Addresses are stored lowercase, so `Ada@Example.com` and `ada@example.com` must not be able to
  // become two accounts.
  .transform((value) => value.toLowerCase());

export const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(MAX_PASSWORD_LENGTH, `Use at most ${MAX_PASSWORD_LENGTH} characters`);

export const displayName = z
  .string()
  .trim()
  .min(1, 'Enter your name')
  .max(64, 'Use at most 64 characters');

/**
 * Passwordless sign-in (BACKEND_PLAN.md §5). Onboarding sends a code to an address or a number and
 * takes the code back; the constants are shared so the field that collects six boxes and the plugin
 * that issues six digits cannot disagree about how many there are.
 */
export const OTP_LENGTH = 6;
/** Ten minutes. Long enough to switch apps, fetch the code, and come back. */
export const OTP_TTL_SECONDS = 600;
/** Better Auth's default, restated because the copy for a spent code depends on it. */
export const OTP_MAX_ATTEMPTS = 3;

/**
 * E.164: a `+`, a country code that cannot start at zero, and at most fifteen digits all told.
 * Twilio rejects anything else outright, so this is the one shape a number is ever stored or sent
 * in — the country prefix and the national number are only ever separate in the input UI.
 */
export const E164_PATTERN = /^\+[1-9]\d{1,14}$/;

export function isE164(value: string): boolean {
  return E164_PATTERN.test(value);
}

export const phoneNumber = z
  .string()
  .trim()
  .min(1, 'Enter your phone number')
  .refine(isE164, 'That does not look like a phone number');

export const otpCode = z
  .string()
  .trim()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code`);

/** Sign-in only checks that something was typed — length rules belong to sign-up. */
export const signInInput = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});
export type SignInInput = z.infer<typeof signInInput>;

export const signUpInput = z.object({
  name: displayName,
  email,
  password,
});
export type SignUpInput = z.infer<typeof signUpInput>;

export const requestPasswordResetInput = z.object({ email });
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetInput>;

export const resetPasswordInput = z.object({
  token: z.string().min(1),
  newPassword: password,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordInput>;

/**
 * The current password is checked against whatever is on record, so it carries no length rule of
 * its own: an account created before the bounds changed must still be able to move off its old
 * password.
 */
export const changePasswordInput = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: password,
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'Choose a password you are not already using',
    path: ['newPassword'],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordInput>;
