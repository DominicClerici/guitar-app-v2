# Backend Plan

Decisions made 2026-08-10. This document captures **what we chose and why**; the packages under
`packages/` are where they get carried out. Built so far: the scaffold, Better Auth with email +
password and anonymous guests including guest → real account linking, the schema through §8, sync
(§6, §7) generalised over a table registry and carrying four tables, and the learning system's data
model and content delivery (§14). What is not built: any UI that reads or writes a preference, the
tombstone purge job §7 describes, and the microphone "activity" sections §14 leaves as placeholders.

## Goals

- User accounts and a database backing an (unbuilt) learning system, the ear trainer, and preferences.
- End-to-end typesafety across three projects: API → Expo mobile, API → future Next.js web.
- Minimise cost. Start on free tiers, keep every choice portable enough to migrate under traction.
- Don't sacrifice perceived performance — no cold-start-on-open, no sleeping instances.

## Decisions at a glance

| Area                | Choice                                                        |
| ------------------- | ------------------------------------------------------------- |
| Architecture        | Standalone API service; both clients call it over HTTP        |
| Runtime / host      | Cloudflare Workers                                            |
| Server framework    | Hono                                                          |
| Database            | Neon Postgres                                                 |
| ORM / migrations    | Drizzle + drizzle-kit                                         |
| API layer           | tRPC v11 + TanStack Query                                     |
| Auth                | Better Auth, self-hosted, on our own Postgres                 |
| Sign-in methods     | Sign in with Apple, Google, email + password, anonymous guest |
| Client/server state | Offline-first; on-device SQLite is the source of truth        |
| Sync                | Hand-rolled push/pull over tRPC                               |
| Transactional email | Resend                                                        |

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

**Local development runs on a local Postgres, not a Neon branch** (decided 2026-08-10, after the
scaffold). Neon has no local server, so the alternative was sharing a remote branch across machines
with no offline story. Because a plain Postgres doesn't speak Neon's SQL-over-HTTP protocol,
`packages/db/docker-compose.yml` runs a proxy that does, and `createDb` routes to it whenever
`DATABASE_URL` names a local host.

Keeping the `neon-http` driver in local development is the whole point of the proxy. Substituting
`node-postgres` locally would be simpler but it supports interactive transactions, so
`db.transaction()` would work all through development and fail only once deployed — the exact
constraint above. Moving to Neon is then a one-line `DATABASE_URL` change.

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
  to an account. Created silently, with no screen of its own; a failure just leaves the app signed
  out, and is retried when the app next comes to the foreground or the network returns.

The guest's address is `temp-<id>@guest.invalid` — `user.email` is unique and not null, and a
reserved TLD (RFC 2606) can never collide with a domain somebody owns.

### Guest → real account linking

This is the sharpest edge in the auth design. All synced data is keyed by `user_id`. When an
anonymous user signs in with Apple/Google/email, the server reassigns their rows:

- Better Auth's `onLinkAccount` hook runs a server-side reassignment of every synced table from the
  anonymous id to the real user id.
- If the real account **already exists** (user had an account on another device), the two data sets
  merge under the sync merge rules in §7 rather than one overwriting the other.
- The anonymous user row is deleted after reassignment — by Better Auth, which takes the guest's
  rows with it through the `user_id` cascade.

The reassignment is generic over tables: it reads each table's rule from `syncMergeRules` and builds
one merge statement from the table's own columns, so a new synced table is a rule declaration rather
than new linking code. The `set_server_seq()` trigger is what makes a merged row visible to the
account's _other_ devices — without it a reassigned row would keep the sequence value it was written
with and sort below every existing cursor.

Failure is safe rather than atomic: throwing out of `onLinkAccount` aborts the sign-in and leaves
the guest user undeleted, so the device keeps its guest session and the next attempt replays the
whole merge. Both merge rules are idempotent, so the replay converges.

Covered by tests before enabling, per §11.

### Guest UX

A guest sees the ordinary sign-in and sign-up forms with a banner explaining what a guest account
is, and no sign-out button — a guest has no credential to sign back in with, so signing out would
destroy the account rather than leave it. Signing in or up from that screen is what claims the
progress, so there is no separate "claim your account" flow.

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

**Context:** the mobile app had _no persistence at all_ before this — no AsyncStorage, MMKV, or
SQLite, and no storage module in `src/lib`. It was a clean slate, not a retrofit, which is the main
reason offline-first was affordable here.

