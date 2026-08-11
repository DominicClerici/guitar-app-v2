import {
  parseActivityDocument,
  parseArticleDocument,
  parseArticleMeta,
  parseCurriculumIndex,
  parseCurriculumPathway,
  parseQuizDocument,
  type ActivityDocument,
  type ArticleDocument,
  type ArticleMeta,
  type CurriculumIndex,
  type CurriculumPathway,
  type QuizDocument,
} from '@/lib/content';
import {
  ARTICLES_SCOPE,
  ContentUnavailableError,
  fetchStandaloneDocument,
  INDEX_SCOPE,
  readCurriculum,
  readDocument,
  refreshArticles,
  refreshIndex,
  refreshPathway,
} from '@/lib/content-cache';

// The seam between screens and wherever content actually comes from. Screens only ever see this
// interface. Everything is read from the device cache first, so a document already on the device is
// returned without a request — which is what lets a reader keep reading offline — and only a
// genuine miss reaches the network.
//
// Validation happens here, at the boundary, rather than on the wire. This is where the
// forward-compatibility rules belong: a document written by a newer build degrades into
// placeholders instead of failing the screen. See docs/articles.md.

export interface ContentRepository {
  /** The standalone article library, newest first — articles no pathway references. */
  listArticles(): Promise<ArticleMeta[]>;
  getArticle(slug: string): Promise<ArticleDocument>;
  getQuiz(slug: string): Promise<QuizDocument>;
  getActivity(slug: string): Promise<ActivityDocument>;
  getCurriculumIndex(): Promise<CurriculumIndex>;
  getPathway(slug: string): Promise<CurriculumPathway>;
}

/**
 * Reads a cached document, fetching it once if it is missing.
 *
 * The fetch is the standalone path. A document inside a chapter is put there by the cache manager
 * as a whole chapter, so reaching this for one means that chapter has not landed yet — fetching the
 * single document is still the right answer, and faster than waiting for the chapter to arrive.
 */
async function loadDocument(slug: string): Promise<unknown> {
  const cached = readDocument(slug);
  if (cached) return JSON.parse(cached.body);

  await fetchStandaloneDocument(slug);

  const fetched = readDocument(slug);
  if (!fetched) throw new ContentUnavailableError(slug);

  return JSON.parse(fetched.body);
}

/** Reads a cached curriculum scope, refreshing once if the device has never held it. */
async function loadCurriculum(scope: string, refresh: () => Promise<void>): Promise<unknown> {
  const cached = readCurriculum(scope);
  if (cached) return JSON.parse(cached.body);

  await refresh();

  const fetched = readCurriculum(scope);
  if (!fetched) throw new ContentUnavailableError(scope);

  return JSON.parse(fetched.body);
}

export const contentRepository: ContentRepository = {
  async listArticles() {
    const listing = (await loadCurriculum(ARTICLES_SCOPE, refreshArticles)) as unknown[];

    return listing
      .map((raw) => parseArticleMeta(raw))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },

  async getArticle(slug) {
    return parseArticleDocument(await loadDocument(slug));
  },

  async getQuiz(slug) {
    return parseQuizDocument(await loadDocument(slug));
  },

  async getActivity(slug) {
    return parseActivityDocument(await loadDocument(slug));
  },

  async getCurriculumIndex() {
    return parseCurriculumIndex(await loadCurriculum(INDEX_SCOPE, refreshIndex));
  },

  async getPathway(slug) {
    return parseCurriculumPathway(await loadCurriculum(slug, () => refreshPathway(slug)));
  },
};
