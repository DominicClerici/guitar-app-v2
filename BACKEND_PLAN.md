# Backend Plan

Decisions made 2026-08-10. This document captures **what we chose and why**. No code has been
written yet; implementation happens in later sessions.

## Goals

- User accounts and a database backing an (unbuilt) learning system, the ear trainer, and preferences.
- End-to-end typesafety across three projects: API → Expo mobile, API → future Next.js web.
- Minimise cost. Start on free tiers, keep every choice portable enough to migrate under traction.
- Don't sacrifice perceived performance — no cold-start-on-open, no sleeping instances.

## Decisions at a glance

| Area | Choice |
| --- | --- |
| Architecture | Standalone API service; both clients call it over HTTP |
| Runtime / host | Cloudflare Workers |
| Server framework | Hono |
| Database | Neon Postgres |
| ORM / migrations | Drizzle + drizzle-kit |
| API layer | tRPC v11 + TanStack Query |
| Auth | Better Auth, self-hosted, on our own Postgres |
| Sign-in methods | Sign in with Apple, Google, email + password, anonymous guest |
| Client/server state | Offline-first; on-device SQLite is the source of truth |
| Sync | Hand-rolled push/pull over tRPC |
| Transactional email | Resend |

---

## 1. Architecture: standalone API service

A dedicated API app in the monorepo. Expo and the future Next.js app are both pure clients of it.

**Why:** one source of truth for business logic, no coupling between the mobile API and the web
app's deploy cycle, and freedom to move the API host without touching the web app.

**Rejected:**

- _Next.js as the backend_ — fewest moving parts, but it ties the mobile API's availability and
  deploy cadence to the web app, and to Vercel's pricing model.
- _BaaS-first (Supabase)_ — fastest to a working product, but heavy lock-in, and free-tier projects
  pause after ~1 week of inactivity.
- _AWS Lambda_ — the `lambda-backend` entry already sitting in `pnpm-workspace.yaml`. Cheapest at
  very low volume and scales furthest, but the most IaC and cold-start work for no near-term gain.
  **This workspace entry should be removed.**

## 2. Runtime: Cloudflare Workers

**Why:** $0 up to 100k requests/day, no cold starts ever, global edge. The API is small, stateless
CRUD — exactly what Workers are good at.

**What we give up:** the Workers runtime is not Node. No native modules, no long-running or
background processes, no raw TCP, no WebSockets without Durable Objects. Postgres must be reached
over an HTTP/serverless driver.

**Consequences to design around:**

- Postgres access goes through Neon's serverless driver, not `pg`.
- Anything that wants to be a cron or background job becomes a Cloudflare Cron Trigger, which is
  still just a Worker invocation with a time budget.
- Migrations are **not** run from the Worker. They run from a local/CI Node process.

**Rejected:** Node container on Fly/Railway (~$0–3/mo, fully portable, but cold start after idle and
a Dockerfile to maintain); Vercel Functions (hobby tier forbids commercial use); Render/Railway free
tiers (instances sleep, 30–60s wake — unacceptable for an app opened once a day).

**Migration path:** if we ever genuinely need Node, the escape hatch is replacing the server
entrypoint, not the application code. Hono runs unchanged on Node, Bun, and Deno; tRPC routers and
Drizzle queries are runtime-agnostic. Keep Workers-specific code confined to the entrypoint and a
thin env/bindings module.

## 3. Database: Neon Postgres

**Why:** serverless Postgres that scales to zero, an HTTP driver designed for edge runtimes, first-class
Drizzle support, and database branching for preview environments.

**Driver constraint — important.** Drizzle's `neon-http` driver does **not** support interactive
transactions (`db.transaction(async (tx) => ...)`), because each statement is a separate HTTP request.
Two ways out, and we take the first:

1. **Design writes to not need interactive transactions.** Group operations by table and issue one
   bulk `INSERT ... ON CONFLICT DO UPDATE` per table, submitted together via Neon's array-form
   transaction. This is sufficient for the sync protocol below and keeps latency low.
2. Fall back to `neon-serverless` (WebSocket `Pool`), which does support full transactions on Workers,
   for any future operation that truly needs read-then-write atomicity.

**Environments:** a Neon branch per environment (production, staging, and ephemeral preview branches).
Branches are copy-on-write and cheap.

**Migrations:** `drizzle-kit generate` produces SQL files that are committed to git. They are applied
by a `pnpm db:migrate` script running in Node (locally or in CI), never from the Worker.

## 4. API layer: tRPC v11 + TanStack Query

Procedures are defined on the server; clients import the **router type only** and get fully inferred
calls. TanStack Query provides caching, retry, and optimistic updates on both Expo and Next.js.

**Why over the alternatives:** oRPC gives REST + OpenAPI for free but is newer with a smaller
community; Hono's built-in RPC client is the lightest option but TS inference degrades as routes grow
and the client is thinner than TanStack Query; hand-written REST + shared Zod is the most portable but
means hand-writing a client per endpoint.

