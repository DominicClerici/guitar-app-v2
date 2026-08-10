# @guitar/api

The Cloudflare Worker: Hono + tRPC v11 + Better Auth (`BACKEND_PLAN.md` §2, §4, §5).

## Running it

```bash
pnpm db db:up                    # local Postgres + Neon HTTP proxy (see packages/db)
cp .dev.vars.example .dev.vars   # generate BETTER_AUTH_SECRET; the rest is optional
pnpm dev                         # wrangler dev on http://localhost:8788
```

`/health` and `/trpc/*` work with no database. Anything under `/api/auth/*` builds a client first,
so it 500s until `DATABASE_URL` is reachable and migrated.

```bash
curl http://localhost:8788/health
curl http://localhost:8788/trpc/health.ping

# Sign up. The verification link is printed to the wrangler console when Resend is unconfigured.
curl -X POST http://localhost:8788/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"dev@example.com","password":"password123","name":"Dev"}' \
  -c /tmp/guitar-cookies.txt

curl http://localhost:8788/api/auth/get-session -b /tmp/guitar-cookies.txt
```

Port 8788, not Wrangler's default 8787: macOS's Photos daemon listens there and wins `localhost`
over workerd, so the worker appears to run while photod answers every request.

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
boots.

Guest accounts are on (§5). The app signs in anonymously at launch, so a user row exists before
anything worth saving happens, and every synced row can be keyed by `user_id` from the start. When
that guest later signs in for real, `onLinkAccount` moves their rows onto the real account with
`src/link-anonymous.ts`, merging under each table's rule from §7 — so an account that already
carries data from another device gains the guest's rows rather than being overwritten by them.
`ENABLE_ANONYMOUS_AUTH` in `wrangler.jsonc` is the kill switch: set it to `"false"` and no new
guests are created, with no deploy of the app. It is not a secret and must not be put in
`.dev.vars`, which would override it.

`SESSION_KV` is optional. Bound, it serves session reads and keeps them off Neon, which is the
free-tier limit expected to bind first (§12); unbound, reads fall through to Postgres. Sessions are
written to Postgres either way, so they survive KV eviction and stay revocable.

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
