/**
 * Guest → real account linking, against a real Postgres (BACKEND_PLAN.md §5, §11).
 *
 * This is the one piece of the auth design that cannot be checked against its configuration: what
 * it does is decided by `ON CONFLICT` semantics and by the `set_server_seq()` trigger, both of
 * which live in the database. So these run against the server named by TEST_DATABASE_URL —
 * locally `pnpm db db:up && pnpm db db:migrate` — and skip themselves when nothing answers, so a
 * checkout without Docker still runs green.
 *
 * Still inside the Workers pool rather than Node: `neon-http` reaching Postgres over HTTP is the
 * part of the driver constraint in §3 that is worth exercising in the runtime that has to live
 * with it.
 */
import { createDb, pgSchema } from '@guitar/db';
import { env } from 'cloudflare:test';
import { and, eq, sql } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';

import { linkAnonymousUser } from '../src/link-anonymous';

const { user, userPreferences } = pgSchema;

const db = createDb(env.TEST_DATABASE_URL);

// Queries the table the tests actually use, so an unmigrated database skips for the same reason a
// missing one does rather than failing later with a bare "relation does not exist".
const reachable = await db
  .execute(sql`select 1 from ${userPreferences} limit 0`)
  .then(() => true)
  .catch(() => false);

if (!reachable) {
  console.warn(
    `Skipping guest-linking tests: no migrated database at ${env.TEST_DATABASE_URL}.\n` +
      'Run `pnpm db db:up && pnpm db db:migrate` to exercise them.',
  );
}

const EARLIER = new Date('2026-08-01T10:00:00Z');
const LATER = new Date('2026-08-01T11:00:00Z');

describe.skipIf(!reachable)('linkAnonymousUser', () => {
  const created: string[] = [];

  afterEach(async () => {
    // Preferences go with the user row, by the cascade the linking path itself relies on.
    for (const id of created.splice(0)) {
      await db.delete(user).where(eq(user.id, id));
    }
  });

  async function makeUser(isAnonymous: boolean): Promise<string> {
    const id = crypto.randomUUID();

    await db.insert(user).values({
      id,
      name: isAnonymous ? 'Anonymous' : 'Ada',
      email: isAnonymous ? `temp-${id}@guest.invalid` : `${id}@example.com`,
      isAnonymous,
    });

    created.push(id);
    return id;
  }

  async function setPreference(
    userId: string,
    value: string,
    clientUpdatedAt: Date,
    deletedAt: Date | null = null,
  ): Promise<void> {
    await db
      .insert(userPreferences)
      .values({ userId, key: 'theme', value, clientUpdatedAt, deletedAt });
  }

  async function themeOf(userId: string) {
    const [row] = await db
      .select()
      .from(userPreferences)
      .where(and(eq(userPreferences.userId, userId), eq(userPreferences.key, 'theme')));

    return row;
  }

  it('moves a guest onto an account that has nothing yet', async () => {
    const guest = await makeUser(true);
    const account = await makeUser(false);
    await setPreference(guest, 'dark', EARLIER);

    await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

    expect(await themeOf(account)).toMatchObject({ value: 'dark', clientUpdatedAt: EARLIER });
  });

  it('leaves the guest rows for the cascade rather than deleting them itself', async () => {
    const guest = await makeUser(true);
    const account = await makeUser(false);
    await setPreference(guest, 'dark', EARLIER);

    await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

    expect(await themeOf(guest)).toMatchObject({ value: 'dark' });
  });

  it('keeps what the account already had when the account wrote it later', async () => {
    const guest = await makeUser(true);
    const account = await makeUser(false);
    await setPreference(guest, 'dark', EARLIER);
    await setPreference(account, 'light', LATER);

    await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

    expect(await themeOf(account)).toMatchObject({ value: 'light', clientUpdatedAt: LATER });
  });

  it('takes the guest row when the guest wrote it later', async () => {
    const guest = await makeUser(true);
    const account = await makeUser(false);
    await setPreference(guest, 'dark', LATER);
    await setPreference(account, 'light', EARLIER);

    await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

    expect(await themeOf(account)).toMatchObject({ value: 'dark', clientUpdatedAt: LATER });
  });

  it('carries a guest tombstone across, so a deletion is not undone by linking', async () => {
    const guest = await makeUser(true);
    const account = await makeUser(false);
    await setPreference(guest, 'dark', LATER, LATER);
    await setPreference(account, 'light', EARLIER);

    await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

    expect(await themeOf(account)).toMatchObject({ deletedAt: LATER });
  });

  /**
   * The reassignment happens outside the sync path, so nothing in it would raise `server_seq` on
   * its own. Without the trigger the merged row would keep the sequence value it was written with,
   * sort below the account's other devices' cursors, and never be pulled — the account would look
   * unchanged everywhere except the phone that did the linking.
   */
  it('lifts server_seq so the account’s other devices pull the merged row', async () => {
    const guest = await makeUser(true);
    const account = await makeUser(false);
    await setPreference(guest, 'dark', LATER);
    await setPreference(account, 'light', EARLIER);

    const before = (await themeOf(account))?.serverSeq ?? 0;
    await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

    expect((await themeOf(account))?.serverSeq).toBeGreaterThan(before);
  });

  it('leaves a row alone when the merge does not change it', async () => {
    const guest = await makeUser(true);
    const account = await makeUser(false);
    await setPreference(guest, 'dark', EARLIER);
    await setPreference(account, 'light', LATER);

    const before = (await themeOf(account))?.serverSeq;
    await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

    // A losing merge must not bump the sequence: every device would re-pull a row that did not
    // change, on every link, forever.
    expect((await themeOf(account))?.serverSeq).toBe(before);
  });

  it('converges when replayed, so a failed link can be retried', async () => {
    const guest = await makeUser(true);
    const account = await makeUser(false);
    await setPreference(guest, 'dark', LATER);
    await setPreference(account, 'light', EARLIER);

    await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });
    const once = await themeOf(account);
    await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

    expect(await themeOf(account)).toEqual(once);
  });

  it('does nothing when the guest and the account are the same user', async () => {
    const account = await makeUser(false);
    await setPreference(account, 'light', EARLIER);

    const before = await themeOf(account);
    await linkAnonymousUser({ db, anonymousUserId: account, userId: account });

    expect(await themeOf(account)).toEqual(before);
  });
});
