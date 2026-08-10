# mobile

Expo 57 app using React 19 with the React Compiler enabled. Routing via `expo-router`.

## Styling

Style **exclusively** with uniwind using Tailwind CSS v4 syntax — apply utility classes via
`className`. Do not:

- use `StyleSheet.create`, inline `style={{...}}` objects, or any other stylesheet mechanism
- author CSS classes (in `src/global.css` or elsewhere) unless a style is genuinely impossible to
  express with utilities — and only after confirming there is no utility-based way to do it

Prefer composing utility classes directly on the element. The only expected additions to
`src/global.css` are design tokens (see Design below), not component classes.

## Design

Follow `DESIGN.md` when implementing or updating any UI — it defines the "Aurora" visual
language (vibe, colour, typography, spacing, elevation). Use the design tokens in
`src/global.css` (`var(--token)`); never hardcode colours. When a new screen introduces a
reusable pattern, document it in `DESIGN.md`.

## Articles

Learn-tab articles are JSON documents rendered by a reusable block renderer.
Before authoring an article, changing the article schema, or adding a live
(interactive) article component, read `docs/articles.md` — it documents the
data model, the forward-compatibility rules, and the checklists for both.

## Data and sync

Anything that has to survive a restart or follow a user to another device belongs in the local
SQLite database, not in component state or a new storage library. `src/lib/db` is the database,
`src/lib/preferences` is the worked example of a feature reading and writing through it, and
`src/lib/sync` reconciles with the server on its own — a write is saved locally and returns, and
nothing renders a loading or error state for it.

The tables live in `packages/db/src/schema.sqlite.ts`, alongside the Postgres tables they mirror.
After changing them, run `pnpm db:generate` here to regenerate `drizzle/`. See `BACKEND_PLAN.md`
§6–§8 before adding a synced table — there are five edits and only some of them fail loudly.

## Verifying a solution

Run `pnpm lint` here — it runs `tsc --noEmit`, then `expo lint`, then `vitest run`, covering
typecheck, lint, and the pure theory tests. Always run this after making changes to confirm the
solution is correct. It takes a few seconds.

The API integration tests are **not** part of that loop. They run under
`@cloudflare/vitest-pool-workers` against a live Postgres, cost 30–45s of workerd boot before the
first assertion, and are unaffected by anything on the device. Run `pnpm test:integration` from the
repo root only when a change reaches the server's merge behaviour:

- a synced table added or changed in `packages/db/src/schema.sqlite.ts` / `schema.pg.ts`, or a new
  migration in `packages/db/drizzle/`
- anything under `packages/api/src/sync/` or `packages/api/src/link-anonymous.ts`
- a change to the auth config in `packages/api/src/auth.ts`

They need the database up — `pnpm db db:up && pnpm db db:migrate`. Without it they skip themselves
and pass, which means a green run proves nothing; check the output for the skip warning rather than
just the exit code.

## Argent

Do not use argent MCP tools or workflows unless the user explicitly asks for them.
