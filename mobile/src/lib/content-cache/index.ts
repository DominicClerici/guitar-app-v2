// The device's content cache (BACKEND_PLAN.md §6, §8): what has been fetched, and what should be.
//
// `store.ts` is the storage half — synchronous SQLite reads, so a cached article renders on the
// first frame. `manager.ts` is the policy half — the current chapter of each active pathway, at
// most three, fetched whole and evicted whole.

export {
  ARTICLES_SCOPE,
  INDEX_SCOPE,
  clearContentCache,
  evictChaptersOutside,
  evictStandaloneDocumentsOutside,
  readCachedChapters,
  readChapterVersion,
  readCurriculum,
  readDocument,
  writeChapter,
  writeCurriculum,
  writeStandaloneDocument,
  type CachedChapter,
  type CachedDocument,
} from './store';

export {
  ContentUnavailableError,
  fetchStandaloneDocument,
  isCached,
  reconcileCache,
  refreshArticles,
  refreshChapter,
  refreshIndex,
  refreshPathway,
  setContentClient,
  trimStandaloneLibrary,
} from './manager';

export { ContentProvider } from './provider';
