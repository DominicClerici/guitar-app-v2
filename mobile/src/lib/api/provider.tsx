import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useSession } from '@/lib/auth';

import { createApiClient } from './client';
import { TRPCProvider } from './trpc';

export function ApiProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => createApiClient());

  useResetCacheOnUserChange(queryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}

/**
 * Everything cached was fetched as whoever was signed in at the time, so it has to go when that
 * changes — otherwise signing out leaves the previous account's data on screen, and signing in on
 * a shared device shows it to the next person.
 */
function useResetCacheOnUserChange(queryClient: QueryClient) {
  const { data: session } = useSession();
  const userId = session?.user.id ?? null;
  const previous = useRef(userId);

  useEffect(() => {
    if (previous.current === userId) return;
    previous.current = userId;
    queryClient.clear();
  }, [queryClient, userId]);
}
