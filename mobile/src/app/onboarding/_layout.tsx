import { Stack } from 'expo-router';

import { themeBackground } from '@/lib/theme';

/**
 * The onboarding flow's own stack.
 *
 * Every way in pushes a full screen — the flow is never a sheet or a modal, so there is no
 * presentation to declare here or in the root layout. Inside, steps push over each other.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      // A function so the page colour is read as each screen is built rather than once when this
      // renders — the same reason the root layout reads it that way (`app/_layout.tsx`).
      screenOptions={() => ({
        headerShown: false,
        contentStyle: { backgroundColor: themeBackground() },
      })}
    />
  );
}
