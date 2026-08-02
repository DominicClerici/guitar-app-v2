// The article wire format and its parser — the contract between the app, the
// bundled content, and (eventually) the backend. Pure data and validation, no
// React, no native modules: the renderer and repository live in
// src/features/articles. See docs/articles.md for how to author content.

export { ArticleParseError, parseArticleDocument, parseArticleMeta, SCHEMA_VERSION } from './schema';
export type {
  ArticleDocument,
  ArticleMeta,
  Block,
  CalloutBlock,
  CalloutTone,
  ColorTone,
  DividerBlock,
  Footnote,
  HeadingBlock,
  ImageBlock,
  Link,
  ListBlock,
  LiveBlock,
  Mark,
  ParagraphBlock,
  QuoteBlock,
  RenderBlock,
  Span,
  TableBlock,
  UnknownBlock,
} from './types';
