import { Stack } from 'expo-router';

/**
 * The onboarding flow's own stack.
 *
 * Every way in pushes a full screen — the flow is never a sheet or a modal, so there is no
 * presentation to declare here or in the root layout. Inside, steps push over each other.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0c0d10' },
      }}
    />
  );
}
