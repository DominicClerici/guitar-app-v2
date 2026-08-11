/**
 * `content.index`, `content.pathway` and `content.chapter` — how published content reaches a device
 * (BACKEND_PLAN.md §8).
 *
 * Public procedures. Nothing here is per-user, and requiring a session would spend a lookup
 * protecting text the app shows to anyone who opens it.
 *
 * All three are version-conditional: the device sends what it already holds and gets `unchanged`
 * back when it matches. That is what stops a launch-time refresh of three cached chapters from
 * re-downloading them, which on the free tier is Neon compute rather than merely bandwidth.
 */
import { pgSchema } from '@guitar/db';
import {
  contentArticlesInput,
  contentArticlesResult,
  contentChapterInput,
  contentChapterResult,
  contentDocumentInput,
  contentDocumentPayload,
  contentIndexInput,
  contentIndexResult,
  contentPathwayInput,
  contentPathwayResult,
  curriculumIndexVersion,
  parseCurriculumPathway,
  type ArticleDocument,
  type CurriculumPathway,
} from '@guitar/shared';
import { TRPCError } from '@trpc/server';
import { asc, eq, inArray } from 'drizzle-orm';

import { publicProcedure, router } from '../trpc/init';

const { contentDocuments, curriculumPathways } = pgSchema;

/** Answered without a payload when the device is already current. */
const UNCHANGED = { unchanged: true } as const;

const DOCUMENT_KINDS = ['article', 'quiz', 'activity'] as const;
type DocumentKind = (typeof DOCUMENT_KINDS)[number];

/**
 * `content_documents.kind` is a text column so that adding a kind is not a migration, which leaves
 * this server free to read a row whose kind the wire contract does not name yet.
 *
 * Narrowed rather than coerced to a default: labelling a rhythm drill an article would hand the
 * device something it will try to render as prose, which is worse than not serving it at all. A row
 * this build cannot name is content published by a newer publisher, and the honest answer is that
 * it is not available here.
 */
const documentKind = (kind: string): DocumentKind | undefined =>
  DOCUMENT_KINDS.find((known) => known === kind);

