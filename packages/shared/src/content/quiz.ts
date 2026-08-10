import { z } from 'zod';

import { normalizeBlocks, sanitizeSpans, spanSchema } from './schema';
import type { RenderBlock, Span } from './types';

// The quiz wire format — types, validation, and the same forward-compatibility
// posture as the article schema, for the same reason: content ships ahead of the
// app, and an old build must still be able to sit a quiz that grew a question
// type it has never heard of.
//
// The rules, mirroring schema.ts:
//   · An unknown question kind (or a known kind whose payload doesn't validate,
//     including one that is unanswerable — an answer id matching no option)
//     becomes an `unknown` placeholder question. It is shown as a skipped card
//     and, crucially, is excluded from `gradableQuestions`, so it never lands in
//     the denominator and can never keep a learner below the pass threshold.
//   · Rich text inside a question follows the article rules (unknown marks and
//     links dropped) because it goes through the same sanitizer.
//   · Structural damage (bad meta, `questions` not an array, a question without
//     a string id, unsupported schemaVersion) throws QuizParseError — a quiz we
//     can't trust has no sensible partial form; a wrong score is worse than an
//     error state.

/** The one version this build understands. Bumped only on breaking changes. */
export const QUIZ_SCHEMA_VERSION = 1;

export class QuizParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizParseError';
  }
}

/**
 * A standalone quiz versus the gate at the end of a curriculum chapter. Only
 * the surrounding flow differs — a checkpoint is a quiz whose result unlocks
 * something — so the document shape is deliberately identical.
 */
export type QuizKind = 'quiz' | 'checkpoint';

export interface QuizMeta {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  kind: QuizKind;
  /** Percentage of gradable questions required to pass, 0–100. */
  passThresholdPct: number;
}

/** One selectable answer. `id` is the wire-stable handle the answer refers to. */
export interface QuizOption {
  id: string;
  spans: Span[];
}

/**
 * What a `listen` question plays. A union with a single arm today so that a
 * future source (a recorded sample, a generated progression) is an added arm
 * rather than a schema break — an old build normalizes the unrecognised arm
 * away into an unknown question and carries on.
 */
export type AudioSpec = {
  kind: 'notes';
  /** Scientific pitch notation, e.g. "A3" — the pluck engine's own vocabulary. */
  notes: string[];
  mode: 'sequence' | 'chord';
  /** Gap between notes in sequence mode; the player picks a default when absent. */
  tempoMs?: number;
};

/** Every question carries these, whatever its kind. */
export interface QuestionBase {
  id: string;
  prompt: Span[];
  /**
   * Optional block content shown above the prompt (a table of intervals, a live
   * component to poke at). Parsed rather than authored form — a setup block this
   * build doesn't know degrades to a placeholder instead of costing the learner
   * a whole question.
   */
  setup?: RenderBlock[];
  /** Revealed after answering. */
  explanation?: Span[];
}

export interface ChoiceQuestion extends QuestionBase {
  kind: 'choice';
  options: QuizOption[];
  answerId: string;
}

/** Graded all-or-nothing: a partially correct selection scores zero. */
export interface MultiSelectQuestion extends QuestionBase {
  kind: 'multi-select';
  options: QuizOption[];
  answerIds: string[];
}

export interface ListenQuestion extends QuestionBase {
  kind: 'listen';
  audio: AudioSpec;
  options: QuizOption[];
  answerId: string;
}

export interface FretPosition {
  /** 1 = high E, counting toward the low string, as everywhere else in the app. */
  string: number;
  /** 0 = open. */
  fret: number;
}

export interface FretboardQuestion extends QuestionBase {
  kind: 'fretboard';
  /** How many frets the answer board shows. */
  frets: number;
  answer: FretPosition[];
}

/** Every question kind this build can grade. */
export type Question = ChoiceQuestion | MultiSelectQuestion | ListenQuestion | FretboardQuestion;

/**
 * A question this build can't grade — newer content on an older client.
 * Produced by the parser, never authored. Kept in the list (rather than spliced
 * out) so question numbering still matches across app versions.
 */
export interface UnknownQuestion {
  kind: 'unknown';
  id: string;
}

/** What a quiz screen consumes: gradable questions plus placeholders. */
export type RenderQuestion = Question | UnknownQuestion;

export interface QuizDocument {
  schemaVersion: number;
  meta: QuizMeta;
  questions: RenderQuestion[];
}

// ─ questions ─

const optionSchema = z.object({ id: z.string().min(1), spans: z.array(spanSchema) });

// `setup` is validated as opaque here and normalized later, so a future block
// type inside it can't fail the question it belongs to.
const questionBaseShape = {
  id: z.string().min(1),
  prompt: z.array(spanSchema),
  setup: z.array(z.unknown()).optional(),
  explanation: z.array(spanSchema).optional(),
};

const audioSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('notes'),
    notes: z.array(z.string().min(1)).min(1),
    mode: z.union([z.literal('sequence'), z.literal('chord')]),
    tempoMs: z.number().positive().optional(),
  }),
]);

