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

Three edits, and the parity test fails until all three are done:

1. Declare it in `src/schema.pg.ts` with `...syncColumns()`, and add it to `syncedTables`.
2. Mirror it in `src/schema.sqlite.ts` under the same table and column names, and add it to that
   file's `syncedTables`.
3. `pnpm db:generate`, then add a `set_server_seq()` trigger for it — either in
   `drizzle/0001_server_seq_trigger.sql` if that migration has not been applied anywhere yet, or in
   a new `pnpm exec drizzle-kit generate --custom` migration if it has.

Step 3 is the one that matters. `server_seq` has a `nextval` default, so a table without a trigger
looks fine on insert and silently stops syncing on update — the row keeps its original sequence
value and drops below every client's cursor forever.

## Commands

```bash
pnpm db:generate   # drizzle-kit generate — writes SQL into ./drizzle, commit the result
pnpm db:migrate    # applies ./drizzle against $DATABASE_URL, from Node — never from the Worker
pnpm db:studio     # drizzle-kit studio
```

All three read `DATABASE_URL` from `packages/db/.env` (see `.env.example`). Point it at the Neon
branch for the environment you're targeting.

## Transaction constraint

`neon-http` sends one HTTP request per statement, so `db.transaction(async (tx) => ...)` is
unavailable. Writes are designed around it: group by table, one bulk
`INSERT ... ON CONFLICT DO UPDATE` each, submitted together via Neon's array-form transaction. If
something genuinely needs read-then-write atomicity, the fallback is `neon-serverless` (WebSocket
`Pool`), which supports full transactions on Workers.
