// The article wire format — what the backend will serve and what authors write.
// This file is the contract: everything here is plain JSON-serializable data,
// versioned by `schemaVersion` on the document. The renderer consumes the
// *parsed* form, which differs in exactly one way: blocks the parser didn't
// recognise arrive as `UnknownBlock` placeholders instead of failing the
// document (see schema.ts for the forward-compatibility rules).

/** Named tones only — the renderer maps these to Aurora tokens. Never hex. */
export type ColorTone = 'accent' | 'amber' | 'rose' | 'violet';

export type Mark = 'bold' | 'italic' | 'code' | 'highlight' | { type: 'color'; tone: ColorTone };

export type Link =
  | { kind: 'article'; slug: string }
  | { kind: 'url'; url: string }
  | { kind: 'screen'; href: string }
  | { kind: 'footnote'; id: string };

/** The atom of rich text: a run of characters sharing the same formatting. */
export interface Span {
  text: string;
  marks?: Mark[];
  link?: Link;
}

export interface HeadingBlock {
  type: 'heading';
  /** 1 is a section, 2 a subsection, 3 a small mono label. The article title
      itself comes from meta, not a block. */
  level: 1 | 2 | 3;
  spans: Span[];
}

export interface ParagraphBlock {
  type: 'paragraph';
  spans: Span[];
}

export interface ListBlock {
  type: 'list';
  ordered: boolean;
  items: Span[][];
}

export type CalloutTone = 'info' | 'tip' | 'warning';

export interface CalloutBlock {
  type: 'callout';
  tone: CalloutTone;
  spans: Span[];
}

export interface QuoteBlock {
  type: 'quote';
  spans: Span[];
  attribution?: string;
}

export interface DividerBlock {
  type: 'divider';
}

export interface ImageBlock {
  type: 'image';
  url: string;
  /** width / height, so the layout reserves space before the image loads. */
  aspectRatio: number;
  alt: string;
  caption?: Span[];
}

export interface TableBlock {
  type: 'table';
  header?: Span[][];
  /** rows → cells → spans. Columns are sized equally. */
  rows: Span[][][];
}

/**
 * A live interactive component. Opaque at this layer on purpose: `props` is
 * validated by the component's own schema in the client registry, so adding a
 * new live component never changes the document schema.
 */
export interface LiveBlock {
  type: 'live';
  component: string;
  props: Record<string, unknown>;
}

/** Every block an author can write today. */
export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | CalloutBlock
  | QuoteBlock
  | DividerBlock
  | ImageBlock
  | TableBlock
  | LiveBlock;

/**
 * A block this build of the app doesn't understand — newer content on an older
 * client. Produced by the parser, never written by authors. The renderer shows
 * a graceful placeholder for it.
 */
export interface UnknownBlock {
  type: 'unknown';
  /** The original block's declared type, for logging and curiosity. */
  originalType: string;
}

/** What the renderer consumes: known blocks plus unknown-block placeholders. */
export type RenderBlock = Block | UnknownBlock;

export interface Footnote {
  id: string;
  spans: Span[];
}

/** Served in lists for the Learn tab; also embedded in each document. */
export interface ArticleMeta {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  readingTimeMin: number;
  /** ISO date, e.g. "2026-08-02". */
  publishedAt: string;
}

/** The parsed article a screen renders. */
export interface ArticleDocument {
  schemaVersion: number;
  meta: ArticleMeta;
  blocks: RenderBlock[];
  footnotes?: Footnote[];
}
