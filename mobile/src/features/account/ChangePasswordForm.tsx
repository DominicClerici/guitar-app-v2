import { changePasswordInput } from '@guitar/shared';
import { useRef, useState } from 'react';
import { View, type TextInput } from 'react-native';

import { AuthTextField } from '@/components/AuthTextField';
import { Button } from '@/components/Button';
import { authClient, describeAuthError } from '@/lib/auth';
import { fieldErrors } from '@/lib/forms';

import { FormError } from './AuthShell';

interface Props {
  onDone: (message: string) => void;
  onCancel: () => void;
}

export function ChangePasswordForm({ onDone, onCancel }: Props) {
  const newPasswordRef = useRef<TextInput>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    const parsed = changePasswordInput.safeParse({ currentPassword, newPassword });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setFailure(null);
    setPending(true);

    const { error } = await authClient.changePassword({
      ...parsed.data,
      // Whoever changes a password may be doing it because another device should no longer have
      // access, so the other sessions go with it.
      revokeOtherSessions: true,
    });

    setPending(false);
    if (error) {
      setFailure(describeAuthError(error));
      return;
    }

    onDone('Password changed. Other devices have been signed out.');
  };

  return (
    <View className="gap-[14px]">
      <FormError message={failure} />

      <AuthTextField
        label="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        error={errors.currentPassword}
        secure
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => newPasswordRef.current?.focus()}
      />

      <AuthTextField
        ref={newPasswordRef}
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        error={errors.newPassword}
        secure
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <Button
        variant="soft"
        size="md"
        radius={11}
        className="w-full"
        pending={pending}
        onPress={submit}
      >
        Change password
      </Button>
      <Button
        variant="quiet"
        size="md"
        radius={11}
        className="w-full"
        disabled={pending}
        onPress={onCancel}
      >
        Cancel
      </Button>
    </View>
  );
}
