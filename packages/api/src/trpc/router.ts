import { healthRouter } from '../routers/health';
import { syncRouter } from '../routers/sync';
import { router } from './init';

export const appRouter = router({
  health: healthRouter,
  sync: syncRouter,
});

export type AppRouter = typeof appRouter;
