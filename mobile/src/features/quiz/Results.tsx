import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { gradableQuestions, type QuizDocument } from '@/lib/content';
import { isCorrect, type AnswerSheet, type QuizScore } from '@/lib/quiz';
import { useToken } from '@/lib/tokens';

// The end of an attempt. A phase of the runner rather than a route of its own, so Back from here
// lands on the chapter the learner came from instead of replaying the quiz they just sat.

interface Props {
  document: QuizDocument;
  answers: AnswerSheet;
  score: QuizScore;
  thresholdPct: number;
  onDone: () => void;
}

export function Results({ document, answers, score, thresholdPct, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const accent = useToken('--accent', '#5ec8c2');
  const rose = useToken('--rose', '#e0788f');

  const checkpoint = document.meta.kind === 'checkpoint';
  const marks = gradableQuestions(document).map((question) =>
    isCorrect(question, answers.get(question.id)),
  );

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="items-center px-[18px] pt-[28px]">
          <View
            className={`h-[112px] w-[112px] items-center justify-center rounded-full border-2 ${
              score.passed ? 'border-accent bg-accent-wash' : 'border-rose bg-rose-wash'
            }`}
          >
            <Text className="text-[34px] font-semibold tracking-[-1px] text-ink">
              {score.scorePct}
              <Text className="text-[17px] font-medium text-ink-muted">%</Text>
            </Text>
          </View>

          <View className="mt-[18px] flex-row items-center gap-[7px]">
            <SymbolView
              name={score.passed ? 'checkmark.circle.fill' : 'arrow.counterclockwise.circle.fill'}
              size={16}
              tintColor={score.passed ? accent : rose}
            />
            <Text className="text-[19px] font-semibold tracking-[-0.4px] text-ink">
              {score.passed ? (checkpoint ? 'Checkpoint passed' : 'Passed') : 'Not passed yet'}
            </Text>
          </View>

          <Text className="mt-[7px] text-center text-[13px] leading-[19px] text-ink-muted">
            {score.total === 0
              ? 'None of these questions could be graded by this version of the app.'
              : `${score.correct} of ${score.total} right · ${thresholdPct}% needed to pass`}
          </Text>

          {!score.passed && checkpoint ? (
            <Text className="mt-[10px] text-center text-[12.5px] leading-[18px] text-ink-faint">
              Your best score is kept, so another go can only help.
            </Text>
          ) : null}
        </View>

        {marks.length ? (
          <View className="mt-[26px] px-[18px]">
            <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              Question by question
            </Text>
            <View className="mt-[12px] flex-row flex-wrap gap-[8px]">
              {marks.map((right, index) => (
                <View
                  key={index}
                  accessibilityLabel={`Question ${index + 1} ${right ? 'correct' : 'incorrect'}`}
                  className={`h-[34px] w-[34px] items-center justify-center rounded-[10px] border ${
                    right ? 'border-accent-line bg-accent-wash' : 'border-rose bg-rose-wash'
                  }`}
                >
                  <Text
                    className={`font-mono text-[11px] font-semibold ${
                      right ? 'text-accent' : 'text-rose'
                    }`}
                  >
                    {index + 1}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View
        className="border-t border-t-line-soft px-[18px] pt-[12px]"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          onPress={onDone}
          accessibilityRole="button"
          accessibilityLabel="Done"
          className="items-center rounded-[13px] bg-accent py-[14px] active:opacity-80"
        >
          <Text className="text-[15px] font-semibold tracking-[-0.2px] text-on-accent">Done</Text>
        </Pressable>
      </View>
    </View>
  );
}
