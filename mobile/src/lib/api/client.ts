import type { AppRouter } from '@guitar/api';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import Constants from 'expo-constants';

const WRANGLER_DEV_PORT = 8787;

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  // In dev, derive the host from Metro's own address so a physical device reaches the LAN machine
  // running `wrangler dev` rather than its own loopback. Simulators land on localhost either way.
  const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${metroHost ?? 'localhost'}:${WRANGLER_DEV_PORT}`;
}

export function createApiClient() {
  return createTRPCClient<AppRouter>({
    links: [httpBatchLink({ url: `${resolveBaseUrl()}/trpc` })],
  });
}
