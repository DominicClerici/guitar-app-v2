import { describe, expect, it } from 'vitest';

import { describeAuthError } from './errors';

describe('describeAuthError', () => {
  it('translates the codes these screens can reach', () => {
    expect(describeAuthError({ code: 'INVALID_EMAIL_OR_PASSWORD', status: 401 })).toBe(
      'That email and password do not match an account.',
    );
    expect(describeAuthError({ code: 'USER_ALREADY_EXISTS', status: 422 })).toBe(
      'An account already exists for that email address.',
    );
  });

  it('never surfaces Better Auth’s own message', () => {
    // Its wording is aimed at developers and can say more about an account than we want to.
    expect(
      describeAuthError({ code: 'SOMETHING_NEW', message: 'user record 41 missing', status: 500 }),
    ).toBe('Something went wrong. Try again.');
  });

  it('separates a connection failure from a server rejection', () => {
    expect(describeAuthError({ message: 'Network request failed' })).toBe(
      'Could not reach the server. Check your connection and try again.',
    );
    expect(describeAuthError({ status: 500, message: 'Network request failed' })).toBe(
      'Something went wrong. Try again.',
    );
  });

  it('names a rate limit, which arrives with no code', () => {
    expect(describeAuthError({ status: 429 })).toBe(
      'Too many attempts. Wait a moment and try again.',
    );
  });

  it('returns printable copy for a missing error', () => {
    expect(describeAuthError(null)).toBe('Something went wrong. Try again.');
    expect(describeAuthError(undefined)).toBe('Something went wrong. Try again.');
  });
});
