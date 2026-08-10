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
