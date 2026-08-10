import { addNetworkStateListener } from 'expo-network';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { authClient, useSession } from './client';

/**
 * Guest accounts (BACKEND_PLAN.md §5).
 *
 * The app is fully usable before anyone commits to an account, and everything that gets saved is
 * keyed by `user_id`, so a user row has to exist before the first thing worth saving happens. That
 * is what this creates: a real row on the server, reached with no sign-in, which the user can later
 * claim by signing in with Apple, Google, or an email address — the server moves the rows over.
 *
 * Nothing is shown while it happens. A failure leaves the app signed out, which is a state it
 * already handles: the Account tab shows the sign-in forms, and the attempt is repeated below.
 */

/**
 * Module scope rather than a ref, because it guards a single global thing — there is one session,
 * and two overlapping calls would create two guest accounts and strand the first.
 */
let creating = false;

async function createGuest(): Promise<void> {
  if (creating) return;
  creating = true;

  // Better Auth returns failures rather than throwing, and there is no one to show them to: this
  // runs at launch with no screen of its own. The listeners below are the recovery.
  await authClient.signIn.anonymous();

  creating = false;
}

/**
 * Creates the guest account whenever the app finds itself with no session at all. Mounted once, at
 * the root.
 *
 * Both retries exist because the first attempt happens at launch, which is exactly when a device
 * is most likely to have no usable connection — the app opens instantly offline by design (§6), so
 * "launched" and "online" are not the same moment. Coming back to the foreground catches the
 * everyday case; the network listener catches an app left open on a phone that has just regained
 * signal.
 */
export function useEnsureGuestSession(): void {
  const { data: session, isPending } = useSession();
  const missing = !isPending && !session;

  useEffect(() => {
    if (!missing) return;

    void createGuest();

    const foreground = AppState.addEventListener('change', (state) => {
      if (state === 'active') void createGuest();
    });

    const network = addNetworkStateListener(({ isConnected }) => {
      if (isConnected) void createGuest();
    });

    return () => {
      foreground.remove();
      network.remove();
    };
  }, [missing]);
}
