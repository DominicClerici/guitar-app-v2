import { resetPasswordInput } from '@guitar/shared';
import { useState } from 'react';
import { Text } from 'react-native';

import { AuthButton } from '@/components/AuthButton';
import { AuthTextField } from '@/components/AuthTextField';
import { authClient, describeAuthError } from '@/lib/auth';
import { fieldErrors } from '@/lib/forms';

import { AuthShell, FormError } from './AuthShell';

interface Props {
  /** From the deep link. Absent when the Worker rejected the token before redirecting. */
  token: string | null;
  onDone: () => void;
}

export function ResetPasswordForm({ token, onDone }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const parsed = resetPasswordInput.safeParse({ token, newPassword });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setFailure(null);
    setPending(true);

    const { error } = await authClient.resetPassword(parsed.data);

    setPending(false);
    if (error) {
      setFailure(describeAuthError(error));
      return;
    }

    setDone(true);
  };

  if (!token) {
    return (
      <AuthShell
        title="Link expired"
        blurb="Reset links can only be used once, and they stop working after an hour. Ask for a new one from the Account tab."
      >
        <AuthButton label="Back to the app" onPress={onDone} />
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        title="Password changed"
        blurb="Sign in with your new password. Anywhere else you were signed in stays signed in."
      >
        <AuthButton label="Back to the app" onPress={onDone} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" blurb="This replaces the password on your account.">
      <FormError message={failure} />

      <AuthTextField
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        error={errors.newPassword}
        secure
        autoFocus
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <AuthButton label="Set new password" onPress={submit} pending={pending} />

      <Text className="text-center text-[12px] leading-[17px] text-ink-faint">
        Sessions on other devices are left signed in.
      </Text>
    </AuthShell>
  );
}
