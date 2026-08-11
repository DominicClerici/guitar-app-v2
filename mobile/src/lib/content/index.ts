// The content wire formats and their parsers — articles, quizzes, and the
// curriculum tree that sequences them. Nothing is defined here any more: the
// schemas live in `@guitar/shared` (`packages/shared/src/content/`), and this
// module only re-exports them under the `@/lib/content` path the app already
// imports from.
//
// They moved because BACKEND_PLAN.md §8 makes the Zod domain schemas the single
// source of truth for shape and validation. The publish script and the Worker
// have to validate content against the exact same parsers the device runs, and a
// module inside the Expo app cannot be imported by either.
//
// See docs/articles.md for how to author content and for the
// forward-compatibility rules every parser shares.

export {
  ACTIVITY_SCHEMA_VERSION,
  ActivityParseError,
  midiForTarget,
  parseActivityDocument,
  parseActivityMeta,
  runnableRounds,
} from '@guitar/shared';
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
} from '@guitar/shared';

export {
  ArticleParseError,
  parseArticleDocument,
  parseArticleMeta,
  SCHEMA_VERSION,
} from '@guitar/shared';
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
} from '@guitar/shared';

export {
  countedSections,
  CurriculumParseError,
  parseCurriculumIndex,
  parseCurriculumPathway,
} from '@guitar/shared';
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
} from '@guitar/shared';

export {
  gradableQuestions,
  parseQuizDocument,
  parseQuizMeta,
  QUIZ_SCHEMA_VERSION,
  QuizParseError,
} from '@guitar/shared';
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
} from '@guitar/shared';
