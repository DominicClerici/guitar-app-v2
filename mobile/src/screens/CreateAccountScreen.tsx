import { OnboardingFlow } from '@/features/onboarding';

/**
 * The onboarding modal, which is one route for the whole flow.
 *
 * Its steps are state rather than screens (see `OnboardingFlow`), so there is nothing to route
 * between and this stays the thin boundary between the router and the feature.
 */
export function CreateAccountScreen() {
  return <OnboardingFlow />;
}
