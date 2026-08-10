import { healthResult } from '@guitar/shared';

import { publicProcedure, router } from '../trpc/init';

export const healthRouter = router({
  ping: publicProcedure.output(healthResult).query(() => ({
    ok: true as const,
    service: 'guitar-api',
    time: new Date().toISOString(),
  })),
});
