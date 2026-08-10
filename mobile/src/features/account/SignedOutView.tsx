import { useState } from 'react';

import { ForgotPasswordForm } from './ForgotPasswordForm';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

type Mode = 'signIn' | 'signUp' | 'forgot';

/**
 * The three signed-out forms, swapped by local state rather than navigation — the tab is a page in
 * the PagerView, so pushing routes here would fight the horizontal swipe.
 *
 * A guest sees the same forms. Signing in or up from here is what claims their progress: the
 * server moves it onto the real account (BACKEND_PLAN.md §5), so there is nothing extra to ask
 * them for and no separate screen to build. What changes is which form opens first — someone
 * already using the app has no account yet, by definition — and the banner explaining why it is
 * worth doing.
 */
export function SignedOutView({ guest = false }: { guest?: boolean }) {
  const [mode, setMode] = useState<Mode>(guest ? 'signUp' : 'signIn');

  if (mode === 'signUp') return <SignUpForm guest={guest} onSignIn={() => setMode('signIn')} />;
  if (mode === 'forgot') return <ForgotPasswordForm onSignIn={() => setMode('signIn')} />;

  return (
    <SignInForm
      guest={guest}
      onCreateAccount={() => setMode('signUp')}
      onForgotPassword={() => setMode('forgot')}
    />
  );
}
