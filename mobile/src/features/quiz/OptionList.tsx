import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { RichText } from '@/features/articles/RichText';
import type { QuizOption } from '@/lib/content';
import { useToken } from '@/lib/tokens';

// The answer face shared by choice, listen and multi-select. One row per option, already in the
// order this attempt shuffled them into — the list never sorts, because the shuffle upstream is
// what stops a retake being answered from memory of where the right answer sat.

interface Props {
  options: readonly QuizOption[];
  /** Option ids the learner has picked. */
  selected: readonly string[];
  onToggle: (optionId: string) => void;
  /** Once checked the rows stop responding and start explaining. */
  checked: boolean;
  /** Which ids were right. Only read once `checked`. */
  answerIds: readonly string[];
  /** Several answers expected — changes the indicator from a radio to a box. */
  multi?: boolean;
}

export function OptionList({ options, selected, onToggle, checked, answerIds, multi }: Props) {
  const picked = new Set(selected);
  const correct = new Set(answerIds);

  return (
    <View className="mt-[16px] gap-[8px]">
      {options.map((option) => (
        <OptionRow
          key={option.id}
          option={option}
          picked={picked.has(option.id)}
          correct={correct.has(option.id)}
          checked={checked}
          multi={multi === true}
          onPress={() => onToggle(option.id)}
        />
      ))}
    </View>
  );
}

/**
 * Colour carries the verdict and the indicator carries the choice, so a row that was picked and
 * wrong still reads as "you chose this" rather than only as "this is red". After the check the
 * right answer is always tinted, whether or not it was the one picked — a learner who got it wrong
 * has to be shown what they were looking for.
 */
function OptionRow({
  option,
  picked,
  correct,
  checked,
  multi,
  onPress,
}: {
  option: QuizOption;
  picked: boolean;
  correct: boolean;
  checked: boolean;
  multi: boolean;
  onPress: () => void;
}) {
  const verdict = checked ? (correct ? 'right' : picked ? 'wrong' : 'idle') : 'idle';

  const face =
    verdict === 'right'
      ? 'border-accent-line bg-accent-wash'
      : verdict === 'wrong'
        ? 'border-rose bg-rose-wash'
        : picked
          ? 'border-accent-line bg-surface-raised'
          : 'border-line-soft bg-surface';

  const text =
    verdict === 'right' ? 'text-ink' : verdict === 'wrong' ? 'text-ink' : 'text-ink-muted';

  return (
    <Pressable
      onPress={onPress}
      disabled={checked}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: picked, disabled: checked }}
      accessibilityLabel={option.spans.map((span) => span.text).join('')}
      className={`flex-row items-start gap-[11px] rounded-[12px] border px-[14px] py-[12px] ${face} ${
        checked ? '' : 'active:opacity-70'
      }`}
    >
      <Indicator picked={picked} verdict={verdict} multi={multi} />
      <RichText spans={option.spans} className={`flex-1 text-[14px] leading-[20px] ${text}`} />
    </Pressable>
  );
}

type Verdict = 'idle' | 'right' | 'wrong';

function Indicator({
  picked,
  verdict,
  multi,
}: {
  picked: boolean;
  verdict: Verdict;
  multi: boolean;
}) {
  const onAccent = useToken('--on-accent', '#04211f');
  const rose = useToken('--rose', '#e0788f');
  const accent = useToken('--accent', '#5ec8c2');

  const shape = multi ? 'rounded-[7px]' : 'rounded-full';

  if (verdict === 'right') {
    return (
      <View className={`mt-[1px] h-[20px] w-[20px] items-center justify-center bg-accent ${shape}`}>
        <SymbolView name="checkmark" size={11} weight="bold" tintColor={onAccent} />
      </View>
    );
  }

  if (verdict === 'wrong') {
    return (
      <View
        className={`mt-[1px] h-[20px] w-[20px] items-center justify-center border border-rose ${shape}`}
      >
        <SymbolView name="xmark" size={10} weight="bold" tintColor={rose} />
      </View>
    );
  }

  return (
    <View
      className={`mt-[1px] h-[20px] w-[20px] items-center justify-center border ${shape} ${
        picked ? 'border-accent bg-accent-wash' : 'border-line'
      }`}
    >
      {picked ? (
        <SymbolView
          name={multi ? 'checkmark' : 'circle.fill'}
          size={multi ? 10 : 8}
          tintColor={accent}
        />
      ) : null}
    </View>
  );
}