**Accepted downside:** no human-readable REST surface. If we later want third-party or non-TypeScript
consumers, we add a separate REST facade rather than converting.

**Type wiring:** the API package exports `export type AppRouter = typeof appRouter` from a
**type-only entrypoint**. Clients use `import type { AppRouter } from '@guitar/api'`, which is fully
erased at compile time — no server code is ever bundled into the React Native or browser bundle.
Packages export TypeScript source directly (no build step); Metro, Next.js, and Wrangler each
transpile the workspace source.

**Auth routes do not go through tRPC.** Better Auth mounts its own handler (see below).

## 5. Auth: Better Auth, self-hosted

Runs inside the Worker; users and sessions live in our own Neon Postgres via the Drizzle adapter.
Mounted in Hono at `/api/auth/*`.

**Why:** $0 forever with no MAU ceiling, user data stays in our database (so progress rows can join
directly against users), and it has an official Expo plugin plus a Next.js/React client for later.

**Rejected:** Clerk (nicest Expo SDK and fastest to working sign-in, but user records live off-site
and it's $25/mo base + per-user past 10k MAU); Supabase Auth (free, but drags Supabase in alongside
Neon); rolling our own JWT (total control, but we'd build password reset, email verification, and
session revocation ourselves).

### Sign-in methods

All four ship at launch.

- **Sign in with Apple** — native via `expo-apple-authentication`, passing the `idToken` to Better
  Auth's social sign-in. Mandatory on iOS given we also offer Google.
- **Google** — native sign-in for good UX on mobile (requires a dev client, which the project already
  uses), standard OAuth redirect on web.
- **Email + password** — the universal fallback and the easiest path to test locally without OAuth
  redirect plumbing. Requires verification and reset email.
- **Anonymous / guest** — Better Auth's anonymous plugin. A real user row is created on first launch
  with no sign-in, so progress is tracked immediately and the app is fully usable before committing
  to an account.

### Guest → real account linking

This is the sharpest edge in the auth design. All synced data is keyed by `user_id`. When an
anonymous user signs in with Apple/Google/email, the server must reassign their rows:

- Better Auth's `onLinkAccount` hook runs a server-side reassignment of every synced table from the
  anonymous id to the real user id.
- If the real account **already exists** (user had an account on another device), the two data sets
  merge under the sync merge rules in §7 rather than one overwriting the other.
- The anonymous user row is deleted after reassignment.

This must be covered by tests before the anonymous plugin is enabled in production.

### Sessions

Better Auth's default database sessions with a cookie. The Expo plugin stores the cookie in
`expo-secure-store`; the tRPC client reads it via `authClient.getCookie()` and attaches it as a
`Cookie` header on every request.

**Session cache and rate limiting** use Cloudflare KV as Better Auth's `secondaryStorage`. This keeps
per-request session lookups off Neon, which directly protects the free tier's compute-hour budget.
Note the KV free tier allows 1k writes/day — if rate-limit writes approach that ceiling, move rate
limiting to Durable Objects or Cloudflare's native rate limiting.

### Email

Resend for verification and password reset. Free tier is 3k/month and 100/day, which is ample at
launch. A custom sending domain must be verified before production.

## 6. Client/server state: offline-first

**On-device SQLite is the source of truth.** All reads and writes hit local storage; a background
sync reconciles with the server. The app works fully offline and opens instantly.

**Context:** the mobile app currently has *no persistence at all* — no AsyncStorage, MMKV, or SQLite
in `package.json` and no storage module in `src/lib`. This is a clean slate, not a retrofit, which is
the main reason offline-first is affordable here.

**Accepted cost:** conflict resolution, tombstones, and sync cursors are most of the work, and the
learning system doesn't exist yet to validate the design against. Mitigation: the sync layer is
generic over tables with an explicit per-table merge rule, so adding learning-system tables later is
configuration rather than new sync code.

**Rejected:** server-authoritative with cached reads (simplest, but the app is unusable offline and
retrofitting sync later is a rewrite); local-only preferences (less to build, but a new phone starts
fresh on settings).

## 7. Sync: hand-rolled push/pull over tRPC

Two tRPC procedures, `sync.pull` and `sync.push`. No persistent connections, no extra services, no
vendor between the app and the database — which is what keeps this compatible with Workers and free.

