import { useLocalSearchParams } from 'expo-router';

import { OnboardingFlow, parseMode } from '@/features/onboarding';

/**
 * The onboarding screen, which is one route for the whole flow.
 *
 * Its steps are state rather than screens (see `OnboardingFlow`), so there is nothing to route
 * between and this stays the thin boundary between the router and the feature. Signing back in is
 * the same screen under another name and is reached the same way — `?mode=login` — for the same
 * reason: the two framings differ in wording, not in what they do.
 */
export function CreateAccountScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  return <OnboardingFlow opened={parseMode(mode)} />;
}
