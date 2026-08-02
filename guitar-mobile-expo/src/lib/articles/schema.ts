import { z } from 'zod';

import type {
  ArticleDocument,
  ArticleMeta,
  Block,
  ColorTone,
  Footnote,
  Link,
  Mark,
  RenderBlock,
  Span,
} from './types';

// Parsing and validation for the article wire format, applied once at the
// repository boundary so the renderer never sees invalid data.
//
// Forward compatibility is the point of the design, so the rules are explicit:
//   · An unknown block type (or a known type whose payload doesn't validate)
//     becomes an `unknown` placeholder block — the rest of the article renders.
//   · An unknown mark, or a link of an unknown kind, is silently dropped from
//     its span — the text still renders.
//   · Anything structurally wrong with the document itself (bad meta, blocks
//     not an array, unsupported schemaVersion) throws ArticleParseError —
//     there is no sensible partial rendering of a document we can't trust.

/** The one version this build understands. Bumped only on breaking changes. */
export const SCHEMA_VERSION = 1;

export class ArticleParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArticleParseError';
  }
}

// ─ spans ─
// Marks and links are validated permissively here (any array / any value) so a
// span carrying a future mark doesn't fail its whole block; sanitizeSpan then
// keeps only what this build understands.

const spanSchema = z.object({
  text: z.string(),
  marks: z.array(z.unknown()).optional(),
  link: z.unknown().optional(),
});

type WireSpan = z.infer<typeof spanSchema>;

const linkSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('article'), slug: z.string() }),
  z.object({ kind: z.literal('url'), url: z.string() }),
  z.object({ kind: z.literal('screen'), href: z.string() }),
  z.object({ kind: z.literal('footnote'), id: z.string() }),
]);

const STRING_MARKS = new Set(['bold', 'italic', 'code', 'highlight']);
const COLOR_TONES = new Set<string>(['accent', 'amber', 'rose', 'violet']);

function asMark(raw: unknown): Mark | null {
  if (typeof raw === 'string' && STRING_MARKS.has(raw)) return raw as Mark;
  if (
    typeof raw === 'object' &&
    raw !== null &&
    (raw as { type?: unknown }).type === 'color' &&
    typeof (raw as { tone?: unknown }).tone === 'string' &&
    COLOR_TONES.has((raw as { tone: string }).tone)
  ) {
    return { type: 'color', tone: (raw as { tone: string }).tone as ColorTone };
  }
  return null;
}

function sanitizeSpan(wire: WireSpan): Span {
  const span: Span = { text: wire.text };

  if (wire.marks) {
    const marks = wire.marks.map(asMark).filter((mark): mark is Mark => mark !== null);
    if (marks.length) span.marks = marks;
  }

  if (wire.link !== undefined) {
    const link = linkSchema.safeParse(wire.link);
    if (link.success) span.link = link.data as Link;
  }

  return span;
}

const sanitizeSpans = (spans: WireSpan[]): Span[] => spans.map(sanitizeSpan);

// ─ blocks ─

const blockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('heading'),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    spans: z.array(spanSchema),
  }),
  z.object({ type: z.literal('paragraph'), spans: z.array(spanSchema) }),
  z.object({
    type: z.literal('list'),
    ordered: z.boolean(),
    items: z.array(z.array(spanSchema)),
  }),
  z.object({
    type: z.literal('callout'),
    tone: z.union([z.literal('info'), z.literal('tip'), z.literal('warning')]),
    spans: z.array(spanSchema),
  }),
  z.object({
    type: z.literal('quote'),
    spans: z.array(spanSchema),
    attribution: z.string().optional(),
  }),
  z.object({ type: z.literal('divider') }),
  z.object({
    type: z.literal('image'),
    url: z.string(),
    aspectRatio: z.number().positive(),
    alt: z.string(),
    caption: z.array(spanSchema).optional(),
  }),
  z.object({
    type: z.literal('table'),
    header: z.array(z.array(spanSchema)).optional(),
    rows: z.array(z.array(z.array(spanSchema))),
  }),
  z.object({
    type: z.literal('live'),
    component: z.string(),
    props: z.record(z.string(), z.unknown()),
  }),
]);

type WireBlock = z.infer<typeof blockSchema>;

function sanitizeBlock(wire: WireBlock): Block {
  switch (wire.type) {
    case 'heading':
      return { type: 'heading', level: wire.level, spans: sanitizeSpans(wire.spans) };
    case 'paragraph':
      return { type: 'paragraph', spans: sanitizeSpans(wire.spans) };
    case 'list':
      return { type: 'list', ordered: wire.ordered, items: wire.items.map(sanitizeSpans) };
    case 'callout':
      return { type: 'callout', tone: wire.tone, spans: sanitizeSpans(wire.spans) };
    case 'quote':
      return {
        type: 'quote',
        spans: sanitizeSpans(wire.spans),
        ...(wire.attribution !== undefined && { attribution: wire.attribution }),
      };
    case 'divider':
      return { type: 'divider' };
    case 'image':
      return {
        type: 'image',
        url: wire.url,
        aspectRatio: wire.aspectRatio,
        alt: wire.alt,
        ...(wire.caption && { caption: sanitizeSpans(wire.caption) }),
      };
    case 'table':
      return {
        type: 'table',
        ...(wire.header && { header: wire.header.map(sanitizeSpans) }),
        rows: wire.rows.map((row) => row.map(sanitizeSpans)),
      };
    case 'live':
      return { type: 'live', component: wire.component, props: wire.props };
  }
}

function normalizeBlock(raw: unknown, index: number): RenderBlock {
  const known = blockSchema.safeParse(raw);
  if (known.success) return sanitizeBlock(known.data);

  // Not a shape this build knows. If it at least declares a type, it's future
  // content — placeholder. If it doesn't, the document is corrupt.
  const declared =
    typeof raw === 'object' && raw !== null ? (raw as { type?: unknown }).type : undefined;
  if (typeof declared === 'string') return { type: 'unknown', originalType: declared };

  throw new ArticleParseError(`Block ${index} is not an object with a string "type".`);
}

// ─ meta & document ─

const metaSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  tags: z.array(z.string()),
  readingTimeMin: z.number().positive(),
  publishedAt: z.string().min(1),
});

const footnoteSchema = z.object({ id: z.string().min(1), spans: z.array(spanSchema) });

const documentSchema = z.object({
  schemaVersion: z.number(),
  meta: metaSchema,
  blocks: z.array(z.unknown()),
  footnotes: z.array(footnoteSchema).optional(),
});

function describe(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
}

export function parseArticleMeta(data: unknown): ArticleMeta {
  const result = metaSchema.safeParse(data);
  if (!result.success) throw new ArticleParseError(`Invalid article meta — ${describe(result.error)}`);
  return result.data;
}

export function parseArticleDocument(data: unknown): ArticleDocument {
  const result = documentSchema.safeParse(data);
  if (!result.success) {
    throw new ArticleParseError(`Invalid article document — ${describe(result.error)}`);
  }

  const { schemaVersion, meta, blocks, footnotes } = result.data;
  if (schemaVersion !== SCHEMA_VERSION) {
    throw new ArticleParseError(
      `Unsupported schemaVersion ${schemaVersion} (this build reads ${SCHEMA_VERSION}).`,
    );
  }

  const document: ArticleDocument = {
    schemaVersion,
    meta,
    blocks: blocks.map(normalizeBlock),
  };

  if (footnotes) {
    document.footnotes = footnotes.map((note): Footnote => ({
      id: note.id,
      spans: sanitizeSpans(note.spans),
    }));
  }

  return document;
}
