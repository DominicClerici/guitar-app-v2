import type { Arrival } from '@/features/curtain/moment';

import { isProfileStep, nextStep, type EntryStep, type OnboardingUser } from './steps';

/**
 * Where a finished sign-in leaves whoever ran it — asked of the account rather than of the button
 * that was pressed, so a code, Apple and Google all end in the same line.
 *
 * Two callers need this answer and they are on opposite sides of a route: the flow, when a sign-in
 * completes on its first step, and the settings tab, when one completes with no flow open at all.
 * Neither of them can be the one that knows, because what happens next is a fact about the account
 * and nothing else — which is the same reason `nextStep` exists. Stated once here so the two cannot
 * come to different conclusions about the same user.
 */
export type Landing =
  /** Somewhere to be: a step still owed, or the form again where the sign-in did not take. */
  | { step: EntryStep; greeting?: undefined }
  /** Nothing left to ask, and so somebody arriving rather than somebody continuing. */
  | { step: 'done'; greeting: Arrival };

export function landingFor(user: unknown): Landing {
  const step = nextStep(user as OnboardingUser | null | undefined);

  // Nothing is signed in that was not signed in before — no account came back, or the one that did
  // is still the guest. There is nothing to collect and nobody to greet, so this is the form again.
  if (step === 'account') return { step: 'account' };

  // What is left is the profile steps and `done`: an account is never *missing* a code, so it is
  // not something `nextStep` can answer with and not something a sign-in can land on.
  if (isProfileStep(step)) return { step };

  // Nothing left to ask means an account that was already finished before this sign-in, which is
  // the one case that is a return rather than a beginning. A sign-in that lands on a step still
  // owed is welcomed at the end of that step instead — it is not back yet.
  const named = user as { name?: unknown } | null | undefined;

  return {
    step: 'done',
    greeting: { kind: 'returning', name: typeof named?.name === 'string' ? named.name : '' },
  };
}
