# @guitar/api

The Cloudflare Worker: Hono + tRPC v11, with Better Auth to follow (`BACKEND_PLAN.md` §2, §4, §5).

## Running it

```bash
cp .dev.vars.example .dev.vars   # fill in what you have; health works with none of it
pnpm dev                         # wrangler dev on http://localhost:8787
```

```bash
curl http://localhost:8787/health
curl http://localhost:8787/trpc/health.ping
```

`pnpm test` runs the integration tests inside the real workerd runtime via
`@cloudflare/vitest-pool-workers`.

## Routes

| Route             | Handler                                                    |
| ----------------- | ---------------------------------------------------------- |
| `GET /health`     | Plain Hono route — no tRPC, no database, for uptime checks |
| `ALL /trpc/*`     | tRPC fetch adapter, `appRouter`                            |
| `ALL /api/auth/*` | Better Auth — not yet mounted                              |

## Type export

`package.json` resolves `@guitar/api` to `src/public.ts`, which exports nothing but the `AppRouter`
type. Clients `import type { AppRouter } from '@guitar/api'` and the import is erased at compile
time, so no server code can end up in the app bundle. The Worker entry is `@guitar/api/worker`, and
`wrangler.jsonc` points at `src/index.ts` by path.

One consequence worth knowing: everything reachable from `AppRouter` is type-checked by the Expo and
Next.js TypeScript programs too, since packages export TS source with no build step. That is why
`src/env.ts` imports `KVNamespace` explicitly from `@cloudflare/workers-types` instead of relying on
the ambient globals — a consumer that doesn't load those globals still resolves it.

## Runtime constraints

Workers is not Node: no native modules, no background processes, no raw TCP, no WebSockets without
Durable Objects. Postgres is reached over Neon's HTTP driver. Migrations run from Node
(`packages/db`), never from here. Anything cron-shaped becomes a Cloudflare Cron Trigger.

Keep Workers-specific code in `src/index.ts` and `src/env.ts`. Hono, the tRPC routers, and the
Drizzle queries stay runtime-agnostic, so swapping to Node/Bun/Deno later means replacing the
entrypoint rather than the application.

## Deploying

Not wired up yet — needs a Cloudflare account. When it is:

```bash
wrangler kv namespace create SESSION_KV          # then uncomment kv_namespaces in wrangler.jsonc
wrangler secret put DATABASE_URL --env staging   # repeat per secret, per environment
pnpm deploy:staging
```
