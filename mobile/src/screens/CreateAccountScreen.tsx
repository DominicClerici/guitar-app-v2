import { useLocalSearchParams } from 'expo-router';

import { OnboardingFlow, parseEntryStep, parseMode } from '@/features/onboarding';

/**
 * The onboarding screen, which is one route for the whole flow.
 *
 * Its steps are state rather than screens (see `OnboardingFlow`), so there is nothing to route
 * between and this stays the thin boundary between the router and the feature. Signing back in is
 * the same screen under another name and is reached the same way — `?mode=login` — for the same
 * reason: the two framings differ in wording, not in what they do.
 *
 * `?at=` is the other way in, and the params are how it has to travel: a sign-in that finished on
 * the account screen is a fact from before this route existed, and the only thing that crosses a
 * push intact is what was pushed with it.
 */
export function CreateAccountScreen() {
  const { mode, at, failed } = useLocalSearchParams<{
    mode?: string;
    at?: string;
    failed?: string;
  }>();

  return (
    <OnboardingFlow
      opened={parseMode(mode)}
      handed={parseEntryStep(at)}
      failed={typeof failed === 'string' && failed ? failed : null}
    />
  );
}
