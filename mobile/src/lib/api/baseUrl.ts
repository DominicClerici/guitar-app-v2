import Constants from 'expo-constants';

const WRANGLER_DEV_PORT = 8788;

/**
 * Where the Worker lives. Shared by the tRPC client and the auth client — pointing them at
 * different hosts would put the session cookie on one origin and the requests that need it on
 * another, which fails as a silent 401 rather than a connection error.
 */
export function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  // In dev, derive the host from Metro's own address so a physical device reaches the LAN machine
  // running `wrangler dev` rather than its own loopback. Simulators land on localhost either way.
  const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${metroHost ?? 'localhost'}:${WRANGLER_DEV_PORT}`;
}