export const contentRouter = router({
  /**
   * Every pathway's meta, newest first, plus a version derived from the pathways themselves.
   *
   * Derived rather than stored: an index row would need a second write on every publish, and a
   * publish that updated a pathway but failed to bump a stored index would leave every device
   * believing it was current.
   */
  index: publicProcedure
    .input(contentIndexInput)
    .output(contentIndexResult)
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          slug: curriculumPathways.slug,
          version: curriculumPathways.version,
          body: curriculumPathways.body,
        })
        .from(curriculumPathways)
        .orderBy(asc(curriculumPathways.slug));

      const version = await curriculumIndexVersion(rows);
      if (input.knownVersion === version) return UNCHANGED;

      // The index carries meta only. Sending every pathway's full chapter tree here would make the
      // catalogue screen download the whole curriculum to render a list of titles.
      const pathways = rows.map((row) => {
        const { chapters: _chapters, ...meta } = row.body as CurriculumPathway;

        return meta;
      });

      return { unchanged: false, version, content: { version, pathways } };
    }),

  /**
   * Every article no pathway references — the standalone library the Learn tab lists separately.
   *
   * Computed rather than stored: whether an article is standalone is a fact about its relationship
   * to the curriculum, so a pathway that starts referencing it should drop it from the library
   * without that article being republished. The catalogue is small enough that reading the pathway
   * bodies to find out costs less than a column that can go stale.
   */
  articles: publicProcedure
    .input(contentArticlesInput)
    .output(contentArticlesResult)
    .query(async ({ ctx, input }) => {
      const [documents, pathways] = await ctx.db.batch([
        ctx.db
          .select({
            slug: contentDocuments.slug,
            version: contentDocuments.version,
            body: contentDocuments.body,
            kind: contentDocuments.kind,
          })
          .from(contentDocuments)
          .orderBy(asc(contentDocuments.slug)),
        ctx.db.select({ body: curriculumPathways.body }).from(curriculumPathways),
      ]);

      const referenced = new Set<string>();

      for (const pathway of pathways) {
        for (const chapter of (pathway.body as CurriculumPathway).chapters ?? []) {
          for (const section of chapter.sections ?? []) {
            if ('ref' in section) referenced.add(section.ref);
          }
          if (chapter.checkpoint) referenced.add(chapter.checkpoint.ref);
        }
      }

      const standalone = documents.filter(
        (document) => document.kind === 'article' && !referenced.has(document.slug),
      );

      const version = await curriculumIndexVersion(standalone);
      if (input.knownVersion === version) return UNCHANGED;

      return {
        unchanged: false,
        version,
        content: standalone.map((document) => (document.body as ArticleDocument).meta),
      };
    }),

  /** One document by slug, for a standalone article opened outside any chapter. */
  document: publicProcedure
    .input(contentDocumentInput)
    .output(contentDocumentPayload)
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({
          slug: contentDocuments.slug,
          kind: contentDocuments.kind,
          version: contentDocuments.version,
          body: contentDocuments.body,
        })
        .from(contentDocuments)
        .where(eq(contentDocuments.slug, input.slug));

      if (!row) throw new TRPCError({ code: 'NOT_FOUND', message: `No document "${input.slug}".` });

      const kind = documentKind(row.kind);
      if (!kind) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Document "${input.slug}" is kind "${row.kind}", which this server cannot serve.`,
        });
      }

      return { slug: row.slug, kind, version: row.version, body: row.body };
    }),

  /** One pathway's full chapter and section tree. */
  pathway: publicProcedure
    .input(contentPathwayInput)
    .output(contentPathwayResult)
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ version: curriculumPathways.version, body: curriculumPathways.body })
        .from(curriculumPathways)
        .where(eq(curriculumPathways.slug, input.slug));

      if (!row) throw new TRPCError({ code: 'NOT_FOUND', message: `No pathway "${input.slug}".` });
      if (input.knownVersion === row.version) return UNCHANGED;

      return { unchanged: false, version: row.version, content: row.body };
    }),

  /**
   * Every document one chapter references, in one response.
   *
   * Shaped like the device's cache unit rather than like the data model (§6): a chapter is what is
   * cached and what is evicted, so it should also be what is fetched. Asking per slug would cost
   * one round trip per section on exactly the connections that make an offline cache worth having.
   *
   * The version is the chapter's own — the hash of its documents' versions — so a chapter whose
   * article was republished refetches while its neighbours do not.
   */
  chapter: publicProcedure
    .input(contentChapterInput)
    .output(contentChapterResult)
    .query(async ({ ctx, input }) => {
      const [pathway] = await ctx.db
        .select({ body: curriculumPathways.body })
        .from(curriculumPathways)
        .where(eq(curriculumPathways.slug, input.pathwaySlug));

      if (!pathway) {
        throw new TRPCError({ code: 'NOT_FOUND', message: `No pathway "${input.pathwaySlug}".` });
      }

      const parsed = parseCurriculumPathway(pathway.body);
      const chapter = parsed.chapters.find((candidate) => candidate.id === input.chapterId);

      if (!chapter) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No chapter "${input.chapterId}" in "${input.pathwaySlug}".`,
        });
      }

      // Every section that names a document, which is all of them now that an activity is one too.
      // A chapter is the device's cache unit, so a section left out here is a section that only
      // works online. The exception is an unknown-kind section — one this build of the server does
      // not understand, and has no ref it can trust — which must not stop the rest being cached.
      const slugs = chapter.sections.flatMap((section) =>
        section.kind === 'unknown' ? [] : [section.ref],
      );

      if (chapter.checkpoint) slugs.push(chapter.checkpoint.ref);

      if (!slugs.length) {
        return { unchanged: false, version: EMPTY_CHAPTER_VERSION, content: [] };
      }

      const rows = await ctx.db
        .select({
          slug: contentDocuments.slug,
          kind: contentDocuments.kind,
          version: contentDocuments.version,
          body: contentDocuments.body,
        })
        .from(contentDocuments)
        .where(inArray(contentDocuments.slug, slugs))
        .orderBy(asc(contentDocuments.slug));

      const version = await curriculumIndexVersion(rows);
      if (input.knownVersion === version) return UNCHANGED;

      return {
        unchanged: false,
        version,
        // A section pointing at a slug that was never published is dropped rather than fatal: the
        // publish script is what guarantees referential integrity, and a chapter that lost one
        // document should still be readable up to it. A row whose kind this build cannot name is
        // dropped for the same reason — but it still counts toward the version above, so the
        // chapter refetches once this server learns the kind.
        content: rows.flatMap((row) => {
          const kind = documentKind(row.kind);

          return kind ? [{ slug: row.slug, kind, version: row.version, body: row.body }] : [];
        }),
      };
    }),
});

/**
 * A chapter with nothing to fetch still needs a stable version, or the device would treat every
 * refresh of it as a change. Constant because the only content it has is its absence.
 */
const EMPTY_CHAPTER_VERSION = 'empty';
