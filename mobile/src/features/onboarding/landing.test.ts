import { describe, expect, it } from 'vitest';

import { landingFor } from './landing';

/** An account that owes nothing — the one case a sign-in ends rather than continues. */
const COMPLETE = {
  name: 'Ada Lovelace',
  isAnonymous: false,
  skillLevel: 'beginner',
  goals: ['learn_chords'],
  termsAcceptedAt: '2026-08-17T10:00:00.000Z',
};

describe('landingFor', () => {
  it('greets an account that has nothing left to answer', () => {
    expect(landingFor(COMPLETE)).toEqual({
      step: 'done',
      greeting: { kind: 'returning', name: 'Ada Lovelace' },
    });
  });

  it('asks for a name it cannot use rather than greeting nobody', () => {
    // Which is why the greeting's empty-name case is a fallback and not a path: an account with
    // nothing usable to be called is an account that still owes the name step.
    expect(landingFor({ ...COMPLETE, name: undefined })).toEqual({ step: 'name' });
    expect(landingFor({ ...COMPLETE, name: '  ' })).toEqual({ step: 'name' });
  });

  it('hands over the first step still owed, with nothing to say', () => {
    // A provider never writes `user.name`, so this is what almost every social sign-in answers.
    expect(landingFor({ ...COMPLETE, name: '' })).toEqual({ step: 'name', greeting: undefined });
    expect(landingFor({ ...COMPLETE, termsAcceptedAt: null })).toEqual({
      step: 'terms',
      greeting: undefined,
    });
  });

  it('is not a welcome for someone who has yet to finish, however many times they have signed in', () => {
    // The greeting marks the moment an account became complete, not the act of signing in — the
    // last step of the flow plays it instead.
    expect(landingFor({ ...COMPLETE, goals: null }).greeting).toBeUndefined();
  });

  it('comes back to the form when nothing was signed in', () => {
    expect(landingFor(null)).toEqual({ step: 'account' });
    expect(landingFor({ name: 'Guest', isAnonymous: true })).toEqual({ step: 'account' });
  });
});
