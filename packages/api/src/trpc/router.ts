import { contentRouter } from '../routers/content';
import { healthRouter } from '../routers/health';
import { syncRouter } from '../routers/sync';
import { router } from './init';

export const appRouter = router({
  content: contentRouter,
  health: healthRouter,
  sync: syncRouter,
});

export type AppRouter = typeof appRouter;
