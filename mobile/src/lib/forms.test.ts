import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { fieldErrors } from './forms';

const schema = z.object({
  email: z.string().min(1, 'Enter your email address'),
  password: z.string().min(8, 'Use at least 8 characters').max(12, 'Use at most 12 characters'),
});

/** The error from parsing `value`, which these cases are all built to fail. */
function errorFor(value: unknown) {
  const result = schema.safeParse(value);
  if (result.success) throw new Error('expected the parse to fail');
  return result.error;
}

describe('fieldErrors', () => {
  it('keys one message per field', () => {
    expect(fieldErrors(errorFor({ email: '', password: 'short' }))).toEqual({
      email: 'Enter your email address',
      password: 'Use at least 8 characters',
    });
  });

  it('keeps only the first issue for a field', () => {
    const error = errorFor({ email: '', password: 1 });
    error.issues.push({ code: 'custom', path: ['password'], message: 'second complaint' });

    expect(fieldErrors(error).password).not.toBe('second complaint');
  });

  it('drops issues that belong to no field', () => {
    const error = errorFor({ email: '', password: 'goodenough' });
    error.issues.push({ code: 'custom', path: [], message: 'whole-object complaint' });

    expect(Object.values(fieldErrors(error))).not.toContain('whole-object complaint');
  });
});
