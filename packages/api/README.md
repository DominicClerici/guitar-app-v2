# @guitar/api

The Cloudflare Worker: Hono + tRPC v11 + Better Auth (`BACKEND_PLAN.md` §2, §4, §5).

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

| Route                   | Handler                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| `GET /health`           | Plain Hono route — no tRPC, no database, for uptime checks        |
| `ALL /trpc/*`           | tRPC fetch adapter, `appRouter`                                   |
| `GET\|POST /api/auth/*` | Better Auth's own handler — deliberately not behind tRPC (§4, §5) |

## Auth

Email + password is on. Sign-in works without a verified address; the verification mail still goes
out on sign-up, and with `RESEND_API_KEY` or `EMAIL_FROM` unset the link is logged to the console
instead, so the whole flow is exercisable locally with no Resend account.

Google and Apple appear only once their credentials are set, so a checkout with no OAuth apps still
boots. The anonymous plugin stays off unless `ENABLE_ANONYMOUS_AUTH=true`; even then its
`onLinkAccount` hook throws, because guest-to-real-account linking has to reassign and merge every
synced row and that is not built yet (§5, §11).

`SESSION_KV` is optional. Bound, it serves session reads and keeps them off Neon, which is the
free-tier limit expected to bind first (§12); unbound, reads fall through to Postgres. Sessions are
written to Postgres either way, so they survive KV eviction and stay revocable.

Still to come before the Expo app can sign in: the `@better-auth/expo` plugin on both sides, so the
app scheme's redirects and the secure-store cookie are handled.

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
