import { useState } from 'react';

import { ForgotPasswordForm } from './ForgotPasswordForm';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

type Mode = 'signIn' | 'signUp' | 'forgot';

/**
 * The three signed-out forms, swapped by local state rather than navigation — the tab is a page in
 * the PagerView, so pushing routes here would fight the horizontal swipe.
 */
export function SignedOutView() {
  const [mode, setMode] = useState<Mode>('signIn');

  if (mode === 'signUp') return <SignUpForm onSignIn={() => setMode('signIn')} />;
  if (mode === 'forgot') return <ForgotPasswordForm onSignIn={() => setMode('signIn')} />;

  return (
    <SignInForm
      onCreateAccount={() => setMode('signUp')}
      onForgotPassword={() => setMode('forgot')}
    />
  );
}