**How it is carried out.** `expo-sqlite` with Drizzle, in `mobile/src/lib/db`. The tables come from
`@guitar/db/schema.sqlite` so the parity test in §8 can hold them against the server's; the
migrations that create them are generated from that same file by `pnpm db:generate` **in the mobile
app**, since `driver: 'expo'` emits a `drizzle/migrations.js` that Metro bundles into the binary and
nothing else consumes. Adding `expo-sqlite` is a native dependency, so a dev client built before it
needs a rebuild.

Reads go through `useLiveQuery`, which re-runs on any write to the table it selects from — a value
pulled from another device reaches the screen without anything invalidating a cache, and there is no
loading state to render because SQLite is local and synchronous.

**When the account changes.** The device's rows are keyed by `user_id` like the server's, so a guest
claiming their account has to move them (§5). It carries them over — merged under the same
last-write-wins comparison the server uses — and restarts the cursor at zero, because a guest's
offline writes exist nowhere else and would otherwise be lost at the one moment a user is most
likely to notice. It only does this when the *previous* owner was a guest: a different person
signing in on the same device inherits nothing, which is why `sync_state` records whether its user
was anonymous.

**Accepted cost:** conflict resolution, tombstones, and sync cursors are most of the work.
Mitigation: the sync layer is generic over a table registry with an explicit per-table merge rule,
so adding a synced table is configuration rather than new sync code. The learning system (§14) was
the first test of that claim, and it held — three tables arrived as three adapters and three rule
declarations, with no change to the push loop, the pull loop, the cursor, or the merge builder.

The registry exists because the failures it prevents are silent. A table missing from the full-resync
clear leaves stale rows behind; one missing from the push loop is simply never sent. Neither raises
anything, and neither shows up until a user notices their progress is wrong on a second device.

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

One consequence of paging per table against a shared sequence: the returned cursor is the **lowest**
stopping point among the tables that filled their page, not the highest sequence value seen. If one
table stops at 900 while another returns everything it has up to 1200, resuming from 1200 skips the
first table's rows in between — permanently, since the cursor only moves forward. Rows above the
boundary are dropped from the response and re-sent by the next page.

`min_valid_cursor` is currently always `0`: nothing has ever been purged, because the purge job
below does not exist yet. When it lands it has to record the highest sequence value it removed, and
`pull` has to return that instead.

### Identity and idempotency

Push is idempotent: replaying a batch after a dropped connection converges to the same state.

Row identity is per table, and is whatever already names the row. Tables whose rows are events —
ear-trainer sessions, when they arrive — get **client-generated UUIDv7** ids. `user_preferences`
instead has a composite key of `(user_id, key)`, because that pair already identifies the row; a
generated id would let one device hold two rows for the same preference and make the merge
ambiguous. What matters for idempotency is that the client names the row, not that the name is a
UUID.

### Merge rules

Each synced table declares exactly one rule:

| Rule            | Semantics                                                                       | Applies to                             |
| --------------- | ------------------------------------------------------------------------------- | -------------------------------------- |
| Append-only     | `ON CONFLICT DO NOTHING`; rows are immutable once written                       | `quiz_attempts`, ear-trainer sessions  |
| Monotonic       | Per-column `GREATEST`/`LEAST` merge — best score up, first-completion date down | `section_progress`                     |
| Last-write-wins | Per-key row with a client timestamp; later timestamp wins                       | `user_preferences`, enrollments        |

The monotonic update carries a `WHERE` guard — `least(...) is distinct from ...` — so a merge that
changes nothing performs no update. This is not an optimisation: `set_server_seq()` fires on every
UPDATE, so an unguarded no-op would draw a fresh sequence value for an unchanged row and
re-broadcast it to every device on each push, growing pull pages with rows nobody touched.

**Every synced table's primary key must include `user_id`.** The guest-to-real-account
reassignment in §5 copies rows between accounts, and a table keyed only by a client-generated id
collides with the guest's own row — `ON CONFLICT DO NOTHING` then discards the copy silently, and
the user loses that data at exactly the moment they claim their account. `quiz_attempts` is keyed
`(user_id, attempt_id)` for this reason despite the id being a globally unique UUIDv7.

Counters that would need summing (e.g. total attempts) are **derived** from append-only rows at read
time rather than stored as a mutable counter. This keeps every merge commutative and avoids an
operation log.

### Deletes

