import type { useRouter } from 'expo-router';

import type { OnboardingMode } from './mode';

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
