/**
 * Better Auth's failure shape, narrowed to the fields worth reacting to. Kept structural rather
 * than imported so this module stays free of native imports and can be unit tested.
 */
export interface AuthErrorLike {
  code?: string;
  message?: string;
  status?: number;
}

/**
 * Copy for the codes a user can actually reach from these screens. Anything absent falls through
 * to the generic message below — Better Auth's own `message` is written for developers and leaks
 * detail we would rather not put in front of someone (which field existed, for instance).
 */
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'That email and password do not match an account.',
  INVALID_EMAIL: 'That does not look like an email address.',
  INVALID_PASSWORD: 'That password is not correct.',
  USER_ALREADY_EXISTS: 'An account already exists for that email address.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'An account already exists for that email address.',
  PASSWORD_TOO_SHORT: 'That password is too short.',
  PASSWORD_TOO_LONG: 'That password is too long.',
  EMAIL_NOT_VERIFIED: 'Confirm your email address before signing in.',
  INVALID_TOKEN: 'That link has expired. Request a new one.',
  SESSION_EXPIRED: 'Your session has expired. Sign in again.',
  FAILED_TO_CREATE_USER: 'We could not create that account. Try again.',
  CREDENTIAL_ACCOUNT_NOT_FOUND: 'That account signs in another way.',
};

const NETWORK = 'Could not reach the server. Check your connection and try again.';
const GENERIC = 'Something went wrong. Try again.';

/** A fetch that never reached the Worker surfaces with no HTTP status of its own. */
function isNetworkFailure(error: AuthErrorLike): boolean {
  if (error.status === 0 || error.status === undefined) {
    return /network request failed|failed to fetch|network error/i.test(error.message ?? '');
  }
  return false;
}

/**
 * The sentence to show under a form for a failed auth call. Always returns something printable, so
 * a caller never has to decide what an empty error means.
 */
export function describeAuthError(error: AuthErrorLike | null | undefined): string {
  if (!error) return GENERIC;

  const known = error.code ? MESSAGES[error.code] : undefined;
  if (known) return known;

  if (isNetworkFailure(error)) return NETWORK;

  // Better Auth answers a tripped rate limit with a plain 429 and no code.
  if (error.status === 429) return 'Too many attempts. Wait a moment and try again.';

  return GENERIC;
}
