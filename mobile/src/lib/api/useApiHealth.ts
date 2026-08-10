import { useQuery } from '@tanstack/react-query';

import { useTRPC } from './trpc';

/**
 * Round-trips `health.ping` against the Worker. Nothing in the UI uses it yet — it exists so the
 * client wiring can be exercised from any screen with a single call while the real procedures are
 * still being built.
 */
export function useApiHealth() {
  const trpc = useTRPC();
  return useQuery(trpc.health.ping.queryOptions());
}
