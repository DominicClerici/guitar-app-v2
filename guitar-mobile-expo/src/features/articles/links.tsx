import { createContext, useContext } from 'react';

import type { Link } from '@/lib/articles';

// Spans deep inside blocks need to fire navigation without every block
// threading a handler down. The renderer provides one handler for the whole
// article; RichText consumes it.

export type LinkHandler = (link: Link) => void;

const ArticleLinkContext = createContext<LinkHandler>(() => {});

export const ArticleLinkProvider = ArticleLinkContext.Provider;

export function useArticleLink(): LinkHandler {
  return useContext(ArticleLinkContext);
}
