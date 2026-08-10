# @guitar/db

Drizzle schemas, migrations, and the Neon client factory (`BACKEND_PLAN.md` §3, §8).

## Layout

| File                        | Purpose                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `src/client.ts`             | `createDb(databaseUrl)` over Neon's HTTP driver — the only thing the Worker imports |
| `src/schema.pg.ts`          | Server Postgres tables: Better Auth's, plus the synced tables                       |
| `src/schema.sqlite.ts`      | On-device SQLite mirror of the synced tables, plus the device-local cursor          |
| `src/schema.parity.test.ts` | Asserts the two schemas can't drift (§8), and that every synced table has a trigger |
| `scripts/migrate.ts`        | Applies committed SQL migrations from Node                                          |
| `drizzle/`                  | Generated SQL, committed to git (created by `db:generate`)                          |

## Adding a synced table

Five edits. The parity test fails until the first four are done, and nothing fails if you skip the
fifth — the device just never creates the table.

1. Declare it in `src/schema.pg.ts` with `...syncColumns()`, and add it to `syncedTables`.
2. Mirror it in `src/schema.sqlite.ts` under the same table and column names, and add it to that
   file's `syncedTables`.
3. Declare its merge rule in `src/sync.ts`.
4. `pnpm db:generate`, then add a `set_server_seq()` trigger for it — either in
   `drizzle/0001_server_seq_trigger.sql` if that migration has not been applied anywhere yet, or in
   a new `pnpm exec drizzle-kit generate --custom` migration if it has.
5. `pnpm --filter mobile db:generate`, which regenerates the device's migrations from
   `schema.sqlite.ts` into `mobile/drizzle/`. They live there because Metro bundles them into the
   app binary and nothing else consumes them.

Step 4 is the one that matters most. `server_seq` has a `nextval` default, so a table without a
trigger looks fine on insert and silently stops syncing on update — the row keeps its original
sequence value and drops below every client's cursor forever.

`sync_state` in `schema.sqlite.ts` is device-local and deliberately has no Postgres counterpart, so
the parity test does not look at it. Changing it still needs step 5.

## Commands

```bash
pnpm db:up         # docker compose up — local Postgres + the Neon HTTP proxy
pnpm db:down       # stop them (add -v by hand to discard the data)
pnpm db:reset      # wipe the volume, recreate, re-migrate

pnpm db:generate   # drizzle-kit generate — writes SQL into ./drizzle, commit the result
pnpm db:migrate    # applies ./drizzle against $DATABASE_URL, from Node — never from the Worker
pnpm db:studio     # drizzle-kit studio
```

The last three read `DATABASE_URL` from `packages/db/.env` (see `.env.example`).

## Local development

Development runs against a local Postgres in Docker, not a Neon branch. Neon is a hosted service
with no local server, so the alternative would be sharing a remote branch across machines and
having no offline story.

The wrinkle is that production reaches Postgres over Neon's SQL-over-HTTP protocol, which a plain
Postgres does not speak. `docker-compose.yml` therefore runs a proxy alongside it that accepts that
protocol and forwards to the local database, and `createDb` points the driver at it whenever
`DATABASE_URL` names a local host.

This is deliberate: swapping in `node-postgres` locally would remove the proxy, but that driver
supports interactive transactions and `neon-http` does not. `db.transaction()` would then work
throughout development and fail only in production — the exact constraint the write design in §3 is
built around. Same driver locally means that failure shows up on your machine instead.

```bash
pnpm db:up
cp .env.example .env    # already points at the local containers
pnpm db:migrate
```

Ports are 5434 for Postgres and 4445 for the proxy, both off the defaults because 5432 (and other
projects' common substitutes like 5433) are so often taken by another project's container. Connect
with `psql -h localhost -p 5434 -U guitar -d guitar` (password `guitar`).

Going to Neon later is a one-line change: point `DATABASE_URL` at the branch. The local-host check
stops matching, the driver goes straight to Neon over HTTPS, and nothing else moves.

## Transaction constraint

`neon-http` sends one HTTP request per statement, so `db.transaction(async (tx) => ...)` is
unavailable. Writes are designed around it: group by table, one bulk
`INSERT ... ON CONFLICT DO UPDATE` each, submitted together via Neon's array-form transaction. If
something genuinely needs read-then-write atomicity, the fallback is `neon-serverless` (WebSocket
`Pool`), which supports full transactions on Workers.
