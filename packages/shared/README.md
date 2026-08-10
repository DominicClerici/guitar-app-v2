# @guitar/shared

Zod domain schemas, sync contracts, and domain constants shared by the API, the Expo app, and the
future Next.js app. Per `BACKEND_PLAN.md` §8 these Zod schemas — not the Drizzle tables — are the
single source of truth for shape and validation, because Drizzle schemas are dialect-specific and
cannot be shared between Postgres and on-device SQLite.

Exports TypeScript source directly (no build step). Metro, Wrangler, and Next.js each transpile it.

## Current contents

- `health.ts` — the health/ping contract, which exists mainly to prove the
  shared → api → client type chain end to end.
- `auth.ts` — credential shapes for the email + password flows, bounded to match Better Auth's own
  defaults so a client can reject what the server would reject anyway.
- `preferences.ts` — what a preference is allowed to be. Neither database enforces it: both store
  an opaque `value` string, so this module is the only thing that knows.
- `sync.ts` — the `push` / `pull` wire contracts (§7).

The per-table **merge rules** are not here. They are declared in `@guitar/db`'s `sync.ts` as Drizzle
columns, because both things that merge rows — `sync.push` and the guest-linking reassignment in §5 —
build SQL from them and neither runs on a device.

One asymmetry in `sync.ts` worth knowing: what a device **pushes** is validated exactly, and what it
**pulls** is validated loosely (`key` and `value` as plain strings). A row written by a newer build
of the app must not fail an older build's pull, or that device never advances its cursor again.
Unknown keys are dropped later, when the rows are folded by `foldPreferences`.