**Rejected:** PowerSync (fastest to robust sync, but paid past the free tier and inserts a vendor
between app and DB); ElectricSQL (open source and powerful, but the sync service is a long-running
process that can't live in a Worker — it would require a container host and undo the cost savings);
Legend-State v3 (lighter than a full engine, but we'd still define all merge semantics ourselves).

### Cursor

Every synced row carries a `server_seq bigint` drawn from a **single global Postgres sequence**,
assigned server-side on write. `pull(cursor)` returns rows with `server_seq > cursor`, ordered by
`server_seq`, capped at a page limit, and returns the new cursor. Using a sequence rather than
`updated_at` eliminates clock-skew bugs entirely.

### Identity and idempotency

All row ids are **client-generated UUIDv7**. Push is therefore naturally idempotent — replaying a
batch after a dropped connection converges to the same state.

### Merge rules

Each synced table declares exactly one rule:

| Rule | Semantics | Applies to |
| --- | --- | --- |
| Append-only | `ON CONFLICT DO NOTHING`; rows are immutable once written | Ear-trainer sessions |
| Monotonic | Per-column `GREATEST`/`LEAST` merge — best score up, first-completion date down | Lesson / article progress |
| Last-write-wins | Per-key row with a client timestamp; later timestamp wins | Preferences |

Counters that would need summing (e.g. total attempts) are **derived** from append-only rows at read
time rather than stored as a mutable counter. This keeps every merge commutative and avoids an
operation log.

### Deletes

Soft deletes via a `deleted_at` tombstone column. Tombstones are returned by `pull` so clients can
remove rows locally, and are purged after 90 days. The server exposes a `min_valid_cursor`; a client
whose cursor is older than that must perform a full resync.

### Push shape

A batch of operations `{ table, op: 'upsert' | 'delete', id, payload, clientUpdatedAt }`, grouped by
table server-side into one bulk statement each and submitted as a single Neon array-form transaction
(see the driver constraint in §3). The response returns the new cursor.

## 8. Schema sharing across dialects

Drizzle schemas are dialect-specific — `pg-core` on the server, `sqlite-core` on the device — so a
single Drizzle schema **cannot** be shared. The layering instead is:

- **Zod domain schemas** in the shared package are the single source of truth for shape and validation.
  Both clients and the API validate against them.
- **`schema.pg.ts`** defines the server's Postgres tables.
- **`schema.sqlite.ts`** defines the device's mirror tables.
- A **parity test** asserts the two Drizzle schemas expose the same table and column names, so they
  can't silently drift.

## 9. Monorepo layout

The existing pnpm workspace stays; `guitar-mobile-expo` does not move (its native iOS project has
baked-in paths).

```
guitar-app-v2/
  guitar-mobile-expo/        # unchanged
  packages/
    api/                     # Cloudflare Worker: Hono + tRPC + Better Auth
    db/                      # Drizzle schemas (pg + sqlite), migrations, client factory
    shared/                  # Zod domain schemas, sync contracts, domain constants
```

`pnpm-workspace.yaml` becomes `guitar-mobile-expo` + `packages/*`. The stale `lambda-backend` entry
is removed.

## 10. Environments, config, and deployment

- **Secrets:** `.dev.vars` locally, `wrangler secret put` for deployed environments. Required:
  `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, Apple and Google OAuth credentials,
  `RESEND_API_KEY`.
- **Environments:** Wrangler environments for staging and production, each pinned to its own Neon
  branch and KV namespace.
- **Domain:** `api.<domain>` via Cloudflare — free, and keeps auth cookies on a first-party domain.
- **Trusted origins:** Better Auth must list the Expo app scheme and the web origin, or OAuth
  redirects and cookie handling will fail.

## 11. Testing

- Sync merge rules get pure unit tests — they're the highest-risk logic and have no I/O.
- API integration tests run under `@cloudflare/vitest-pool-workers` against a dedicated Neon branch.
- Guest-account linking (§5) gets explicit tests for both the "new account" and "account already
  exists, merge" paths.
- The mobile app already uses Vitest, so the toolchain is consistent across packages.

## 12. Cost model

**Free tier at launch:**

| Service | Free allowance |
| --- | --- |
| Cloudflare Workers | 100k requests/day |
| Cloudflare KV | 100k reads/day, 1k writes/day |
| Neon | 0.5 GB storage, 190 compute-hours/month |
| Resend | 3k emails/month, 100/day |

Realistically $0/month until the app has meaningful traction.

**Under traction:** Workers Paid ($5/mo, 10M requests), Neon Launch (~$19/mo), Resend Pro (~$20/mo).
Roughly $45/month before anything architectural needs to change.

**The constraint to watch first** is Neon compute-hours, not Workers requests — which is why session
lookups are cached in KV rather than hitting Postgres on every request.

## 13. Future web app

The Next.js app is a pure client. It imports the same `AppRouter` type and uses Better Auth's React
client against the same Worker. It introduces no backend of its own. Hosting is undecided (Vercel or
Cloudflare Pages) and does not affect anything above.

## Open questions

Deferred until the relevant features are designed:

- The learning system's data model — deliberately not modelled speculatively. It will be added as
  new tables with a declared merge rule once the feature is designed.
- Whether preferences sync at all, or split into synced (musical defaults) vs device-local (UI
  chrome). Currently planned as fully synced.
- Whether ear-trainer sessions need retention limits, given they're append-only and unbounded.
