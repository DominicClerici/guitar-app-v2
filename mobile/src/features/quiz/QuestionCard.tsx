import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { Face } from '@/components/Face';
import { BlockView } from '@/features/articles/blocks/BlockView';
import { RichText } from '@/features/articles/RichText';
import type { RenderQuestion } from '@/lib/content';
import type { Answer } from '@/lib/quiz';
import { useToken } from '@/lib/tokens';

import { ListenControl } from './ListenControl';
import { OptionList } from './OptionList';
import { QuizFretboard } from './QuizFretboard';

// One question, from its setup blocks down to the explanation the check reveals. Rich text and
// setup blocks render through the article components rather than through anything of the quiz's
// own, so a table or a live component inside a question behaves exactly as it does in an article.

interface Props {
  question: RenderQuestion;
  answer: Answer | undefined;
  onAnswer: (answer: Answer) => void;
  /** The learner has committed; the body stops taking input and starts showing the verdict. */
  checked: boolean;
  correct: boolean;
}

/** What the learner is being asked to do, said once above the prompt. */
function instruction(question: RenderQuestion): string | null {
  switch (question.kind) {
    case 'choice':
      return 'Choose one';
    case 'multi-select':
      return 'Choose all that apply';
    case 'listen':
      return 'Listen';
    case 'fretboard':
      return 'Tap the neck';
    case 'unknown':
      return null;
  }
}

export function QuestionCard({ question, answer, onAnswer, checked, correct }: Props) {
  if (question.kind === 'unknown') return <SkippedCard />;

  const label = instruction(question);

  return (
    <View>
      {question.setup?.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}

      <View className="px-[18px] pt-[14px]">
        {label ? (
          <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
            {label}
          </Text>
        ) : null}
        <RichText
          spans={question.prompt}
          className="mt-[8px] text-[18px] font-medium leading-[25px] tracking-[-0.3px] text-ink"
        />
      </View>

      <Body question={question} answer={answer} onAnswer={onAnswer} checked={checked} />

      {checked ? <Feedback question={question} correct={correct} /> : null}
    </View>
  );
}

function Body({ question, answer, onAnswer, checked }: Omit<Props, 'correct'>) {
  const optionIds = answer?.kind === 'options' ? answer.optionIds : [];
  const positions = answer?.kind === 'positions' ? answer.positions : [];

  switch (question.kind) {
    case 'choice':
    case 'listen':
      return (
        <View className="px-[18px]">
          {question.kind === 'listen' ? <ListenControl audio={question.audio} /> : null}
          <OptionList
            options={question.options}
            selected={optionIds}
            // One answer: picking replaces rather than adds.
            onToggle={(optionId) => onAnswer({ kind: 'options', optionIds: [optionId] })}
            checked={checked}
            answerIds={[question.answerId]}
          />
        </View>
      );

    case 'multi-select':
      return (
        <View className="px-[18px]">
          <OptionList
            options={question.options}
            selected={optionIds}
            onToggle={(optionId) =>
              onAnswer({
                kind: 'options',
                optionIds: optionIds.includes(optionId)
                  ? optionIds.filter((id) => id !== optionId)
                  : [...optionIds, optionId],
              })
            }
            checked={checked}
            answerIds={question.answerIds}
            multi
          />
        </View>
      );

    case 'fretboard':
      return (
        <QuizFretboard
          frets={question.frets}
          selected={positions}
          onToggle={(position) =>
            onAnswer({
              kind: 'positions',
              positions: positions.some(
                (placed) => placed.string === position.string && placed.fret === position.fret,
              )
                ? positions.filter(
                    (placed) =>
                      !(placed.string === position.string && placed.fret === position.fret),
                  )
                : [...positions, position],
            })
          }
          checked={checked}
          answer={question.answer}
        />
      );

    case 'unknown':
      return null;
  }
}

function Feedback({ question, correct }: { question: RenderQuestion; correct: boolean }) {
  const accent = useToken('--accent', '#5ec8c2');
  const rose = useToken('--rose', '#e0788f');
  const explanation = question.kind === 'unknown' ? undefined : question.explanation;

  return (
    <View className="mt-[18px] px-[18px]">
      <View className="px-[14px] py-[13px]">
        <Face name={correct ? 'accent' : 'alert'} radius={13} />
        <View className="flex-row items-center gap-[8px]">
          <SymbolView
            name={correct ? 'checkmark.circle.fill' : 'xmark.circle.fill'}
            size={15}
            tintColor={correct ? accent : rose}
          />
          <Text className="text-[13.5px] font-semibold tracking-[-0.2px] text-ink">
            {correct ? 'Correct' : 'Not quite'}
          </Text>
        </View>

        {explanation ? (
          <RichText
            spans={explanation}
            className="mt-[9px] text-[13px] leading-[19px] text-ink-muted"
          />
        ) : null}
      </View>
    </View>
  );
}

/**
 * A question written for a newer build. It is shown rather than spliced out so question numbering
 * matches across app versions, and it is outside the score entirely — `gradableQuestions` has
 * already dropped it from the denominator, so skipping it costs the learner nothing.
 */
function SkippedCard() {
  return (
    <View className="px-[18px] pt-[14px]">
      <View className="px-[14px] py-[16px]">
        <Face stroke="--line" dashed radius={13} />
        <Text className="text-[13.5px] font-medium tracking-[-0.2px] text-ink-muted">
          This question needs a newer version of the app
        </Text>
        <Text className="mt-[5px] text-[12px] leading-[17px] text-ink-faint">
          It is skipped, and it is not counted against your score.
        </Text>
      </View>
    </View>
  );
}
