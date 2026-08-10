import { requestPasswordResetInput } from '@guitar/shared';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AuthButton } from '@/components/AuthButton';
import { AuthTextField } from '@/components/AuthTextField';
import { authClient, describeAuthError, RESET_PASSWORD_LINK } from '@/lib/auth';
import { fieldErrors } from '@/lib/forms';

import { AuthShell, AuthSwitch, FormError } from './AuthShell';

export function ForgotPasswordForm({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const parsed = requestPasswordResetInput.safeParse({ email });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setFailure(null);
    setPending(true);

    const { error } = await authClient.requestPasswordReset({
      email: parsed.data.email,
      redirectTo: RESET_PASSWORD_LINK,
    });

    setPending(false);
    if (error) {
      setFailure(describeAuthError(error));
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        // The server answers the same way whether or not the address exists, so this cannot promise
        // an email is on its way — saying so would tell a stranger which addresses have accounts.
        blurb={`If an account exists for ${email.trim()}, a reset link is on its way. Open it on this device and it will bring you back here.`}
      >
        <View className="items-center">
          <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
            Link expires in one hour
          </Text>
        </View>

        <AuthButton label="Back to sign in" variant="quiet" onPress={onSignIn} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      blurb="Enter the address you signed up with and we’ll send you a link."
    >
      <FormError message={failure} />

      <AuthTextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <AuthButton label="Send reset link" onPress={submit} pending={pending} />

      <AuthSwitch prompt="Remembered it?" action="Sign in" onPress={onSignIn} />
    </AuthShell>
  );
}
