import { describe, expect, it } from 'vitest';

import type {
  ChoiceQuestion,
  FretboardQuestion,
  ListenQuestion,
  MultiSelectQuestion,
  QuizDocument,
  RenderQuestion,
} from '@/lib/content';

import { isCorrect, passes, scoreQuiz, type Answer, type AnswerSheet } from './grading';

// ---------------------------------------------------------------------------
// Fixtures. Questions are built by hand rather than parsed, so a case reads as
// the shape it is about; the parser has its own tests in @guitar/shared.
// ---------------------------------------------------------------------------

const option = (id: string) => ({ id, spans: [{ text: id }] });

const choice = (id = 'q-choice'): ChoiceQuestion => ({
  id,
  kind: 'choice',
  prompt: [{ text: 'Which one?' }],
  options: [option('a'), option('b'), option('c')],
  answerId: 'b',
});

const listen = (id = 'q-listen'): ListenQuestion => ({
  id,
  kind: 'listen',
  prompt: [{ text: 'What did you hear?' }],
  audio: { kind: 'notes', notes: ['A3', 'C4'], mode: 'sequence' },
  options: [option('minor'), option('major')],
  answerId: 'minor',
});

const multi = (id = 'q-multi'): MultiSelectQuestion => ({
  id,
  kind: 'multi-select',
  prompt: [{ text: 'Which of these?' }],
  options: [option('a'), option('b'), option('c'), option('d')],
  answerIds: ['a', 'c'],
});

const fretboard = (id = 'q-fret'): FretboardQuestion => ({
  id,
  kind: 'fretboard',
  prompt: [{ text: 'Place the root.' }],
  frets: 5,
  answer: [
    { string: 6, fret: 3 },
    { string: 5, fret: 2 },
  ],
});

const unknown = (id = 'q-future'): RenderQuestion => ({ kind: 'unknown', id });

const options = (...ids: string[]): Answer => ({ kind: 'options', optionIds: ids });

const doc = (questions: RenderQuestion[], passThresholdPct = 70): QuizDocument => ({
  schemaVersion: 1,
  meta: {
    id: 'quiz-1',
    slug: 'intervals-check',
    title: 'Intervals',
    kind: 'checkpoint',
    passThresholdPct,
  },
  questions,
});

const sheet = (entries: [string, Answer][]): AnswerSheet => new Map(entries);

// ---------------------------------------------------------------------------

describe('isCorrect', () => {
  it('marks an unanswered question wrong whatever its kind', () => {
    expect(isCorrect(choice(), undefined)).toBe(false);
    expect(isCorrect(multi(), undefined)).toBe(false);
    expect(isCorrect(listen(), undefined)).toBe(false);
    expect(isCorrect(fretboard(), undefined)).toBe(false);
  });

  it('grades a choice against its answer id', () => {
    expect(isCorrect(choice(), options('b'))).toBe(true);
    expect(isCorrect(choice(), options('a'))).toBe(false);
  });

  it('grades a listen question the same way as a choice', () => {
    expect(isCorrect(listen(), options('minor'))).toBe(true);
    expect(isCorrect(listen(), options('major'))).toBe(false);
  });

  it('rejects a choice answered with more than one option', () => {
    expect(isCorrect(choice(), options('b', 'a'))).toBe(false);
  });

  it('grades multi-select all-or-nothing', () => {
    expect(isCorrect(multi(), options('a', 'c'))).toBe(true);
    // Order is immaterial; the answer is a set.
    expect(isCorrect(multi(), options('c', 'a'))).toBe(true);
    // Half right is wrong.
    expect(isCorrect(multi(), options('a'))).toBe(false);
    // Everything right plus one extra is wrong.
    expect(isCorrect(multi(), options('a', 'b', 'c'))).toBe(false);
    expect(isCorrect(multi(), options())).toBe(false);
  });

  it('grades a fretboard on the set of positions, not their order', () => {
    const answer = (positions: { string: number; fret: number }[]): Answer => ({
      kind: 'positions',
      positions,
    });

    expect(
      isCorrect(
        fretboard(),
        answer([
          { string: 5, fret: 2 },
          { string: 6, fret: 3 },
        ]),
      ),
    ).toBe(true);
    expect(isCorrect(fretboard(), answer([{ string: 6, fret: 3 }]))).toBe(false);
    expect(
      isCorrect(
        fretboard(),
        answer([
          { string: 6, fret: 3 },
          { string: 5, fret: 2 },
          { string: 4, fret: 0 },
        ]),
      ),
    ).toBe(false);
  });

  it('rejects an answer of the wrong shape for the question', () => {
    expect(isCorrect(fretboard(), options('a'))).toBe(false);
    expect(isCorrect(choice(), { kind: 'positions', positions: [{ string: 1, fret: 0 }] })).toBe(
      false,
    );
  });
});

