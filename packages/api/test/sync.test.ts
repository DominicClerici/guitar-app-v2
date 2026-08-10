/**
 * `sync.pull` and `sync.push` against a real Postgres (BACKEND_PLAN.md §7, §11).
 *
 * Like the guest-linking tests, what these check is not configuration: the cursor is assigned by a
 * database trigger and the merge is decided by `ON CONFLICT` semantics, so neither can be
 * exercised against a stub. They run against the server named by TEST_DATABASE_URL — locally
 * `pnpm db db:up && pnpm db db:migrate` — and skip themselves when nothing answers.
 */
import { createDb, pgSchema } from '@guitar/db';
import type { PreferenceMutation } from '@guitar/shared';
import { env } from 'cloudflare:test';
import { eq, sql } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';

import type { Context } from '../src/trpc/context';
import { createCallerFactory } from '../src/trpc/init';
import { appRouter } from '../src/trpc/router';

const { user, userPreferences } = pgSchema;

const db = createDb(env.TEST_DATABASE_URL);

const reachable = await db
  .execute(sql`select 1 from ${userPreferences} limit 0`)
  .then(() => true)
  .catch(() => false);

if (!reachable) {
  console.warn(
    `Skipping sync tests: no migrated database at ${env.TEST_DATABASE_URL}.\n` +
      'Run `pnpm db db:up && pnpm db db:migrate` to exercise them.',
  );
}

const createCaller = createCallerFactory(appRouter);

/**
 * A context carrying a session for `userId` and nothing else. The sync procedures reach for
 * `ctx.db` and `ctx.getSession()` only, so the rest is left off rather than stubbed — tRPC spreads
 * the context object when a middleware calls `next`, which would evaluate any getter put here.
 */
function callerFor(userId: string) {
  const context = {
    env,
    req: new Request('https://api.test/trpc'),
    db,
    getSession: async () => ({ session: { userId }, user: { id: userId } }),
  } as unknown as Context;

  return createCaller(context);
}

const EARLIER = Date.UTC(2026, 7, 1, 10);
const LATER = Date.UTC(2026, 7, 1, 11);

const upsert = (value: string, clientUpdatedAt: number): PreferenceMutation => ({
  op: 'upsert',
  entry: { key: 'theme', value: value as 'dark' },
  clientUpdatedAt,
});

