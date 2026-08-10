import { gradableQuestions } from '@/lib/content';
import type { FretPosition, Question, QuizDocument } from '@/lib/content';

// Marking one attempt. Pure — a document and what the learner picked go in, a score comes out —
// because the same number is written to two synced tables and compared against a chapter's pass
// threshold, and a screen is the wrong place for arithmetic that gates content.

/**
 * One learner answer, in the two shapes the question kinds actually take: a set of option ids
 * (choice, listen, multi-select) or a set of board positions (fretboard).
 *
 * Option *ids* rather than indices, because options are shuffled per attempt — an index would mean
 * something different to the runner than to the grader.
 */
export type Answer =
  | { kind: 'options'; optionIds: readonly string[] }
  | { kind: 'positions'; positions: readonly FretPosition[] };

/** Answers by question id. A question absent from the map was not answered, which marks wrong. */
export type AnswerSheet = ReadonlyMap<string, Answer>;

const positionKey = (position: FretPosition): string => `${position.string}-${position.fret}`;

/** Set equality, so a duplicate in either list and any ordering are both immaterial. */
function sameSet(left: readonly string[], right: readonly string[]): boolean {
  const wanted = new Set(right);
  const given = new Set(left);

  if (wanted.size !== given.size) return false;
  for (const value of given) if (!wanted.has(value)) return false;

  return true;
}

/**
 * Whether one answer is right.
 *
 * Every kind is all-or-nothing, `multi-select` included: a partially correct selection scores
 * zero, which is the schema's stated rule (quiz.ts) and the only one that keeps the score a count
 * of questions rather than a count of checkboxes.
 */
export function isCorrect(question: Question, answer: Answer | undefined): boolean {
  if (!answer) return false;

  switch (question.kind) {
    case 'choice':
    case 'listen':
      return answer.kind === 'options' && sameSet(answer.optionIds, [question.answerId]);
    case 'multi-select':
      return answer.kind === 'options' && sameSet(answer.optionIds, question.answerIds);
    case 'fretboard':
      return (
        answer.kind === 'positions' &&
        sameSet(answer.positions.map(positionKey), question.answer.map(positionKey))
      );
  }
}

/** Whether a score clears a threshold. Inclusive: exactly the threshold is a pass. */
export function passes(scorePct: number, thresholdPct: number): boolean {
  return scorePct >= thresholdPct;
}

export interface QuizScore {
  correct: number;
  /** Gradable questions only — see `gradableQuestions`. */
  total: number;
  /** Whole percent, 0–100. */
  scorePct: number;
  passed: boolean;
}

/**
 * Marks an attempt.
 *
 * The denominator is `gradableQuestions`, never `doc.questions`: a question kind this build has
 * never heard of is a placeholder the learner cannot answer, and counting it would make a quiz
 * that grew a question type unpassable on an older app.
 *
 * The percentage is rounded to the nearest whole percent with `Math.round` (halves up), and the
 * rounded value is what both the threshold comparison and the stored `bestScorePct` use. That
 * matters: `checkpointPassed` in lib/learning re-derives the gate from the stored number, so
 * comparing an unrounded score here would let a checkpoint pass on this screen and stay locked on
 * the pathway screen. 3 of 5 is 60, and 60 clears a threshold of 60.
 *
 * A document with nothing gradable in it scores 100 rather than 0. It is not an achievement, but
 * the alternative is worse: it can only happen on a build too old to read any of the questions,
 * and a 0 there would lock the chapter behind a checkpoint that offers the learner nothing to
 * answer.
 */
export function scoreQuiz(
  doc: QuizDocument,
  answers: AnswerSheet,
  thresholdPct: number = doc.meta.passThresholdPct,
): QuizScore {
  const questions = gradableQuestions(doc);
  const correct = questions.filter((question) =>
    isCorrect(question, answers.get(question.id)),
  ).length;

  const scorePct = questions.length === 0 ? 100 : Math.round((correct / questions.length) * 100);

  return {
    correct,
    total: questions.length,
    scorePct,
    passed: passes(scorePct, thresholdPct),
  };
}