const questionSchema = z.discriminatedUnion('kind', [
  z.object({
    ...questionBaseShape,
    kind: z.literal('choice'),
    options: z.array(optionSchema).min(2),
    answerId: z.string().min(1),
  }),
  z.object({
    ...questionBaseShape,
    kind: z.literal('multi-select'),
    options: z.array(optionSchema).min(2),
    answerIds: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    ...questionBaseShape,
    kind: z.literal('listen'),
    audio: audioSchema,
    options: z.array(optionSchema).min(2),
    answerId: z.string().min(1),
  }),
  z.object({
    ...questionBaseShape,
    kind: z.literal('fretboard'),
    frets: z.number().int().positive(),
    answer: z
      .array(z.object({ string: z.number().int().positive(), fret: z.number().int().min(0) }))
      .min(1),
  }),
]);

type WireQuestion = z.infer<typeof questionSchema>;

function sanitizeBase(wire: WireQuestion): QuestionBase {
  return {
    id: wire.id,
    prompt: sanitizeSpans(wire.prompt),
    ...(wire.setup && { setup: normalizeBlocks(wire.setup) }),
    ...(wire.explanation && { explanation: sanitizeSpans(wire.explanation) }),
  };
}

/**
 * Answer ids are validated against the options here rather than in zod: a
 * cross-field check is exactly the kind of "known kind, unusable payload" that
 * should degrade one question, and normalizeQuestion already turns a throw into
 * a placeholder. An answer pointing at no option is ungradable, so shipping it
 * as a real question would silently mark every learner wrong.
 */
function requireAnswerable(ids: string[], options: QuizOption[], questionId: string): void {
  const known = new Set(options.map((option) => option.id));
  for (const id of ids) {
    if (!known.has(id)) {
      throw new QuizParseError(`Question ${questionId} answers with unknown option "${id}".`);
    }
  }
}

const sanitizeOption = (wire: z.infer<typeof optionSchema>): QuizOption => ({
  id: wire.id,
  spans: sanitizeSpans(wire.spans),
});

function sanitizeQuestion(wire: WireQuestion): Question {
  const base = sanitizeBase(wire);

  switch (wire.kind) {
    case 'choice': {
      const options = wire.options.map(sanitizeOption);
      requireAnswerable([wire.answerId], options, wire.id);
      return { ...base, kind: 'choice', options, answerId: wire.answerId };
    }
    case 'multi-select': {
      const options = wire.options.map(sanitizeOption);
      requireAnswerable(wire.answerIds, options, wire.id);
      return { ...base, kind: 'multi-select', options, answerIds: wire.answerIds };
    }
    case 'listen': {
      const options = wire.options.map(sanitizeOption);
      requireAnswerable([wire.answerId], options, wire.id);
      return { ...base, kind: 'listen', audio: wire.audio, options, answerId: wire.answerId };
    }
    case 'fretboard':
      return { ...base, kind: 'fretboard', frets: wire.frets, answer: wire.answer };
  }
}

function normalizeQuestion(raw: unknown, index: number): RenderQuestion {
  const known = questionSchema.safeParse(raw);
  if (known.success) {
    try {
      return sanitizeQuestion(known.data);
    } catch {
      // Shape we recognise but can't grade (unanswerable, or setup we can't even
      // place). Same outcome as an unknown kind: out of the denominator.
      return { kind: 'unknown', id: known.data.id };
    }
  }

  // Not a shape this build knows. An id makes it addressable — future content.
  // Without one there is nothing to key an answer on, so the quiz is corrupt.
  const id = typeof raw === 'object' && raw !== null ? (raw as { id?: unknown }).id : undefined;
  if (typeof id === 'string' && id.length > 0) return { kind: 'unknown', id };

  throw new QuizParseError(`Question ${index} is not an object with a string "id".`);
}

// ─ meta & document ─

const quizMetaSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  kind: z.union([z.literal('quiz'), z.literal('checkpoint')]),
  passThresholdPct: z.number().min(0).max(100),
});

const quizDocumentSchema = z.object({
  schemaVersion: z.number(),
  meta: quizMetaSchema,
  questions: z.array(z.unknown()),
});

function describe(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
}

export function parseQuizMeta(data: unknown): QuizMeta {
  const result = quizMetaSchema.safeParse(data);
  if (!result.success) throw new QuizParseError(`Invalid quiz meta — ${describe(result.error)}`);
  return result.data;
}

export function parseQuizDocument(data: unknown): QuizDocument {
  const result = quizDocumentSchema.safeParse(data);
  if (!result.success) {
    throw new QuizParseError(`Invalid quiz document — ${describe(result.error)}`);
  }

  const { schemaVersion, meta, questions } = result.data;
  if (schemaVersion !== QUIZ_SCHEMA_VERSION) {
    throw new QuizParseError(
      `Unsupported schemaVersion ${schemaVersion} (this build reads ${QUIZ_SCHEMA_VERSION}).`,
    );
  }

  return { schemaVersion, meta, questions: questions.map(normalizeQuestion) };
}

/**
 * The questions this build can actually grade — the denominator for both the
 * score and the pass threshold. Scoring against `doc.questions` instead would
 * make every quiz that gains a question type unpassable on older apps.
 */
export function gradableQuestions(doc: QuizDocument): Question[] {
  return doc.questions.filter((question): question is Question => question.kind !== 'unknown');
}
