import { describe, expect, it } from 'vitest';

import {
  DEFAULT_DIAL_CODE,
  formatNational,
  isCompletePhone,
  nationalDigits,
  sanitizeDialCode,
  toE164,
} from './phone';

describe('sanitizeDialCode', () => {
  it('keeps a plain code as the plus and its digits', () => {
    expect(sanitizeDialCode('+44')).toBe('+44');
    expect(sanitizeDialCode('44')).toBe('+44');
  });

  it('drops everything that is not a digit, wherever it was typed', () => {
    expect(sanitizeDialCode('+ 4 4')).toBe('+44');
    expect(sanitizeDialCode('(+44)')).toBe('+44');
  });

  it('stops at three digits, which is the longest country code there is', () => {
    expect(sanitizeDialCode('+3581')).toBe('+358');
  });

  it('leaves a lone plus, so the field can be cleared and retyped', () => {
    expect(sanitizeDialCode('')).toBe('+');
    expect(sanitizeDialCode('+')).toBe('+');
  });

  it('rejects a leading zero, which E.164 has no country code for', () => {
    expect(sanitizeDialCode('+0')).toBe('+');
    expect(sanitizeDialCode('+01')).toBe('+1');
  });
});

describe('nationalDigits', () => {
  it('keeps only what a number is made of', () => {
    expect(nationalDigits('(555) 123-4567')).toBe('5551234567');
    expect(nationalDigits('555.123.4567 ext')).toBe('5551234567');
  });
});

describe('toE164', () => {
  it('joins the two halves into the one shape Twilio takes', () => {
    expect(toE164('+1', '(555) 123-4567')).toBe('+15551234567');
    expect(toE164('+44', '7700 900123')).toBe('+447700900123');
  });

  it('is unbothered by a dial code typed without its plus', () => {
    expect(toE164('44', '7700900123')).toBe('+447700900123');
  });
});

describe('isCompletePhone', () => {
  it('accepts a number long enough to dial', () => {
    expect(isCompletePhone('+1', '5551234567')).toBe(true);
    expect(isCompletePhone('+44', '7700900123')).toBe(true);
  });

  it('rejects one still being typed', () => {
    expect(isCompletePhone('+1', '')).toBe(false);
    expect(isCompletePhone('+1', '555')).toBe(false);
  });

  it('rejects a number past E.164’s fifteen digits', () => {
    expect(isCompletePhone('+1', '12345678901234567')).toBe(false);
  });

  it('rejects a missing dial code', () => {
    expect(isCompletePhone('+', '5551234567')).toBe(false);
  });
});

describe('formatNational', () => {
  it('groups a North American number the way one is written', () => {
    expect(formatNational(DEFAULT_DIAL_CODE, '5551234567')).toBe('(555) 123-4567');
  });

  it('groups it as far as it has been typed', () => {
    expect(formatNational('+1', '')).toBe('');
    expect(formatNational('+1', '55')).toBe('55');
    expect(formatNational('+1', '5551')).toBe('(555) 1');
    expect(formatNational('+1', '555123')).toBe('(555) 123');
  });

  it('leaves every other country alone rather than guessing at its grouping', () => {
    expect(formatNational('+44', '7700900123')).toBe('7700900123');
  });

  it('ignores digits past the ten a North American number has', () => {
    expect(formatNational('+1', '55512345678888')).toBe('(555) 123-4567');
  });
});
