/**
 * Server-side Postgres tables (BACKEND_PLAN.md §8).
 *
 * Intentionally empty — the schema is designed in its own session. What lands here:
 * Better Auth's user/session/account/verification tables, the global `server_seq` sequence,
 * and the synced tables (ear-trainer sessions, progress, preferences).
 *
 * The device mirror lives in `schema.sqlite.ts`; a parity test keeps the two from drifting.
 */

export {};
