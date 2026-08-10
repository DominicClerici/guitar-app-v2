# @guitar/db

Drizzle schemas, migrations, and the Neon client factory (`BACKEND_PLAN.md` §3, §8).

## Layout

| File                   | Purpose                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `src/client.ts`        | `createDb(databaseUrl)` over Neon's HTTP driver — the only thing the Worker imports |
| `src/schema.pg.ts`     | Server Postgres tables (empty; designed in a later session)                         |
| `src/schema.sqlite.ts` | On-device SQLite mirror (empty; designed in a later session)                        |
| `scripts/migrate.ts`   | Applies committed SQL migrations from Node                                          |
| `drizzle/`             | Generated SQL, committed to git (created by `db:generate`)                          |

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
