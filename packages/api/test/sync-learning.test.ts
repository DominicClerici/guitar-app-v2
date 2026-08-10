/**
 * The learning system's merge rules, against a real Postgres (BACKEND_PLAN.md §7, §11).
 *
 * Deliberately not unit tests. What `monotonic` and `append-only` actually do is decided by an
 * `ON CONFLICT` clause and by the `set_server_seq()` trigger, both of which live in the database —
 * a stubbed driver would only assert the SQL string we wrote. So these run against the server named
 * by TEST_DATABASE_URL and skip themselves when nothing answers.
 */
import { createDb, pgSchema, syncMergeRules } from '@guitar/db';
import { env } from 'cloudflare:test';
import { and, eq, sql } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';

import { linkAnonymousUser } from '../src/link-anonymous';
import { mergeValuesSql } from '../src/sync/merge';

const { user, pathwayEnrollments, quizAttempts, sectionProgress } = pgSchema;

const db = createDb(env.TEST_DATABASE_URL);

const reachable = await db
  .execute(sql`select 1 from ${sectionProgress} limit 0`)
  .then(() => true)
  .catch(() => false);

if (!reachable) {
  console.warn(
    `Skipping learning-merge tests: no migrated database at ${env.TEST_DATABASE_URL}.\n` +
      'Run `pnpm db db:up && pnpm db db:migrate` to exercise them.',
  );
}

const EARLIER = '2026-08-01T10:00:00.000Z';
const LATER = '2026-08-01T11:00:00.000Z';
const SECTION = 'intervals-1';

