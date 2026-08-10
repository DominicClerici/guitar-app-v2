/**
 * The content API, against a real Postgres (BACKEND_PLAN.md §8, §11).
 *
 * What is worth testing here is not the SQL but the two things the device's cache depends on being
 * exactly right: that `unchanged` is answered when — and only when — the device is genuinely
 * current, and that a chapter returns every document it references in one response. Both are
 * derived from stored rows, so a stubbed database would prove nothing about either.
 */
import { createDb, pgSchema } from '@guitar/db';
import { curriculumIndexVersion } from '@guitar/shared';
import { env } from 'cloudflare:test';
import { eq, inArray, sql } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';

import type { Context } from '../src/trpc/context';
import { createCallerFactory } from '../src/trpc/init';
import { appRouter } from '../src/trpc/router';

const { contentDocuments, curriculumPathways } = pgSchema;

const db = createDb(env.TEST_DATABASE_URL);

const reachable = await db
  .execute(sql`select 1 from ${contentDocuments} limit 0`)
  .then(() => true)
  .catch(() => false);

if (!reachable) {
  console.warn(
    `Skipping content tests: no migrated database at ${env.TEST_DATABASE_URL}.\n` +
      'Run `pnpm db db:up && pnpm db db:migrate` to exercise them.',
  );
}

/**
 * Content is public, so the caller carries no session — which is itself part of the contract these
 * tests are asserting: a signed-out reader must still get the catalogue.
 */
const caller = createCallerFactory(appRouter)({
  db,
  getSession: async () => null,
} as unknown as Context);

const PATHWAY = 'test-pathway';
const ARTICLE = 'test-article';
const LOOSE_ARTICLE = 'test-loose-article';
const QUIZ = 'test-checkpoint';

function article(slug: string) {
  return {
    schemaVersion: 1,
    meta: {
      id: slug,
      slug,
      title: `Title ${slug}`,
      summary: 'Summary',
      tags: ['theory'],
      readingTimeMin: 4,
      publishedAt: '2026-08-01',
    },
    blocks: [{ type: 'paragraph', spans: [{ text: 'Body.' }] }],
  };
}

function pathwayBody() {
  return {
    id: PATHWAY,
    slug: PATHWAY,
    title: 'Test Pathway',
    summary: 'A pathway for tests.',
    tags: ['theory'],
    difficulty: 'intro',
    estimatedMin: 30,
    chapters: [
      {
        id: 'ch1',
        slug: 'ch1',
        title: 'Chapter One',
        sections: [
          { id: 'ch1.a', slug: 'a', title: 'A', kind: 'article', ref: ARTICLE },
          { id: 'ch1.mic', slug: 'mic', title: 'Play along', kind: 'activity', ref: 'nothing' },
        ],
        checkpoint: { ref: QUIZ, passThresholdPct: 80 },
      },
    ],
  };
}

