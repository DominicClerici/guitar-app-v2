import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { QuizDocument, RenderQuestion } from '@/lib/content';
import { isCorrect, scoreQuiz, shuffled, type Answer, type QuizScore } from '@/lib/quiz';

import { QuestionCard } from './QuestionCard';
import { recordAttempt } from './record';
import { Results } from './Results';

// One attempt, start to finish. Everything about an attempt in progress is React state and nothing
// else: a half-finished quiz is not worth a database row, and persisting one would mean deciding
// what a resumed attempt does about the questions the learner has already been shown the answers
// to. Leaving the screen abandons the attempt, which is the honest behaviour.
//
// Results are a *phase* of this component rather than a route, so Back from the results lands on
// the chapter the learner came from instead of replaying the quiz.

/**
 * The attempt's own copy of the questions, with each one's options shuffled.
 *
 * Options move, questions do not: an author sequences a quiz deliberately and a later question
 * often builds on an earlier one, while the position of a right answer is only ever a memory aid
 * for a retake. Shuffling cannot change what an answer means — every option keeps its `id`, and
 * that is what the grading in `lib/quiz` matches on.
 */
function deal(questions: readonly RenderQuestion[]): RenderQuestion[] {
  return questions.map((question) => {
    switch (question.kind) {
      case 'choice':
      case 'listen':
      case 'multi-select':
        return { ...question, options: shuffled(question.options) };
      default:
        return question;
    }
  });
}

function answered(answer: Answer | undefined): boolean {
  if (!answer) return false;
  return answer.kind === 'options' ? answer.optionIds.length > 0 : answer.positions.length > 0;
}

interface Props {
  document: QuizDocument;
  /**
   * The section id the result is recorded under, or null when the caller named none. For a
   * checkpoint this is `checkpointSectionId(chapter)` — never the quiz slug.
   */
  sectionId: string | null;
  /** What this attempt has to reach, which for a checkpoint is the chapter's threshold. */
  thresholdPct: number;
  /**
   * The high-water mark before this attempt, or null if the learner has never sat it. Live while
   * the quiz is running — `finish` freezes it, because recording the attempt is what moves it.
   */
  previousBestPct: number | null;
  /** Null before a session exists. The quiz still runs; it just records nothing. */
  userId: string | null;
  onDone: () => void;
}

/** The attempt, once it is over, alongside the standing it had to beat. */
interface Outcome {
  score: QuizScore;
  previousBestPct: number | null;
}

export function QuizRunner({
  document,
  sectionId,
  thresholdPct,
  previousBestPct,
  userId,
  onDone,
}: Props) {
  const insets = useSafeAreaInsets();

  const [deck] = useState(() => deal(document.questions));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ReadonlyMap<string, Answer>>(() => new Map());
  const [checked, setChecked] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  if (outcome) {
    return (
      <Results
        document={document}
        answers={answers}
        score={outcome.score}
        previousBestPct={outcome.previousBestPct}
        thresholdPct={thresholdPct}
        onDone={onDone}
      />
    );
  }

  const question = deck[index];
  if (!question) return null;

  const answer = answers.get(question.id);
  const skippable = question.kind === 'unknown';
  const last = index === deck.length - 1;
  const correct = question.kind !== 'unknown' && isCorrect(question, answer);

  const finish = () => {
    const result = scoreQuiz(document, answers, thresholdPct);
    // Captured before the write, because the write is what raises it.
    const standing = previousBestPct;

    // Both writes are local and neither is awaited. No session means no account to record
    // against — the attempt is still worth sitting, so the runner shows the score and drops it.
    if (userId && sectionId) recordAttempt(userId, sectionId, result);

    setOutcome({ score: result, previousBestPct: standing });
  };

  const advance = () => {
    if (last) {
      finish();
      return;
    }
    setIndex(index + 1);
    setChecked(false);
  };

  const action = skippable
    ? { label: last ? 'See results' : 'Skip', onPress: advance, enabled: true }
    : checked
      ? { label: last ? 'See results' : 'Next question', onPress: advance, enabled: true }
      : { label: 'Check', onPress: () => setChecked(true), enabled: answered(answer) };

  return (
    <View className="flex-1">
      <View className="px-[18px] pt-[4px]">
        <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
          Question {index + 1} of {deck.length}
        </Text>
        {/* One segment per question rather than a bar of a computed width: a percentage would have
            to be an inline style, and the segments say how much is left more plainly anyway. */}
        <View className="mt-[9px] flex-row gap-[3px]">
          {deck.map((item, position) => (
            <View
              key={item.id}
              className={`h-[3px] flex-1 rounded-full ${
                position < index ? 'bg-accent' : position === index ? 'bg-accent-line' : 'bg-line'
              }`}
            />
          ))}
        </View>
      </View>

      {/* Keyed on the question so each one starts at the top of its own scroll, and so a listen
          question's player is torn down when the learner moves on rather than left holding the
          audio session. */}
      <ScrollView
        key={question.id}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <QuestionCard
          question={question}
          answer={answer}
          onAnswer={(next) => setAnswers((previous) => new Map(previous).set(question.id, next))}
          checked={checked}
          correct={correct}
        />
      </ScrollView>

      <View
        className="border-t border-t-line-soft px-[18px] pt-[12px]"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          onPress={action.onPress}
          disabled={!action.enabled}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          accessibilityState={{ disabled: !action.enabled }}
          className={`items-center rounded-[13px] py-[14px] ${
            action.enabled ? 'bg-accent active:opacity-80' : 'bg-surface-raised'
          }`}
        >
          <Text
            className={`text-[15px] font-semibold tracking-[-0.2px] ${
              action.enabled ? 'text-on-accent' : 'text-ink-faint'
            }`}
          >
            {action.label}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
