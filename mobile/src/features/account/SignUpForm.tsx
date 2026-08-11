import { signUpInput } from '@guitar/shared';
import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { AuthTextField } from '@/components/AuthTextField';
import { Button } from '@/components/Button';
import { authClient, describeAuthError } from '@/lib/auth';
import { fieldErrors } from '@/lib/forms';

import { AuthShell, AuthSwitch, FormError } from './AuthShell';
import { GuestBanner } from './GuestBanner';

export function SignUpForm({ onSignIn, guest }: { onSignIn: () => void; guest?: boolean }) {
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    const parsed = signUpInput.safeParse({ name, email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setFailure(null);
    setPending(true);

    // Signing up also signs in — the verification mail goes out, but an unverified address can
    // still use the app (see `requireEmailVerification` in packages/api/src/auth.ts).
    const { error } = await authClient.signUp.email(parsed.data);

    setPending(false);
    if (error) setFailure(describeAuthError(error));
  };

  return (
    <AuthShell
      title="Create an account"
      blurb="We’ll send a link to confirm your email. You can start using the app straight away."
    >
      {guest ? <GuestBanner /> : null}

      <FormError message={failure} />

      <AuthTextField
        label="Name"
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <AuthTextField
        ref={emailRef}
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
        Create account
      </Button>

      <AuthSwitch prompt="Already have an account?" action="Sign in" onPress={onSignIn} />
    </AuthShell>
  );
}