describe.skipIf(!reachable)('content router', () => {
  afterEach(async () => {
    await db
      .delete(contentDocuments)
      .where(inArray(contentDocuments.slug, [ARTICLE, LOOSE_ARTICLE, QUIZ]));
    await db.delete(curriculumPathways).where(eq(curriculumPathways.slug, PATHWAY));
  });

  async function publish() {
    await db.insert(contentDocuments).values([
      { slug: ARTICLE, kind: 'article', version: 'a1', body: article(ARTICLE) },
      { slug: LOOSE_ARTICLE, kind: 'article', version: 'l1', body: article(LOOSE_ARTICLE) },
      {
        slug: QUIZ,
        kind: 'quiz',
        version: 'q1',
        body: {
          schemaVersion: 1,
          meta: {
            id: QUIZ,
            slug: QUIZ,
            title: 'Checkpoint',
            kind: 'checkpoint',
            passThresholdPct: 80,
          },
          questions: [],
        },
      },
    ]);

    await db
      .insert(curriculumPathways)
      .values({ slug: PATHWAY, version: 'p1', body: pathwayBody() });
  }

  describe('index', () => {
    it('lists pathway meta without dragging the whole tree along', async () => {
      await publish();

      const result = await caller.content.index({});

      expect(result.unchanged).toBe(false);
      if (result.unchanged) return;

      // Found by slug, not taken as the first: the real published curriculum shares this database.
      const mine = (result.content as { pathways: Record<string, unknown>[] }).pathways.find(
        (pathway) => pathway.slug === PATHWAY,
      );

      expect(mine).toMatchObject({ slug: PATHWAY, title: 'Test Pathway' });
      // The catalogue screen renders titles; sending every chapter would make it download the
      // entire curriculum to do it.
      expect(mine).not.toHaveProperty('chapters');
    });

    it('answers unchanged when the device is already current', async () => {
      await publish();

      const first = await caller.content.index({});
      if (first.unchanged) throw new Error('expected content on a first fetch');

      expect(await caller.content.index({ knownVersion: first.version })).toEqual({
        unchanged: true,
      });
    });

    /**
     * The version is derived from the pathways rather than stored, so republishing one has to move
     * it. A stored index that someone forgot to bump would leave every device believing it is
     * current forever.
     */
    it('changes version when a pathway underneath it is republished', async () => {
      await publish();
      const before = await caller.content.index({});
      if (before.unchanged) throw new Error('expected content');

      await db
        .update(curriculumPathways)
        .set({ version: 'p2' })
        .where(eq(curriculumPathways.slug, PATHWAY));

      const after = await caller.content.index({ knownVersion: before.version });
      expect(after.unchanged).toBe(false);
    });
  });

  describe('chapter', () => {
    it('returns every document the chapter references, in one response', async () => {
      await publish();

      const result = await caller.content.chapter({ pathwaySlug: PATHWAY, chapterId: 'ch1' });
      if (result.unchanged) throw new Error('expected content');

      // The article and the checkpoint quiz — the activity section references no document.
      expect(result.content.map((document) => document.slug).sort()).toEqual(
        [ARTICLE, QUIZ].sort(),
      );
    });

    it('includes the checkpoint quiz, not just the sections', async () => {
      await publish();

      const result = await caller.content.chapter({ pathwaySlug: PATHWAY, chapterId: 'ch1' });
      if (result.unchanged) throw new Error('expected content');

      expect(result.content.find((document) => document.slug === QUIZ)?.kind).toBe('quiz');
    });

    it('answers unchanged for a cached chapter', async () => {
      await publish();

      const first = await caller.content.chapter({ pathwaySlug: PATHWAY, chapterId: 'ch1' });
      if (first.unchanged) throw new Error('expected content');

      expect(
        await caller.content.chapter({
          pathwaySlug: PATHWAY,
          chapterId: 'ch1',
          knownVersion: first.version,
        }),
      ).toEqual({ unchanged: true });
    });

    /** A republished article must invalidate its chapter, or the device keeps serving the old one. */
    it('changes version when one of its documents is republished', async () => {
      await publish();
      const before = await caller.content.chapter({ pathwaySlug: PATHWAY, chapterId: 'ch1' });
      if (before.unchanged) throw new Error('expected content');

      await db
        .update(contentDocuments)
        .set({ version: 'a2' })
        .where(eq(contentDocuments.slug, ARTICLE));

      const after = await caller.content.chapter({
        pathwaySlug: PATHWAY,
        chapterId: 'ch1',
        knownVersion: before.version,
      });

      expect(after.unchanged).toBe(false);
    });

    it('rejects an unknown chapter rather than returning an empty one', async () => {
      await publish();

      await expect(
        caller.content.chapter({ pathwaySlug: PATHWAY, chapterId: 'nope' }),
      ).rejects.toThrow(/No chapter/);
    });
  });

  describe('articles', () => {
    /**
     * The library is "articles no pathway references", computed rather than stored — so a pathway
     * that starts referencing an article drops it from the library without a republish.
     */
    it('lists only articles no pathway references', async () => {
      await publish();

      const result = await caller.content.articles({});
      if (result.unchanged) throw new Error('expected content');

      const slugs = (result.content as { slug: string }[]).map((meta) => meta.slug);
      expect(slugs).toContain(LOOSE_ARTICLE);
      expect(slugs).not.toContain(ARTICLE);
    });

    it('does not list quizzes', async () => {
      await publish();

      const result = await caller.content.articles({});
      if (result.unchanged) throw new Error('expected content');

      expect((result.content as { slug: string }[]).map((meta) => meta.slug)).not.toContain(QUIZ);
    });
  });

  describe('document', () => {
    it('serves one document by slug', async () => {
      await publish();

      expect(await caller.content.document({ slug: LOOSE_ARTICLE })).toMatchObject({
        slug: LOOSE_ARTICLE,
        kind: 'article',
      });
    });

    it('rejects an unknown slug', async () => {
      await expect(caller.content.document({ slug: 'missing' })).rejects.toThrow(/No document/);
    });
  });

  describe('version derivation', () => {
    /** Order must not matter, or two servers listing the same rows would disagree on the version. */
    it('is independent of the order the rows arrive in', async () => {
      const forwards = await curriculumIndexVersion([
        { slug: 'a', version: '1' },
        { slug: 'b', version: '2' },
      ]);
      const backwards = await curriculumIndexVersion([
        { slug: 'b', version: '2' },
        { slug: 'a', version: '1' },
      ]);

      expect(forwards).toBe(backwards);
    });
  });
});
