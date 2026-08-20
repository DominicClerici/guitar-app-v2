import type { AppRouter } from '@guitar/api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';

import { authClient } from '@/lib/auth';

import { resolveApiBaseUrl } from './baseUrl';

export function createApiClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${resolveApiBaseUrl()}/trpc`,
        // React Native has no cookie jar, so the session cookie the auth client keeps in secure
        // storage has to be attached by hand — this is what `protectedProcedure` reads
        // (BACKEND_PLAN.md §5). Read per request: signing in or out changes it in place, and the
        // read goes to the keychain, so it is awaited — a header function may return a promise.
        headers: async () => {
          const cookie = await authClient.getCookie();
          return cookie ? { cookie } : {};
        },
      }),
    ],
  });
}
