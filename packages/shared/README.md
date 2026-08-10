# @guitar/shared

Zod domain schemas, sync contracts, and domain constants shared by the API, the Expo app, and the
future Next.js app. Per `BACKEND_PLAN.md` §8 these Zod schemas — not the Drizzle tables — are the
single source of truth for shape and validation, because Drizzle schemas are dialect-specific and
cannot be shared between Postgres and on-device SQLite.

Exports TypeScript source directly (no build step). Metro, Wrangler, and Next.js each transpile it.

## Current contents

- `health.ts` — the health/ping contract, which exists mainly to prove the
  shared → api → client type chain end to end.

Sync contracts (`push` / `pull` payloads, per-table merge rules) land here when §7 is implemented.