Soft deletes via a `deleted_at` tombstone column. Tombstones are returned by `pull` so clients can
remove rows locally, and are purged after 90 days. The server exposes a `min_valid_cursor`; a client
whose cursor is older than that must perform a full resync.

### Push shape

A batch of operations `{ op: 'upsert' | 'delete', payload, clientUpdatedAt }`, **keyed by table** in
the request rather than carrying a `table` field per operation — the client already knows which
table it is writing, and a key per table lets each one validate under its own schema, which a single
flat union of every table's payload cannot. Each table becomes one bulk statement, submitted as a
single Neon array-form transaction (see the driver constraint in §3).

**The response returns rows, not a cursor.** A cursor cannot be derived from a write: the sequence
values the write consumed say nothing about what other devices wrote below them, so advancing to the
highest one would silently skip those rows. What comes back instead is the server's settled row for
every key the batch named — including the ones this device **lost**. Without that, a device whose
write lost the merge would never learn: the winning row may sit below its cursor and never be pulled
again, so it would re-push the same losing row on every sync forever.

## 8. Schema sharing across dialects

Drizzle schemas are dialect-specific — `pg-core` on the server, `sqlite-core` on the device — so a
single Drizzle schema **cannot** be shared. The layering instead is:

- **Zod domain schemas** in the shared package are the single source of truth for shape and validation.
  Both clients and the API validate against them. The content parsers (§14) live there for exactly
  this reason: the publish script, the Worker, and the device must agree on what a valid article is,
  and a second copy in the app would drift from the one the script checks against.
- **`schema.pg.ts`** defines the server's Postgres tables.
- **`schema.sqlite.ts`** defines the device's mirror tables.
- A **parity test** asserts the two Drizzle schemas expose the same table and column names, so they
  can't silently drift.

## 9. Monorepo layout

The existing pnpm workspace stays; the mobile app now lives at `mobile/` (renamed from
`guitar-mobile-expo/`; its native `ios/` project is gitignored/generated, so it just needs a
fresh `pod install` / `expo prebuild` after the rename).

```
guitar-app-v2/
  mobile/                    # renamed from guitar-mobile-expo/
    drizzle/                 # device SQLite migrations, generated from packages/db, bundled by Metro
  packages/
    api/                     # Cloudflare Worker: Hono + tRPC + Better Auth
    db/                      # Drizzle schemas (pg + sqlite), migrations, client factory
    shared/                  # Zod domain schemas, sync contracts, domain constants
```

`pnpm-workspace.yaml` becomes `mobile` + `packages/*`. The stale `lambda-backend` entry
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

- Sync merge rules get pure unit tests — they're the highest-risk logic and have no I/O. That is
  `mobile/src/lib/sync/reconcile.ts` on the device (what a pulled row does to a local one, what a
  guest's row does to the account it joins) and `packages/api/src/sync/cursor.ts` on the server (the
  paging boundary above, whose multi-table case cannot be reached end to end while one table exists).
- The merge itself is *not* unit-tested, deliberately: it is an `ON CONFLICT` clause, so testing it
  without a database would only assert the SQL string we wrote. It is covered by the integration
  tests instead.
- API integration tests run under `@cloudflare/vitest-pool-workers` against a database: the local
  Postgres from `packages/db/docker-compose.yml` by default, a dedicated Neon branch in CI. The
  server is named once, by `TEST_DATABASE_URL` in `vitest.config.ts`. Tests needing it skip
  themselves when nothing answers, so a checkout without Docker still runs green.
- Guest-account linking (§5) gets explicit tests for both the "new account" and "account already
  exists, merge" paths. These cannot be config assertions: what they check is `ON CONFLICT`
  semantics and the `server_seq` trigger, both of which live in the database.
- `sync.pull` and `sync.push` are tested the same way and for the same reason — the cursor comes
  from a trigger and the merge from `ON CONFLICT`, so a stubbed database would test nothing.
- The mobile app already uses Vitest, so the toolchain is consistent across packages.

## 12. Cost model

**Free tier at launch:**

| Service            | Free allowance                          |
| ------------------ | --------------------------------------- |
| Cloudflare Workers | 100k requests/day                       |
| Cloudflare KV      | 100k reads/day, 1k writes/day           |
| Neon               | 0.5 GB storage, 190 compute-hours/month |
| Resend             | 3k emails/month, 100/day                |

Realistically $0/month until the app has meaningful traction.