describe('scoreQuiz', () => {
  it('scores correct over gradable, rounded to a whole percent', () => {
    const quiz = doc([choice('a'), multi('b'), listen('c'), fretboard('d')]);

    const score = scoreQuiz(
      quiz,
      sheet([
        ['a', options('b')],
        ['b', options('a', 'c')],
        ['c', options('major')],
        ['d', options('nonsense')],
      ]),
    );

    expect(score).toEqual({ correct: 2, total: 4, scorePct: 50, passed: false });
  });

  it('rounds to the nearest whole percent', () => {
    const quiz = doc([choice('a'), choice('b'), choice('c')]);
    const score = scoreQuiz(quiz, sheet([['a', options('b')]]));

    // 1 of 3 is 33.33…
    expect(score.scorePct).toBe(33);

    const two = scoreQuiz(
      quiz,
      sheet([
        ['a', options('b')],
        ['b', options('b')],
      ]),
    );

    // 2 of 3 is 66.66… — halves and above go up.
    expect(two.scorePct).toBe(67);
  });

  it('leaves unknown questions out of the denominator', () => {
    const quiz = doc([choice('a'), unknown('x'), unknown('y'), choice('b')]);

    const score = scoreQuiz(
      quiz,
      sheet([
        ['a', options('b')],
        ['b', options('b')],
      ]),
    );

    // Four questions on screen, two of them gradable, both right.
    expect(score.total).toBe(2);
    expect(score.scorePct).toBe(100);
    expect(score.passed).toBe(true);
  });

  it('does not let an unknown question keep a learner below the threshold', () => {
    const quiz = doc([choice('a'), unknown('x')], 100);

    expect(scoreQuiz(quiz, sheet([['a', options('b')]])).passed).toBe(true);
  });

  it('scores a document with nothing gradable as a pass rather than a dead end', () => {
    const quiz = doc([unknown('x'), unknown('y')], 80);
    const score = scoreQuiz(quiz, sheet([]));

    expect(score).toEqual({ correct: 0, total: 0, scorePct: 100, passed: true });
  });

  it('passes on exactly the threshold', () => {
    const quiz = doc([choice('a'), choice('b'), choice('c'), choice('d'), choice('e')], 60);
    const three = sheet([
      ['a', options('b')],
      ['b', options('b')],
      ['c', options('b')],
    ]);

    expect(scoreQuiz(quiz, three)).toMatchObject({ scorePct: 60, passed: true });
  });

  it('fails one question short of the threshold', () => {
    const quiz = doc([choice('a'), choice('b'), choice('c'), choice('d'), choice('e')], 60);
    const two = sheet([
      ['a', options('b')],
      ['b', options('b')],
    ]);

    expect(scoreQuiz(quiz, two)).toMatchObject({ scorePct: 40, passed: false });
  });

  it('takes an overriding threshold, which is how a checkpoint gates on the chapter', () => {
    const quiz = doc([choice('a'), choice('b')], 50);
    const half = sheet([['a', options('b')]]);

    expect(scoreQuiz(quiz, half).passed).toBe(true);
    // The chapter's checkpoint asks for more than the document's own default.
    expect(scoreQuiz(quiz, half, 90).passed).toBe(false);
  });

  it('scores an attempt with no answers at all as zero', () => {
    expect(scoreQuiz(doc([choice('a'), choice('b')]), sheet([]))).toMatchObject({
      correct: 0,
      scorePct: 0,
      passed: false,
    });
  });
});

describe('passes', () => {
  it('is inclusive at the boundary', () => {
    expect(passes(80, 80)).toBe(true);
    expect(passes(79, 80)).toBe(false);
    expect(passes(81, 80)).toBe(true);
  });

  it('treats a zero threshold as always cleared', () => {
    expect(passes(0, 0)).toBe(true);
  });
});
