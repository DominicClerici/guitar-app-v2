/**
 * Which step the flow belongs on, read off the account rather than counted.
 *
 * There is no "onboarding finished" flag anywhere. A step is owed because the thing it collects is
 * missing, so the answer is derived from the session's user every time it is asked. That is what
 * makes the three cases one case: someone who has just created an account is missing everything,
 * someone signing in again is missing nothing and never sees the flow, and someone who quit
 * halfway comes back to the first thing they still owe.
 *
 * Adding a step is therefore a field to check here and a screen to render — nothing has to be
 * migrated, and nothing can disagree about where a half-finished account got to.
 */

/**
 * `code` is the exception: it is not derivable from the account, because waiting for a code is
 * something the flow is doing rather than something the user is missing. It is set by the flow
 * when a code goes out and left again when one comes back.
 */
export type OnboardingStep = 'account' | 'code' | 'name' | 'done';

/**
 * The parts of the session user this reads, kept structural so the module stays pure — it must not
 * reach a native import, and it is the only place the flow's shape is pinned down by tests.
 */
export interface OnboardingUser {
  name?: string | null;
  isAnonymous?: boolean | null;
  /** JSON from the server, so it is whatever the column held; narrowed on the way out. */
  oauthProfile?: unknown;
}

function filled(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function nextStep(user: OnboardingUser | null | undefined): OnboardingStep {
  // A guest is signed in but has claimed nothing, which is exactly the state the account step
  // exists for. Absent is treated as a real account: not every response carries the field, and
  // reading absent as "guest" would send a signed-in person back to the start.
  if (!user || user.isAnonymous === true) return 'account';

  if (!filled(user.name)) return 'name';

  return 'done';
}

/**
 * What to put in the name field before anyone types. Apple and Google supply a name and the server
 * files it under `oauthProfile` rather than in `user.name` — so the step is still asked for, and
 * the provider's answer is the suggestion rather than the decision.
 */
export function suggestedName(user: OnboardingUser | null | undefined): string {
  const profile = user?.oauthProfile;
  if (typeof profile !== 'object' || profile === null) return '';

  const name = (profile as { name?: unknown }).name;
  return typeof name === 'string' && filled(name) ? name.trim() : '';
}
