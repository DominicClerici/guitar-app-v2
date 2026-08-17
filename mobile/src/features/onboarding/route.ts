import type { useRouter } from 'expo-router';

type Router = ReturnType<typeof useRouter>;

/** The flow's entry point. Every screen after it pushes inside `app/onboarding/`. */
export const ONBOARDING_ROUTE = '/onboarding' as const;

/**
 * Enter the onboarding flow.
 *
 * A function rather than a bare route string because there is already more than one way in — the
 * Account tab and the home-screen sheet — and a third is likely. Whatever entering has to mean
 * later (a first-run variant, an analytics mark) it means in one place.
 */
export function startOnboarding(router: Router) {
  router.push(ONBOARDING_ROUTE);
}
