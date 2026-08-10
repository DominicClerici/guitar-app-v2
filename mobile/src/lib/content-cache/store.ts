/**
 * Reading and writing the device's content cache (BACKEND_PLAN.md §6, §8).
 *
 * Synchronous, like everything else that goes through SQLite here: a cached article is on screen on
 * the first frame, and only a genuine miss ever shows a loading state. That is the whole reason the
 * cache is a table rather than files.
 *
 * Nothing in this module fetches. It is the storage half; `manager.ts` decides what belongs here.
 */
import { cachedChapters, cachedCurriculum, cachedDocuments } from '@guitar/db/schema.sqlite';
import { and, eq, isNotNull, isNull, not, notInArray, or, type SQL } from 'drizzle-orm';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

import { db, type Database } from '@/lib/db/client';

export type Writer = Database | Parameters<Parameters<Database['transaction']>[0]>[0];

/**
 * Reserved scopes in `cached_curriculum`. Pathways are stored under their own slug; these two names
 * are not valid slugs, so they cannot collide with one.
 */
export const INDEX_SCOPE = 'index';
export const ARTICLES_SCOPE = 'articles';

export interface CachedDocument {
  slug: string;
  kind: string;
  version: string;
  /** Still JSON text — parsing is the repository's job, at the boundary where validation lives. */
  body: string;
}

export interface CachedChapter {
  pathwaySlug: string;
  chapterId: string;
}

/**
 * A document as it arrives from the server, ready to be stored.
 *
 * `body` is optional rather than required because that is what a `z.unknown()` field infers to —
 * `unknown` includes `undefined`, so the wire type cannot promise the key is present. Storing
 * `null` for a missing body keeps the column not-null and lets the parser at the repository
 * boundary reject it like any other malformed document.
 */
export interface StorableDocument {
  slug: string;
  kind: string;
  version: string;
  body?: unknown;
}

export function readDocument(slug: string, writer: Writer = db): CachedDocument | undefined {
  return writer
    .select({
      slug: cachedDocuments.slug,
      kind: cachedDocuments.kind,
      version: cachedDocuments.version,
      body: cachedDocuments.body,
    })
    .from(cachedDocuments)
    .where(eq(cachedDocuments.slug, slug))
    .get();
}

export function readCurriculum(
  scope: string,
  writer: Writer = db,
): { version: string; body: string } | undefined {
  return writer
    .select({ version: cachedCurriculum.version, body: cachedCurriculum.body })
    .from(cachedCurriculum)
    .where(eq(cachedCurriculum.scope, scope))
    .get();
}

/** The version the device holds for a chapter, which is what makes `unchanged` answerable. */
export function readChapterVersion(
  pathwaySlug: string,
  chapterId: string,
  writer: Writer = db,
): string | undefined {
  return writer
    .select({ version: cachedChapters.version })
    .from(cachedChapters)
    .where(
      and(eq(cachedChapters.pathwaySlug, pathwaySlug), eq(cachedChapters.chapterId, chapterId)),
    )
    .get()?.version;
}

/** Every chapter currently held, so the manager can work out what to fetch and what to drop. */
export function readCachedChapters(writer: Writer = db): CachedChapter[] {
  return writer
    .select({ pathwaySlug: cachedChapters.pathwaySlug, chapterId: cachedChapters.chapterId })
    .from(cachedChapters)
    .all();
}

export function writeCurriculum(
  scope: string,
  version: string,
  body: string,
  writer: Writer = db,
): void {
  const values = { scope, version, body, fetchedAt: new Date() };

  writer
    .insert(cachedCurriculum)
    .values(values)
    .onConflictDoUpdate({ target: cachedCurriculum.scope, set: values })
    .run();
}

/**
 * Stores a chapter's documents and its version together, in one transaction.
 *
 * Both or neither: a chapter recorded at a version whose documents did not all land would report
 * itself current on the next refresh and never fetch the missing ones again.
 */
export function writeChapter(
  pathwaySlug: string,
  chapterId: string,
  version: string,
  documents: readonly StorableDocument[],
): void {
  db.transaction((tx) => {
    for (const document of documents) {
      const values = {
        slug: document.slug,
        kind: document.kind,
        version: document.version,
        body: JSON.stringify(document.body ?? null),
        pathwaySlug,
        chapterId,
        fetchedAt: new Date(),
      };

      tx.insert(cachedDocuments)
        .values(values)
        .onConflictDoUpdate({ target: cachedDocuments.slug, set: values })
        .run();
    }

    const chapter = { pathwaySlug, chapterId, version, fetchedAt: new Date() };

    tx.insert(cachedChapters)
      .values(chapter)
      .onConflictDoUpdate({
        target: [cachedChapters.pathwaySlug, cachedChapters.chapterId],
        set: chapter,
      })
      .run();
  });
}

/** A standalone article from the library, which belongs to no chapter and is evicted separately. */
export function writeStandaloneDocument(document: StorableDocument, writer: Writer = db): void {
  const values = {
    slug: document.slug,
    kind: document.kind,
    version: document.version,
    body: JSON.stringify(document.body ?? null),
    pathwaySlug: null,
    chapterId: null,
    fetchedAt: new Date(),
  };

  writer
    .insert(cachedDocuments)
    .values(values)
    .onConflictDoUpdate({ target: cachedDocuments.slug, set: values })
    .run();
}

/**
 * Drops every cached chapter that is not in `keep`, and the documents that came with it.
 *
 * `keep` is the current chapter of each active pathway — at most three (§6). An empty `keep` means
 * every chapter goes, which is why the condition has to survive that case rather than collapsing
 * into "no filter, delete nothing".
 */
export function evictChaptersOutside(keep: readonly CachedChapter[]): void {
  /** Matches a row belonging to one of the chapters worth keeping. */
  const isKept = (pathway: AnySQLiteColumn, chapter: AnySQLiteColumn): SQL | undefined =>
    or(...keep.map((kept) => and(eq(pathway, kept.pathwaySlug), eq(chapter, kept.chapterId))));

  db.transaction((tx) => {
    const keptDocuments = isKept(cachedDocuments.pathwaySlug, cachedDocuments.chapterId);

    // `chapter_id is not null` is what spares the standalone library, which is evicted on its own
    // terms. Without it, emptying the pathway cache would also wipe every article the user has
    // read outside a pathway.
    tx.delete(cachedDocuments)
      .where(
        keptDocuments
          ? and(isNotNull(cachedDocuments.chapterId), not(keptDocuments))
          : isNotNull(cachedDocuments.chapterId),
      )
      .run();

    const keptChapters = isKept(cachedChapters.pathwaySlug, cachedChapters.chapterId);

    tx.delete(cachedChapters)
      .where(keptChapters ? not(keptChapters) : undefined)
      .run();
  });
}

/** Trims the standalone library, which has no chapter to be evicted along with. */
export function evictStandaloneDocumentsOutside(keepSlugs: readonly string[]): void {
  const standalone = isNull(cachedDocuments.chapterId);

  db.delete(cachedDocuments)
    .where(
      keepSlugs.length
        ? and(standalone, notInArray(cachedDocuments.slug, [...keepSlugs]))
        : standalone,
    )
    .run();
}

/** Drops everything, for the case where the curriculum moved far enough to distrust all of it. */
export function clearContentCache(): void {
  db.transaction((tx) => {
    tx.delete(cachedDocuments).run();
    tx.delete(cachedChapters).run();
    tx.delete(cachedCurriculum).run();
  });
}
