import { z } from 'zod';

// The curriculum wire format — the pathway tree that sequences articles, quizzes
// and activities into something a learner can work through, plus its parser.
//
// A pathway holds no content of its own: every section is a `ref`, the slug of
// an article or quiz document fetched separately. That keeps the tree small
// enough to ship as one list payload and lets content be re-ordered without
// touching the documents themselves.
//
// Forward compatibility follows the article rules (see schema.ts):
//   · A section whose `kind` this build doesn't know — or a known kind with an
//     unusable payload — becomes an `unknown` placeholder. It stays in the list
//     so chapter numbering is stable across app versions, but it is skippable
//     and never counted. This is what keeps a pathway that gained, say, a
//     microphone activity from bricking the whole chapter on an older app.
//   · Structural damage (bad pathway fields, a chapter that isn't a chapter, a
//     section without both a string id and a string kind) throws
//     CurriculumParseError — there is no partial form of a broken tree.

export class CurriculumParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CurriculumParseError';
  }
}

export type SectionKind = 'article' | 'quiz' | 'activity';

export type PathwayDifficulty = 'intro' | 'core' | 'advanced';

export interface CurriculumSection {
  id: string;
  slug: string;
  title: string;
  kind: SectionKind;
  /** Slug of the article or quiz document this section points at. */
  ref: string;
  /**
   * Excluded from progress denominators. This is how a section the app may not
   * be able to run — an activity needing hardware permission it hasn't got —
   * stays visible without ever blocking completion of the chapter.
   */
  optional?: boolean;
  estimatedMin?: number;
}

/**
 * A section this build can't open — newer content on an older client. Produced
 * by the parser, never authored.
 */
export interface UnknownSection {
  kind: 'unknown';
  id: string;
  /** The section's declared kind, for logging and curiosity. */
  originalKind: string;
}

/** What a pathway screen consumes: openable sections plus placeholders. */
export type RenderSection = CurriculumSection | UnknownSection;

export interface CurriculumChapter {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  sections: RenderSection[];
  /** The quiz that gates the end of the chapter, if it has one. */
  checkpoint?: {
    ref: string;
    passThresholdPct: number;
    /**
     * A one-line name for the quiz, shown on the pathway screen. Optional so an
     * older tree still parses; a chapter without one falls back to naming itself.
     */
    title?: string;
  };
}

export interface CurriculumPathway {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  difficulty: PathwayDifficulty;
  estimatedMin: number;
  chapters: CurriculumChapter[];
}

/** Served in lists: a pathway without the weight of its tree. */
export type PathwayMeta = Omit<CurriculumPathway, 'chapters'>;

export interface CurriculumIndex {
  /** Content revision, not a schema version — opaque, used for cache busting. */
  version: string;
  pathways: PathwayMeta[];
}

// ─ sections & chapters ─

const sectionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  kind: z.union([z.literal('article'), z.literal('quiz'), z.literal('activity')]),
  ref: z.string().min(1),
  optional: z.boolean().optional(),
  estimatedMin: z.number().positive().optional(),
});

function normalizeSection(raw: unknown, path: string): RenderSection {
  const known = sectionSchema.safeParse(raw);
  if (known.success) return known.data;

  const fields = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const { id, kind } = fields;
  if (typeof id === 'string' && id.length > 0 && typeof kind === 'string' && kind.length > 0) {
    return { kind: 'unknown', id, originalKind: kind };
  }

  throw new CurriculumParseError(`${path} is not an object with string "id" and "kind".`);
}

const chapterSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  sections: z.array(z.unknown()),
  checkpoint: z
    .object({
      ref: z.string().min(1),
      passThresholdPct: z.number().min(0).max(100),
      title: z.string().min(1).optional(),
    })
    .optional(),
});

function sanitizeChapter(wire: z.infer<typeof chapterSchema>, index: number): CurriculumChapter {
  return {
    id: wire.id,
    slug: wire.slug,
    title: wire.title,
    ...(wire.summary !== undefined && { summary: wire.summary }),
    sections: wire.sections.map((section, position) =>
      normalizeSection(section, `Chapter ${index} section ${position}`),
    ),
    ...(wire.checkpoint && { checkpoint: wire.checkpoint }),
  };
}

// ─ pathways & index ─

const pathwayMetaSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  tags: z.array(z.string()),
  difficulty: z.union([z.literal('intro'), z.literal('core'), z.literal('advanced')]),
  estimatedMin: z.number().positive(),
});

const pathwaySchema = pathwayMetaSchema.extend({ chapters: z.array(chapterSchema) });

const indexSchema = z.object({
  version: z.string().min(1),
  pathways: z.array(pathwayMetaSchema),
});

function describe(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
}

export function parseCurriculumPathway(data: unknown): CurriculumPathway {
  const result = pathwaySchema.safeParse(data);
  if (!result.success) {
    throw new CurriculumParseError(`Invalid pathway — ${describe(result.error)}`);
  }

  const { chapters, ...meta } = result.data;
  return { ...meta, chapters: chapters.map(sanitizeChapter) };
}

export function parseCurriculumIndex(data: unknown): CurriculumIndex {
  const result = indexSchema.safeParse(data);
  if (!result.success) {
    throw new CurriculumParseError(`Invalid curriculum index — ${describe(result.error)}`);
  }
  return result.data;
}

/**
 * The sections a chapter's progress is measured against: openable and not
 * optional. Counting `chapter.sections` directly would make a chapter that
 * gained a section type unfinishable on older apps — the same trap
 * `gradableQuestions` avoids for quizzes.
 */
export function countedSections(chapter: CurriculumChapter): CurriculumSection[] {
  return chapter.sections.filter(
    (section): section is CurriculumSection => section.kind !== 'unknown' && !section.optional,
  );
}
