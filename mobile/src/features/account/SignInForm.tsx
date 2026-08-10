import { signInInput } from '@guitar/shared';
import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { AuthButton } from '@/components/AuthButton';
import { AuthTextField } from '@/components/AuthTextField';
import { authClient, describeAuthError } from '@/lib/auth';
import { fieldErrors } from '@/lib/forms';

import { AuthShell, AuthSwitch, FormError } from './AuthShell';
import { GuestBanner } from './GuestBanner';

interface Props {
  onCreateAccount: () => void;
  onForgotPassword: () => void;
  guest?: boolean;
}

export function SignInForm({ onCreateAccount, onForgotPassword, guest }: Props) {
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    const parsed = signInInput.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setFailure(null);
    setPending(true);

    const { error } = await authClient.signIn.email(parsed.data);

    setPending(false);
    // On success there is nothing to do: the session store updates and AccountTab swaps the view
    // out from under this component.
    if (error) setFailure(describeAuthError(error));
  };

  return (
    <AuthShell
      title="Sign in"
      blurb="Your practice history and settings follow you between devices."
    >
      {guest ? <GuestBanner /> : null}

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
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <AuthTextField
        ref={passwordRef}
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secure
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      <AuthButton label="Sign in" onPress={submit} pending={pending} />

      <AuthSwitch prompt="Forgot your password?" action="Reset it" onPress={onForgotPassword} />
      <AuthSwitch prompt="No account yet?" action="Create one" onPress={onCreateAccount} />
    </AuthShell>
  );
}
