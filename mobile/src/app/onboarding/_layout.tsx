import { Stack } from 'expo-router';

/**
 * The onboarding flow's own stack.
 *
 * The modal presentation belongs to the root layout, which is where this group is a screen —
 * declaring it here would make each step modal over the last instead. Inside, steps push.
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
