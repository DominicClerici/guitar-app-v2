/**
 * What drives the sync loop (BACKEND_PLAN.md §6).
 *
 * Renders nothing of its own and blocks nothing. The app is usable before the local schema exists,
 * before a session exists, and while the device is offline — this only decides *when* the engine
 * gets a turn.
 *
 * The triggers mirror `useEnsureGuestSession`, for the same reason: launch is exactly when a device
 * is least likely to have a usable connection, so "opened the app" and "can reach the server" are
 * different moments and both have to count.
 */
import { addNetworkStateListener } from 'expo-network';
import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useTRPCClient } from '@/lib/api';
import { useSession } from '@/lib/auth';
import { useDatabaseMigrations } from '@/lib/db';

import { adoptUser } from './adopt';
import { requestSync, setSyncTarget } from './engine';

export function SyncProvider({ children }: { children: ReactNode }) {
  const { ready } = useDatabaseMigrations();
  const { data: session } = useSession();
  const client = useTRPCClient();

  const userId = session?.user.id ?? null;
  const isAnonymous = session?.user.isAnonymous ?? false;

  useEffect(() => {
    // No tables or no account means nothing to sync — and signing out deliberately leaves the
    // local rows alone, so signing back in on the same device costs nothing.
    if (!ready || !userId) {
      setSyncTarget(null);
      return;
    }

    setSyncTarget({ client, userId });

    // Rows move before anything is sent, so the push that follows sends them under the id that now
    // owns them. Whether they move at all depends on who held them before — see `adoptUser`.
    adoptUser({ userId, isAnonymous });
    requestSync(0);

    const foreground = AppState.addEventListener('change', (state) => {
      if (state === 'active') requestSync(0);
    });

    const network = addNetworkStateListener(({ isConnected }) => {
      if (isConnected) requestSync(0);
    });

    return () => {
      foreground.remove();
      network.remove();
      setSyncTarget(null);
    };
  }, [client, isAnonymous, ready, userId]);

  return children;
}
