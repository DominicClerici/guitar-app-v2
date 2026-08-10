/**
 * What drives the content cache (BACKEND_PLAN.md §6, §8).
 *
 * Renders nothing and blocks nothing. The catalogue and the current chapters refresh in the
 * background; every screen reads whatever is already on the device, so a refresh that fails or
 * never runs costs nothing but freshness.
 *
 * Triggers mirror `SyncProvider`, for the same reason it gives: launch is exactly when a device is
 * least likely to have a usable connection, so "opened the app" and "can reach the server" are
 * different moments and both have to count.
 */
import { addNetworkStateListener } from 'expo-network';
import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { useTRPCClient } from '@/lib/api';
import { useDatabaseMigrations } from '@/lib/db';

import { refreshArticles, refreshIndex, setContentClient } from './manager';

export function ContentProvider({ children }: { children: ReactNode }) {
  const { ready } = useDatabaseMigrations();
  const client = useTRPCClient();

  useEffect(() => {
    // No tables means nowhere to cache into. Unlike sync, this needs no session: content is public
    // and a signed-out reader should still get the catalogue.
    if (!ready) {
      setContentClient(null);
      return;
    }

    setContentClient(client);

    const refresh = () => {
      // Failure is the ordinary case here — being offline — and there is no screen to report it to.
      // Whatever is cached still renders, and the next trigger tries again.
      void refreshIndex().catch(() => undefined);
      void refreshArticles().catch(() => undefined);
    };

    refresh();

    const foreground = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    const network = addNetworkStateListener(({ isConnected }) => {
      if (isConnected) refresh();
    });

    return () => {
      foreground.remove();
      network.remove();
      setContentClient(null);
    };
  }, [client, ready]);

  return children;
}
