import { describe, expect, it } from 'vitest';

import { isProfileStep, nextStep, suggestedName } from './steps';

/** An account that owes nothing, for tests that are about one missing thing at a time. */
const COMPLETE = {
  name: 'Ada',
  isAnonymous: false,
  skillLevel: 'beginner',
  goals: ['learn_chords'],
  termsAcceptedAt: '2026-08-17T10:00:00.000Z',
};

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
    expect(nextStep({ ...COMPLETE, name: '' })).toBe('name');
    expect(nextStep({ ...COMPLETE, name: '   ' })).toBe('name');
  });

  it('asks for a name after a social sign-in, which never fills one in', () => {
    // The provider's version is filed under oauthProfile and only ever prefills the field.
    expect(nextStep({ name: '', oauthProfile: { name: 'Ada Lovelace' } })).toBe('name');
  });

  it('walks the profile steps in order once there is a name', () => {
    expect(nextStep({ name: 'Ada' })).toBe('skill');
    expect(nextStep({ name: 'Ada', skillLevel: 'beginner' })).toBe('goals');
    expect(nextStep({ name: 'Ada', skillLevel: 'beginner', goals: [] })).toBe('terms');
  });

  it('counts declining to answer as an answer', () => {
    // Skipping a step is a decision, and the record of it is what stops the step being owed
    // again. Without this, an optional step would be asked forever.
    expect(nextStep({ ...COMPLETE, skillLevel: 'no_answer' })).toBe('done');
    expect(nextStep({ ...COMPLETE, goals: [] })).toBe('done');
  });

  it('does not re-ask a question whose stored answer this build cannot read', () => {
    // A level added by a newer client. It has been answered; that this build has no name for the
    // answer is not a reason to put the question again.
    expect(nextStep({ ...COMPLETE, skillLevel: 'virtuoso' })).toBe('done');
    expect(nextStep({ ...COMPLETE, goals: ['learn_sitar'] })).toBe('done');
  });

  it('asks for terms until an instant is stored, in whatever shape it arrives', () => {
    expect(nextStep({ ...COMPLETE, termsAcceptedAt: null })).toBe('terms');
    expect(nextStep({ ...COMPLETE, termsAcceptedAt: '' })).toBe('terms');
    expect(nextStep({ ...COMPLETE, termsAcceptedAt: 'not a date' })).toBe('terms');

    expect(nextStep({ ...COMPLETE, termsAcceptedAt: new Date() })).toBe('done');
    expect(nextStep({ ...COMPLETE, termsAcceptedAt: Date.now() })).toBe('done');
  });

  it('is finished for an account that already has everything', () => {
    expect(nextStep(COMPLETE)).toBe('done');
  });

  it('treats a missing isAnonymous as a real account', () => {
    // Not every path returns the field, and absent must not read as "guest" — that would put a
    // signed-in person back on the form they just completed.
    const { isAnonymous: _omitted, ...rest } = COMPLETE;
    expect(nextStep(rest)).toBe('done');
  });
});

describe('isProfileStep', () => {
  it('covers the steps the dots count, and nothing before them', () => {
    expect(isProfileStep('name')).toBe(true);
    expect(isProfileStep('terms')).toBe(true);

    expect(isProfileStep('account')).toBe(false);
    expect(isProfileStep('code')).toBe(false);
    expect(isProfileStep('done')).toBe(false);
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
