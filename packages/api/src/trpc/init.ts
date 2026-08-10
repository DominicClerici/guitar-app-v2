import { initTRPC } from '@trpc/server';

import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

// `protectedProcedure` arrives with Better Auth — it will assert a session on the context
// and narrow `ctx.session` to non-null for downstream procedures.
