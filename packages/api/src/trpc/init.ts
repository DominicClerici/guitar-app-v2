import { initTRPC, TRPCError } from '@trpc/server';

import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;

/**
 * Requires a Better Auth session and narrows `ctx.user` to non-null for everything downstream.
 *
 * The session cookie travels as a plain `Cookie` header: the Expo client keeps it in
 * expo-secure-store and attaches it to every tRPC request (BACKEND_PLAN.md §5).
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const result = await ctx.getSession();

  if (!result) throw new TRPCError({ code: 'UNAUTHORIZED' });

  return next({ ctx: { session: result.session, user: result.user } });
});