describe.skipIf(!reachable)('learning merges', () => {
  const created: string[] = [];

  afterEach(async () => {
    for (const id of created.splice(0)) {
      await db.delete(user).where(eq(user.id, id));
    }
  });

  async function makeUser(isAnonymous = false): Promise<string> {
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

  async function mergeProgress(
    userId: string,
    row: { completed_at: string | null; best_score_pct: number | null; section_id?: string },
  ): Promise<void> {
    await db.execute(
      mergeValuesSql(sectionProgress, syncMergeRules.sectionProgress, [
        {
          user_id: userId,
          section_id: row.section_id ?? SECTION,
          completed_at: row.completed_at,
          best_score_pct: row.best_score_pct,
          deleted_at: null,
        },
      ]),
    );
  }

  async function progressOf(userId: string, sectionId = SECTION) {
    const [row] = await db
      .select()
      .from(sectionProgress)
      .where(and(eq(sectionProgress.userId, userId), eq(sectionProgress.sectionId, sectionId)));

    return row;
  }

  describe('section_progress — monotonic', () => {
    it('keeps the earlier completion, whichever order the two arrive in', async () => {
      const account = await makeUser();

      await mergeProgress(account, { completed_at: LATER, best_score_pct: null });
      await mergeProgress(account, { completed_at: EARLIER, best_score_pct: null });

      expect((await progressOf(account))?.completedAt?.toISOString()).toBe(EARLIER);
    });

    it('does not move a completion later', async () => {
      const account = await makeUser();

      await mergeProgress(account, { completed_at: EARLIER, best_score_pct: null });
      await mergeProgress(account, { completed_at: LATER, best_score_pct: null });

      expect((await progressOf(account))?.completedAt?.toISOString()).toBe(EARLIER);
    });

    it('keeps the best score, whichever order the two arrive in', async () => {
      const account = await makeUser();

      await mergeProgress(account, { completed_at: null, best_score_pct: 40 });
      await mergeProgress(account, { completed_at: null, best_score_pct: 90 });
      await mergeProgress(account, { completed_at: null, best_score_pct: 70 });

      expect((await progressOf(account))?.bestScorePct).toBe(90);
    });

    /** `least`/`greatest` ignore nulls, which is the behaviour the rule depends on. */
    it('does not let a null erase a recorded value', async () => {
      const account = await makeUser();

      await mergeProgress(account, { completed_at: EARLIER, best_score_pct: 80 });
      await mergeProgress(account, { completed_at: null, best_score_pct: null });

      expect(await progressOf(account)).toMatchObject({ bestScorePct: 80 });
      expect((await progressOf(account))?.completedAt?.toISOString()).toBe(EARLIER);
    });

    it('converges when the same push is replayed', async () => {
      const account = await makeUser();

      await mergeProgress(account, { completed_at: EARLIER, best_score_pct: 60 });
      const once = await progressOf(account);
      await mergeProgress(account, { completed_at: EARLIER, best_score_pct: 60 });

      expect(await progressOf(account)).toEqual(once);
    });

    /**
     * The `where` guard on the monotonic update. `set_server_seq()` fires on every UPDATE, so an
     * unguarded no-op merge would draw a fresh sequence value for an unchanged row and re-broadcast
     * it to every device — pull pages that grow forever with rows nobody changed.
     */
    it('does not bump server_seq when the merge changes nothing', async () => {
      const account = await makeUser();

      await mergeProgress(account, { completed_at: EARLIER, best_score_pct: 90 });
      const before = (await progressOf(account))?.serverSeq;

      await mergeProgress(account, { completed_at: LATER, best_score_pct: 30 });

      expect((await progressOf(account))?.serverSeq).toBe(before);
    });

    it('does bump server_seq when the merge does change something', async () => {
      const account = await makeUser();

      await mergeProgress(account, { completed_at: LATER, best_score_pct: 30 });
      const before = (await progressOf(account))?.serverSeq ?? 0;

      await mergeProgress(account, { completed_at: EARLIER, best_score_pct: 90 });

      expect((await progressOf(account))?.serverSeq).toBeGreaterThan(before);
    });
  });

  describe('quiz_attempts — append-only', () => {
    const ATTEMPT = '019400aa-0000-7000-8000-000000000001';

    async function mergeAttempt(userId: string, scorePct: number, attemptId = ATTEMPT) {
      await db.execute(
        mergeValuesSql(quizAttempts, syncMergeRules.quizAttempts, [
          {
            attempt_id: attemptId,
            user_id: userId,
            section_id: SECTION,
            score_pct: scorePct,
            passed: scorePct >= 80,
            answered_at: EARLIER,
            deleted_at: null,
          },
        ]),
      );
    }

    async function attemptOf(attemptId = ATTEMPT) {
      const [row] = await db
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.attemptId, attemptId));

      return row;
    }

    it('stores an attempt', async () => {
      const account = await makeUser();
      await mergeAttempt(account, 80);

      expect(await attemptOf()).toMatchObject({ scorePct: 80, passed: true });
    });

    /** The row is an immutable event: replaying its push must not rewrite what was recorded. */
    it('ignores a second write of the same attempt id', async () => {
      const account = await makeUser();
      await mergeAttempt(account, 80);
      const once = await attemptOf();

      await mergeAttempt(account, 10);

      expect(await attemptOf()).toEqual(once);
    });

    it('does not bump server_seq on the ignored write', async () => {
      const account = await makeUser();
      await mergeAttempt(account, 80);
      const before = (await attemptOf())?.serverSeq;

      await mergeAttempt(account, 80);

      expect((await attemptOf())?.serverSeq).toBe(before);
    });
  });

  describe('guest linking', () => {
    it('folds a guest’s progress into the account rather than replacing it', async () => {
      const guest = await makeUser(true);
      const account = await makeUser();

      await mergeProgress(guest, { completed_at: EARLIER, best_score_pct: 50 });
      await mergeProgress(account, { completed_at: LATER, best_score_pct: 90 });

      await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

      const merged = await progressOf(account);
      expect(merged?.completedAt?.toISOString()).toBe(EARLIER);
      expect(merged?.bestScorePct).toBe(90);
    });

    it('carries a guest’s attempts across', async () => {
      const guest = await makeUser(true);
      const account = await makeUser();
      const attemptId = crypto.randomUUID();

      await db.insert(quizAttempts).values({
        attemptId,
        userId: guest,
        sectionId: SECTION,
        scorePct: 70,
        passed: false,
        answeredAt: new Date(EARLIER),
      });

      await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

      const [carried] = await db
        .select()
        .from(quizAttempts)
        .where(and(eq(quizAttempts.userId, account), eq(quizAttempts.sectionId, SECTION)));

      expect(carried).toMatchObject({ scorePct: 70 });
    });

    it('takes the guest’s enrollment when the guest touched it later', async () => {
      const guest = await makeUser(true);
      const account = await makeUser();

      await db.insert(pathwayEnrollments).values({
        userId: account,
        pathwayId: 'fretboard',
        startedAt: new Date(EARLIER),
        lastActiveAt: new Date(EARLIER),
        clientUpdatedAt: new Date(EARLIER),
      });
      await db.insert(pathwayEnrollments).values({
        userId: guest,
        pathwayId: 'fretboard',
        startedAt: new Date(EARLIER),
        lastActiveAt: new Date(LATER),
        clientUpdatedAt: new Date(LATER),
      });

      await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

      const [row] = await db
        .select()
        .from(pathwayEnrollments)
        .where(
          and(
            eq(pathwayEnrollments.userId, account),
            eq(pathwayEnrollments.pathwayId, 'fretboard'),
          ),
        );

      expect(row?.lastActiveAt?.toISOString()).toBe(LATER);
    });

    /**
     * The monotonic fold has to raise `server_seq` or the account's other devices never learn that
     * the guest's earlier completion arrived — it would sort below their cursors forever.
     */
    it('lifts server_seq on a fold that changed the row', async () => {
      const guest = await makeUser(true);
      const account = await makeUser();

      await mergeProgress(guest, { completed_at: EARLIER, best_score_pct: null });
      await mergeProgress(account, { completed_at: LATER, best_score_pct: null });

      const before = (await progressOf(account))?.serverSeq ?? 0;
      await linkAnonymousUser({ db, anonymousUserId: guest, userId: account });

      expect((await progressOf(account))?.serverSeq).toBeGreaterThan(before);
    });
  });
});
