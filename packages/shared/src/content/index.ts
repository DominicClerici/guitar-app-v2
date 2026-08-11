// The content wire formats and their parsers — articles, quizzes, and the
// curriculum tree that sequences them. The contract between the app, the bundled
// content, and the backend. Pure data and validation, no React, no native
// modules: renderers and repositories live in the app's src/features.
//
// These live in the shared package rather than in the app because BACKEND_PLAN.md
// §8 makes the Zod domain schemas the single source of truth for shape and
// validation: the publish script and the Worker must validate content against the
// exact same parsers the device runs, not a second copy that can drift.
//
// See mobile/docs/articles.md for how to author content and for the
// forward-compatibility rules every parser here shares.

export {
  contentArticlesInput,
  contentArticlesResult,
  contentChapterInput,
  contentChapterResult,
  contentDocumentInput,
  contentDocumentPayload,
  contentHash,
  contentIndexInput,
  contentIndexResult,
  contentPathwayInput,
  contentPathwayResult,
  contentVersion,
  curriculumIndexVersion,
} from './api';
export type {
  ContentArticlesResult,
  ContentChapterResult,
  ContentDocumentPayload,
  ContentIndexResult,
  ContentPathwayResult,
} from './api';

export {
  ACTIVITY_SCHEMA_VERSION,
  ActivityParseError,
  midiForTarget,
  parseActivityDocument,
  parseActivityMeta,
  runnableRounds,
} from './activity';
export type {
  ActivityBody,
  ActivityDocument,
  ActivityMeta,
  ActivityMode,
  FretWindow,
  NotePlayActivity,
  NotePlayRound,
  RenderActivity,
  RenderNotePlayRound,
  RenderRhythmRound,
  RhythmActivity,
  RhythmRound,
  RhythmSlot,
  UnknownActivity,
  UnknownRound,
} from './activity';

export {
  ArticleParseError,
  parseArticleDocument,
  parseArticleMeta,
  SCHEMA_VERSION,
} from './schema';
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

export {
  countedSections,
  CurriculumParseError,
  parseCurriculumIndex,
  parseCurriculumPathway,
} from './curriculum';
export type {
  CurriculumChapter,
  CurriculumIndex,
  CurriculumPathway,
  CurriculumSection,
  PathwayDifficulty,
  PathwayMeta,
  RenderSection,
  SectionKind,
  UnknownSection,
} from './curriculum';

export {
  gradableQuestions,
  parseQuizDocument,
  parseQuizMeta,
  QUIZ_SCHEMA_VERSION,
  QuizParseError,
} from './quiz';
export type {
  AudioSpec,
  ChoiceQuestion,
  FretPosition,
  FretboardQuestion,
  ListenQuestion,
  MultiSelectQuestion,
  Question,
  QuestionBase,
  QuizDocument,
  QuizKind,
  QuizMeta,
  QuizOption,
  RenderQuestion,
  UnknownQuestion,
} from './quiz';