describe.skipIf(!reachable)('sync', () => {
  const created: string[] = [];

  afterEach(async () => {
    for (const id of created.splice(0)) {
      await db.delete(user).where(eq(user.id, id));
    }
  });

  async function makeUser(): Promise<string> {
    const id = crypto.randomUUID();

    await db.insert(user).values({ id, name: 'Ada', email: `${id}@example.com` });
    created.push(id);

    return id;
  }

  it('returns the row a push wrote, with the sequence value the server assigned', async () => {
    const caller = callerFor(await makeUser());

    const result = await caller.sync.push({ userPreferences: [upsert('dark', EARLIER)] });

    expect(result.rows.userPreferences).toEqual([
      {
        key: 'theme',
        value: 'dark',
        clientUpdatedAt: EARLIER,
        deletedAt: null,
        serverSeq: expect.any(Number),
      },
    ]);
  });

  it('pulls what another device pushed, and advances the cursor past it', async () => {
    const userId = await makeUser();
    await callerFor(userId).sync.push({ userPreferences: [upsert('dark', EARLIER)] });

    const page = await callerFor(userId).sync.pull({ cursor: 0 });

    expect(page.rows.userPreferences).toMatchObject([{ key: 'theme', value: 'dark' }]);
    expect(page.cursor).toBeGreaterThan(0);
    expect(page.hasMore).toBe(false);
  });

  it('returns nothing the second time, so a quiet device stays quiet', async () => {
    const caller = callerFor(await makeUser());
    await caller.sync.push({ userPreferences: [upsert('dark', EARLIER)] });

    const first = await caller.sync.pull({ cursor: 0 });
    const second = await caller.sync.pull({ cursor: first.cursor });

    expect(second.rows.userPreferences).toEqual([]);
    expect(second.cursor).toBe(first.cursor);
  });

  it('pages, and reports that more is waiting', async () => {
    const caller = callerFor(await makeUser());
    await caller.sync.push({
      userPreferences: [
        upsert('dark', EARLIER),
        {
          op: 'upsert',
          entry: { key: 'accidentalPreference', value: 'flat' },
          clientUpdatedAt: EARLIER,
        },
      ],
    });

    const first = await caller.sync.pull({ cursor: 0, limit: 1 });
    const second = await caller.sync.pull({ cursor: first.cursor, limit: 1 });

    expect(first.rows.userPreferences).toHaveLength(1);
    expect(first.hasMore).toBe(true);
    expect(second.rows.userPreferences).toHaveLength(1);
    expect(second.rows.userPreferences[0]?.key).not.toBe(first.rows.userPreferences[0]?.key);
  });

  it('keeps one account’s rows out of another’s pull', async () => {
    const mine = await makeUser();
    const theirs = await makeUser();
    await callerFor(theirs).sync.push({ userPreferences: [upsert('dark', LATER)] });

    const page = await callerFor(mine).sync.pull({ cursor: 0 });

    expect(page.rows.userPreferences).toEqual([]);
  });

  describe('last-write-wins', () => {
    it('takes the later write when it arrives second', async () => {
      const caller = callerFor(await makeUser());
      await caller.sync.push({ userPreferences: [upsert('dark', EARLIER)] });

      const result = await caller.sync.push({ userPreferences: [upsert('light', LATER)] });

      expect(result.rows.userPreferences).toMatchObject([
        { value: 'light', clientUpdatedAt: LATER },
      ]);
    });

    /**
     * The case that makes push return rows rather than a cursor: this device lost, and the row it
     * needs is the one already on the server — which may sit below its cursor and never be pulled.
     */
    it('tells a device that lost what the server kept', async () => {
      const caller = callerFor(await makeUser());
      await caller.sync.push({ userPreferences: [upsert('light', LATER)] });

      const result = await caller.sync.push({ userPreferences: [upsert('dark', EARLIER)] });

      expect(result.rows.userPreferences).toMatchObject([
        { value: 'light', clientUpdatedAt: LATER },
      ]);
    });

    it('leaves the sequence alone when a write loses, so nobody re-pulls an unchanged row', async () => {
      const caller = callerFor(await makeUser());
      const won = await caller.sync.push({ userPreferences: [upsert('light', LATER)] });

      const lost = await caller.sync.push({ userPreferences: [upsert('dark', EARLIER)] });

      expect(lost.rows.userPreferences[0]?.serverSeq).toBe(won.rows.userPreferences[0]?.serverSeq);
    });

    it('collapses repeated writes to the same key in one batch', async () => {
      const caller = callerFor(await makeUser());

      const result = await caller.sync.push({
        userPreferences: [upsert('dark', EARLIER), upsert('light', LATER)],
      });

      expect(result.rows.userPreferences).toMatchObject([{ value: 'light' }]);
    });

    it('converges when a batch is replayed after a dropped connection', async () => {
      const caller = callerFor(await makeUser());
      const once = await caller.sync.push({ userPreferences: [upsert('dark', EARLIER)] });

      const twice = await caller.sync.push({ userPreferences: [upsert('dark', EARLIER)] });

      expect(twice.rows.userPreferences).toEqual(once.rows.userPreferences);
    });
  });

  describe('deletes', () => {
    it('tombstones rather than removing, and pulls the tombstone', async () => {
      const userId = await makeUser();
      await callerFor(userId).sync.push({ userPreferences: [upsert('dark', EARLIER)] });

      await callerFor(userId).sync.push({
        userPreferences: [{ op: 'delete', key: 'theme', clientUpdatedAt: LATER }],
      });
      const page = await callerFor(userId).sync.pull({ cursor: 0 });

      expect(page.rows.userPreferences).toMatchObject([{ key: 'theme', deletedAt: LATER }]);
    });

    it('loses to a later write from another device, like any other row', async () => {
      const caller = callerFor(await makeUser());
      await caller.sync.push({ userPreferences: [upsert('light', LATER)] });

      const result = await caller.sync.push({
        userPreferences: [{ op: 'delete', key: 'theme', clientUpdatedAt: EARLIER }],
      });

      expect(result.rows.userPreferences).toMatchObject([{ value: 'light', deletedAt: null }]);
    });

    it('is undone by a later write, so a preference can come back', async () => {
      const caller = callerFor(await makeUser());
      await caller.sync.push({
        userPreferences: [{ op: 'delete', key: 'theme', clientUpdatedAt: EARLIER }],
      });

      const result = await caller.sync.push({ userPreferences: [upsert('dark', LATER)] });

      expect(result.rows.userPreferences).toMatchObject([{ value: 'dark', deletedAt: null }]);
    });
  });

  it('rejects an unauthenticated pull', async () => {
    const anonymous = createCaller({
      env,
      req: new Request('https://api.test/trpc'),
      db,
      getSession: async () => null,
    } as unknown as Context);

    await expect(anonymous.sync.pull({ cursor: 0 })).rejects.toThrow(/UNAUTHORIZED/i);
  });
});
