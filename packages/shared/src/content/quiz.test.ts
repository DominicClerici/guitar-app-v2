import { describe, expect, it } from 'vitest';

import { gradableQuestions, parseQuizDocument, QuizParseError } from './quiz';

const meta = {
  id: 'quiz_test',
  slug: 'test-quiz',
  title: 'Test Quiz',
  kind: 'quiz',
  passThresholdPct: 70,
};

const doc = (questions: unknown[], extra: Record<string, unknown> = {}) => ({
  schemaVersion: 1,
  meta,
  questions,
  ...extra,
});

const choice = (id: string) => ({
  kind: 'choice',
  id,
  prompt: [{ text: 'Which one?' }],
  options: [
    { id: 'a', spans: [{ text: 'A' }] },
    { id: 'b', spans: [{ text: 'B' }] },
  ],
  answerId: 'a',
});

describe('parseQuizDocument', () => {
  it('parses a document using every question kind', () => {
    const parsed = parseQuizDocument(
      doc([
        choice('q1'),
        {
          kind: 'multi-select',
          id: 'q2',
          prompt: [{ text: 'Which ones?' }],
          options: [
            { id: 'a', spans: [{ text: 'A' }] },
            { id: 'b', spans: [{ text: 'B' }] },
          ],
          answerIds: ['a', 'b'],
        },
        {
          kind: 'listen',
          id: 'q3',
          prompt: [{ text: 'What did you hear?' }],
          audio: { kind: 'notes', notes: ['A3', 'C4', 'E4'], mode: 'chord' },
          options: [
            { id: 'a', spans: [{ text: 'Minor' }] },
            { id: 'b', spans: [{ text: 'Major' }] },
          ],
          answerId: 'a',
          explanation: [{ text: 'The b3 gives it away.' }],
        },
        {
          kind: 'fretboard',
          id: 'q4',
          prompt: [{ text: 'Play an A minor chord' }],
          frets: 5,
          answer: [
            { string: 2, fret: 1 },
            { string: 3, fret: 2 },
            { string: 4, fret: 2 },
          ],
        },
      ]),
    );

    expect(parsed.questions.map((question) => question.kind)).toEqual([
      'choice',
      'multi-select',
      'listen',
      'fretboard',
    ]);
    expect(gradableQuestions(parsed)).toHaveLength(4);
  });

  it('turns an unknown question kind into a placeholder excluded from grading', () => {
    const parsed = parseQuizDocument(
      doc([choice('q1'), { kind: 'sing-it-back', id: 'q2', pitch: 'A440' }, choice('q3')]),
    );

    expect(parsed.questions).toHaveLength(3);
    expect(parsed.questions[1]).toEqual({ kind: 'unknown', id: 'q2' });
    expect(gradableQuestions(parsed).map((question) => question.id)).toEqual(['q1', 'q3']);
  });

  it('turns a known kind with an invalid payload into a placeholder', () => {
    const parsed = parseQuizDocument(doc([{ ...choice('q1'), options: [] }]));
    expect(parsed.questions[0]).toEqual({ kind: 'unknown', id: 'q1' });
    expect(gradableQuestions(parsed)).toHaveLength(0);
  });

  it('turns a question answering with an unknown option into a placeholder', () => {
    const parsed = parseQuizDocument(doc([{ ...choice('q1'), answerId: 'z' }]));
    expect(parsed.questions[0]).toEqual({ kind: 'unknown', id: 'q1' });
  });

  it('keeps a question whose setup block is unknown, degrading only the block', () => {
    const parsed = parseQuizDocument(
      doc([{ ...choice('q1'), setup: [{ type: 'hologram', beams: 7 }] }]),
    );

    const question = parsed.questions[0];
    if (question?.kind !== 'choice') throw new Error('expected choice');
    expect(question.setup).toEqual([{ type: 'unknown', originalType: 'hologram' }]);
    expect(gradableQuestions(parsed)).toHaveLength(1);
  });

  it('drops unknown marks in a prompt but keeps the text', () => {
    const parsed = parseQuizDocument(
      doc([{ ...choice('q1'), prompt: [{ text: 'Hi', marks: ['bold', 'sparkle'] }] }]),
    );

    const question = parsed.questions[0];
    if (question?.kind !== 'choice') throw new Error('expected choice');
    expect(question.prompt[0]?.marks).toEqual(['bold']);
  });

  it('rejects an unsupported schemaVersion', () => {
    expect(() => parseQuizDocument({ schemaVersion: 2, meta, questions: [] })).toThrow(
      QuizParseError,
    );
  });

  it('rejects a document whose questions are not an array', () => {
    expect(() => parseQuizDocument({ schemaVersion: 1, meta, questions: 'nope' })).toThrow(
      QuizParseError,
    );
  });

  it('rejects a question that is not an object with a string id', () => {
    expect(() => parseQuizDocument(doc([{ kind: 'sing-it-back' }]))).toThrow(QuizParseError);
    expect(() => parseQuizDocument(doc([42]))).toThrow(QuizParseError);
  });

  it('rejects a document with invalid meta', () => {
    expect(() =>
      parseQuizDocument({
        schemaVersion: 1,
        meta: { ...meta, passThresholdPct: 140 },
        questions: [],
      }),
    ).toThrow(QuizParseError);
  });
});
