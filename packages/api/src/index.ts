import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { type Env, trustedOrigins } from './env';
import { createContext } from './trpc/context';
import { appRouter } from './trpc/router';

const app = new Hono<{ Bindings: Env }>();

app.use('*', (c, next) =>
  cors({
    origin: (origin) => (trustedOrigins(c.env).includes(origin) ? origin : null),
    credentials: true,
  })(c, next),
);

app.get('/health', (c) =>
  c.json({ ok: true, service: 'guitar-api', time: new Date().toISOString() }),
);

// Better Auth mounts at /api/auth/* here — it handles its own routes rather than going
// through tRPC (BACKEND_PLAN.md §4, §5).

app.all('/trpc/*', (c) =>
  fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: () => createContext({ env: c.env, req: c.req.raw }),
  }),
);

export default app;
