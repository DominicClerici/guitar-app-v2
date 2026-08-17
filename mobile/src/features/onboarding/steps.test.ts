import { describe, expect, it } from 'vitest';

import { nextStep, suggestedName } from './steps';

describe('nextStep', () => {
  it('starts at the account step when nobody is signed in', () => {
    expect(nextStep(null)).toBe('account');
    expect(nextStep(undefined)).toBe('account');
  });

  it('starts at the account step for a guest', () => {
    // The app creates one at launch, so this is what the flow opens onto every time — a guest is
    // signed in, but has not begun claiming an account.
    expect(nextStep({ name: 'Guest', isAnonymous: true })).toBe('account');
  });

  it('asks for a name when the account has none', () => {
    expect(nextStep({ name: '', isAnonymous: false })).toBe('name');
    expect(nextStep({ name: '   ', isAnonymous: false })).toBe('name');
  });

  it('asks for a name after a social sign-in, which never fills one in', () => {
    // The provider's version is filed under oauthProfile and only ever prefills the field.
    expect(nextStep({ name: '', oauthProfile: { name: 'Ada Lovelace' } })).toBe('name');
  });

  it('is finished for an account that already has everything', () => {
    expect(nextStep({ name: 'Ada', isAnonymous: false })).toBe('done');
  });

  it('treats a missing isAnonymous as a real account', () => {
    // Not every path returns the field, and absent must not read as "guest" — that would put a
    // signed-in person back on the form they just completed.
    expect(nextStep({ name: 'Ada' })).toBe('done');
  });
});

describe('suggestedName', () => {
  it('offers what the provider said', () => {
    expect(suggestedName({ name: '', oauthProfile: { name: 'Ada Lovelace' } })).toBe('Ada Lovelace');
  });

  it('offers nothing when there was no provider', () => {
    expect(suggestedName({ name: '' })).toBe('');
    expect(suggestedName(null)).toBe('');
  });

  it('ignores a blank or malformed suggestion', () => {
    expect(suggestedName({ name: '', oauthProfile: { name: '  ' } })).toBe('');
    expect(suggestedName({ name: '', oauthProfile: 'nonsense' })).toBe('');
    expect(suggestedName({ name: '', oauthProfile: { name: 42 } })).toBe('');
  });
});