**Under traction:** Workers Paid ($5/mo, 10M requests), Neon Launch (~$19/mo), Resend Pro (~$20/mo).
Roughly $45/month before anything architectural needs to change.

**The constraint to watch first** is Neon compute-hours, not Workers requests — which is why session
lookups are cached in KV rather than hitting Postgres on every request.

## 13. Future web app

The Next.js app is a pure client. It imports the same `AppRouter` type and uses Better Auth's React
client against the same Worker. It introduces no backend of its own. Hosting is undecided (Vercel or
Cloudflare Pages) and does not affect anything above.

## 14. The learning system

Pathways contain chapters, chapters contain sections, and a section is an article, a quiz, or an
activity. Progress is synced; the content itself is published.

### Structure and delivery

The curriculum is **authored as JSON files** in `packages/content` and published to Postgres by a
script that validates every document against the same Zod parsers the device runs (§8) and checks
what no single-document parser can: that every `ref` resolves, that no section id is duplicated,
that each checkpoint points at a checkpoint-kind quiz. Content is reviewed in pull requests, and
publishing is a deliberate command — `pnpm content:publish` — rather than a deploy side effect. It
refuses to touch the database if anything fails validation, and reports every issue rather than the
first, because someone fixing content wants the whole list.

A document's `version` is the hash of its **authored** JSON, canonicalised by sorting object keys
and preserving array order — key order in a file is cosmetic, array order is content. The body
stored is the authored JSON verbatim rather than the parser's output, because normalisation is
lossy: baking one build's understanding into storage would defeat the forward-compatibility rules
the device depends on. Republishing unchanged content therefore writes nothing at all, which is the
property the device's `unchanged` fast path rests on.

Rejected: relational tables per block (every new block type becomes a migration, and Postgres still
cannot validate one); an admin CMS (a whole second app before there is any content to manage).

Three public, version-conditional procedures serve it: `content.index`, `content.pathway`,
`content.chapter`. The device sends the version it holds and is usually told `unchanged`, which is
what keeps a launch-time refresh from re-downloading cached chapters — bandwidth, but more to the
point Neon compute against the free tier. The index's version is **derived** from the pathway rows
rather than stored, so it cannot claim to be current after a pathway underneath it was republished.

`content.chapter` is deliberately shaped like the device's cache unit rather than like the data
model: it returns every document a chapter references in one response, because a chapter is what
gets cached and what gets evicted.

### Offline

The device caches the **current chapter of each active pathway**, capped at three, plus a small
library of recently-read standalone articles. Cache rows live in device-local SQLite tables that
are excluded from `syncedTables`: content is published, not owned, so there is nothing to merge and
nothing to push. SQLite rather than the filesystem because reads there are synchronous, so a cached
article renders on the first frame with no loading state, matching how the rest of the app behaves.

Eviction runs after the fetches, never before, so a failed refresh leaves the old chapter in place
instead of clearing the cache and being unable to refill it.

### Progress

Three synced tables, one per merge rule (see §7's table). Two consequences are load-bearing:

- **Progress cannot be un-done.** There is no reset, deliberately: a tombstone racing a monotonic
  upsert is resurrected by the next device to report the same section. Dropping a pathway therefore
  removes only the enrollment, so starting it again resumes rather than restarts.
- **The three-pathway cap is a client rule.** Rows merge independently and commutatively, so two
  devices can each start a fourth pathway offline and both succeed. The client keeps the three most
  recently active and tombstones the rest, which converges without any write ever being rejected —
  a server-side constraint would instead fail one device's push permanently.

A checkpoint has no section of its own, so its result is stored under a derived id
(`<chapter id>:checkpoint`). Keyed on the chapter rather than the quiz slug, so one quiz reused as
two chapters' checkpoints does not pass both at once.

Quiz grading is client-side and correct answers ship in the document. This is a learning app:
cheating costs the user only their own progress, and server-side grading would mean a round trip
per question and no offline quizzes at all.

## Open questions

Deferred until the relevant features are designed:

- Whether preferences sync at all, or split into synced (musical defaults) vs device-local (UI
  chrome). Currently planned as fully synced.
- Whether ear-trainer sessions need retention limits, given they're append-only and unbounded.
- Whether `quiz_attempts` needs the same, for the same reason — unlimited retakes make it unbounded
  per user, though far more slowly.
- The microphone "activity" sections. Modelled in the curriculum and excluded from every progress
  denominator via `optional`, but nothing renders them yet.
