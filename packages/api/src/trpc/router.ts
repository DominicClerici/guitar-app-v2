import { healthRouter } from '../routers/health';
import { router } from './init';

export const appRouter = router({
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
