import type { useRouter } from 'expo-router';

import type { OnboardingMode } from './mode';
import type { EntryStep } from './steps';

type Router = ReturnType<typeof useRouter>;

/** The flow's entry point. Every screen after it pushes inside `app/onboarding/`. */
export const ONBOARDING_ROUTE = '/onboarding' as const;

/**
 * Enter the onboarding flow, always as a pushed full screen.
 *
 * A function rather than a bare route string because there is already more than one way in — the
 * Account tab and the home-screen avatar — and a third is likely. Whatever entering has to mean
 * later (a first-run variant, an analytics mark) it means in one place, and no caller gets to
 * present the flow some other way.
 *
 * The mode is which of the two things the flow opens as saying it is. One route rather than two,
 * because signing up and signing back in are the same screen doing the same work — see `mode.ts`.
 * It is what the flow *opens* on, not where it stays: the link in the corner changes framing
 * without touching the stack, so this is never navigated to a second time to switch.
 */
export function startOnboarding(router: Router, mode: OnboardingMode = 'create') {
  router.push({ pathname: ONBOARDING_ROUTE, params: { mode } });
}

/** What a sign-in run outside the flow hands it: where it got to, and what it has to say there. */
export interface HandOff {
  at: EntryStep;
  /** A provider that failed rather than one that was answered. Shown on the step handed over. */
  failed?: string;
}

/**
 * The other way in: not opened, but handed over to.
 *
 * A provider pressed on the settings tab signs in from there, so by the time this is called the
 * account already exists and the only question left is which of its steps is still owed. That
 * arrives as a param rather than being re-derived here, because the session store has not
 * necessarily caught up with the sign-in that just happened and a flow that re-asked it would open
 * on the form the person has already finished with.
 *
 * It is a hand-off in the literal sense: a cover is up over the settings tab when this is called
 * and is still up when the flow mounts, which is what makes the two screens one movement. The route
 * appears rather than travels (see the root layout) and the flow takes the cover away itself.
 */
export function handOffToOnboarding(router: Router, handed: HandOff) {
  router.push({
    pathname: ONBOARDING_ROUTE,
    params: { at: handed.at, ...(handed.failed ? { failed: handed.failed } : {}) },
  });
}
