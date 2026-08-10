import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ResetPasswordForm } from '@/features/account';

/**
 * Landing point for the reset link in the password-reset email.
 *
 * The link goes to the Worker first, which checks the token and redirects here with either
 * `?token=…` or `?error=INVALID_TOKEN` — so an expired link never reaches a password field.
 */
export default function ResetPasswordRoute() {
  const { token } = useLocalSearchParams<{ token?: string; error?: string }>();

  return (
    <View className="flex-1 bg-bg">
      <ResetPasswordForm
        token={token ?? null}
        onDone={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />
    </View>
  );
}
