import { describe, expect, it } from 'vitest';

import {
  changePasswordInput,
  email,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  requestPasswordResetInput,
  signInInput,
  signUpInput,
} from './auth';

/** The first issue's message, or `undefined` when the value parsed. */
function messageFor(schema: { safeParse: (value: unknown) => any }, value: unknown) {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('email', () => {
  it('trims and lowercases so one address cannot become two accounts', () => {
    expect(email.parse('  Ada@Example.COM ')).toBe('ada@example.com');
  });

  it('distinguishes an empty field from a malformed one', () => {
    expect(messageFor(email, '   ')).toBe('Enter your email address');
    expect(messageFor(email, 'ada@')).toBe('That does not look like an email address');
  });
});

describe('signUpInput', () => {
  const valid = { name: 'Ada', email: 'ada@example.com', password: 'correct-horse' };

  it('accepts a complete sign-up', () => {
    expect(signUpInput.parse(valid)).toEqual(valid);
  });

  it('enforces the same password bounds Better Auth applies server-side', () => {
    expect(
      messageFor(signUpInput, { ...valid, password: 'a'.repeat(MIN_PASSWORD_LENGTH - 1) }),
    ).toBe(`Use at least ${MIN_PASSWORD_LENGTH} characters`);
    expect(
      messageFor(signUpInput, { ...valid, password: 'a'.repeat(MAX_PASSWORD_LENGTH + 1) }),
    ).toBe(`Use at most ${MAX_PASSWORD_LENGTH} characters`);
    expect(
      signUpInput.safeParse({ ...valid, password: 'a'.repeat(MIN_PASSWORD_LENGTH) }).success,
    ).toBe(true);
  });

  it('requires a name', () => {
    expect(messageFor(signUpInput, { ...valid, name: '  ' })).toBe('Enter your name');
  });
});

describe('signInInput', () => {
  it('does not apply length rules to an existing password', () => {
    // An account made before the bounds existed must still be able to sign in and change it.
    expect(signInInput.safeParse({ email: 'ada@example.com', password: 'short' }).success).toBe(
      true,
    );
  });

  it('still requires something to be typed', () => {
    expect(messageFor(signInInput, { email: 'ada@example.com', password: '' })).toBe(
      'Enter your password',
    );
  });
});

describe('requestPasswordResetInput', () => {
  it('normalises the address the same way sign-up does', () => {
    expect(requestPasswordResetInput.parse({ email: 'Ada@Example.com' })).toEqual({
      email: 'ada@example.com',
    });
  });
});

describe('changePasswordInput', () => {
  it('rejects reusing the current password', () => {
    const same = { currentPassword: 'correct-horse', newPassword: 'correct-horse' };

    expect(messageFor(changePasswordInput, same)).toBe(
      'Choose a password you are not already using',
    );
  });

  it('accepts a genuinely new password', () => {
    expect(
      changePasswordInput.safeParse({
        currentPassword: 'correct-horse',
        newPassword: 'battery-staple',
      }).success,
    ).toBe(true);
  });
});
