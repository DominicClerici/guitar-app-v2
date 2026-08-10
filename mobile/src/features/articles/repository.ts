import { parseArticleDocument, type ArticleDocument, type ArticleMeta } from '@/lib/articles';

import { BUNDLED_ARTICLES } from './content/manifest';

// The seam between screens and wherever articles actually come from. Screens
// only ever see this interface; when the backend starts serving articles, a
// remote implementation (fetch + cache) replaces the bundled one here and
// nothing above changes. Both methods validate at this boundary, so everything
// downstream can trust the data.

export interface ArticleRepository {
  /** Every article's meta, newest first — what a listing screen renders. */
  listArticles(): Promise<ArticleMeta[]>;
  /** One full article by slug. Rejects if it doesn't exist or doesn't parse. */
  getArticle(slug: string): Promise<ArticleDocument>;
}

export const articleRepository: ArticleRepository = {
  async listArticles() {
    return Object.values(BUNDLED_ARTICLES)
      .map((raw) => parseArticleDocument(raw).meta)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },

  async getArticle(slug) {
    const raw = BUNDLED_ARTICLES[slug];
    if (raw === undefined) throw new Error(`No article with slug "${slug}".`);
    return parseArticleDocument(raw);
  },
};
