import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { gradableQuestions, type QuizDocument } from '@/lib/content';
import { isCorrect, type AnswerSheet, type QuizScore } from '@/lib/quiz';
import { useTokens } from '@/lib/tokens';

// The end of an attempt. A phase of the runner rather than a route of its own, so Back from here
// lands on the chapter the learner came from instead of replaying the quiz they just sat.

interface Props {
  document: QuizDocument;
  answers: AnswerSheet;
  score: QuizScore;
  /** The high-water mark before this attempt; null if the learner had never sat it. */
  previousBestPct: number | null;
  thresholdPct: number;
  onDone: () => void;
}

/**
 * Three tones, and the distinction the middle one exists for.
 *
 * A score below the mark is only a setback if there was nothing behind it. `best_score_pct` merges
 * upwards and never falls (record.ts), so a learner who has already cleared a chapter cannot lose
 * it by sitting the quiz again — and painting that attempt the same alarming red as a first failure
 * would tell them the opposite of what actually happened. Amber is the honest middle: this go was
 * short, nothing was undone.
 */
type Tone = 'accent' | 'amber' | 'rose';

const TONE = {
  accent: { ring: 'border-accent bg-accent-wash', fallback: '#5ec8c2' },
  amber: { ring: 'border-amber bg-amber-wash', fallback: '#e0a84e' },
  rose: { ring: 'border-rose bg-rose-wash', fallback: '#e0788f' },
} as const satisfies Record<Tone, { ring: string; fallback: string }>;

const TONE_TOKENS = ['--accent', '--amber', '--rose'] as const;

interface Verdict {
  tone: Tone;
  symbol: ComponentProps<typeof SymbolView>['name'];
  headline: string;
  /** The one sentence that puts this attempt next to the ones before it. */
  note: string | null;
}

function verdictFor({
  score,
  previousBestPct,
  thresholdPct,
  checkpoint,
}: {
  score: QuizScore;
  previousBestPct: number | null;
  thresholdPct: number;
  checkpoint: boolean;
}): Verdict {
  const clearedBefore = previousBestPct !== null && previousBestPct >= thresholdPct;
  const passedLabel = checkpoint ? 'Chapter quiz passed' : 'Passed';

  if (score.passed) {
    if (previousBestPct !== null && score.scorePct > previousBestPct) {
      return {
        tone: 'accent',
        symbol: 'arrow.up.circle.fill',
        headline: 'A new best',
        note: `Up from ${previousBestPct}%.`,
      };
    }

    if (clearedBefore) {
      return {
        tone: 'accent',
        symbol: 'checkmark.circle.fill',
        headline: 'Passed again',
        note:
          score.scorePct === previousBestPct
            ? `You matched your best of ${previousBestPct}%.`
            : `Your best of ${previousBestPct}% still stands.`,
      };
    }

    return { tone: 'accent', symbol: 'checkmark.circle.fill', headline: passedLabel, note: null };
  }

  if (clearedBefore) {
    return {
      tone: 'amber',
      symbol: 'checkmark.seal.fill',
      headline: 'Short of the mark this time',
      note: `Your best of ${previousBestPct}% still stands, so the chapter stays cleared.`,
    };
  }

  return {
    tone: 'rose',
    symbol: 'arrow.counterclockwise.circle.fill',
    headline: 'Not passed yet',
    note:
      previousBestPct !== null && score.scorePct > previousBestPct
        ? `Closer than last time — up from ${previousBestPct}%.`
        : checkpoint
          ? 'Your best score is kept, so another go can only help.'
          : null,
  };
}

export function Results({
  document,
  answers,
  score,
  previousBestPct,
  thresholdPct,
  onDone,
}: Props) {
  const insets = useSafeAreaInsets();
  const [accent, amber, rose] = useTokens(TONE_TOKENS);

  const checkpoint = document.meta.kind === 'checkpoint';
  const marks = gradableQuestions(document).map((question) =>
    isCorrect(question, answers.get(question.id)),
  );

  const verdict = verdictFor({ score, previousBestPct, thresholdPct, checkpoint });
  const tint =
    (verdict.tone === 'accent' ? accent : verdict.tone === 'amber' ? amber : rose) ??
    TONE[verdict.tone].fallback;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="items-center px-[18px] pt-[28px]">
          {previousBestPct === null ? null : (
            <Text className="mb-[14px] font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
              Retake
            </Text>
          )}

          <View
            className={`h-[112px] w-[112px] items-center justify-center rounded-full border-2 ${
              TONE[verdict.tone].ring
            }`}
          >
            <Text className="text-[34px] font-semibold tracking-[-1px] text-ink">
              {score.scorePct}
              <Text className="text-[17px] font-medium text-ink-muted">%</Text>
            </Text>
          </View>

          <View className="mt-[18px] flex-row items-center gap-[7px]">
            <SymbolView name={verdict.symbol} size={16} tintColor={tint} />
            <Text className="text-[19px] font-semibold tracking-[-0.4px] text-ink">
              {verdict.headline}
            </Text>
          </View>

          <Text className="mt-[7px] text-center text-[13px] leading-[19px] text-ink-muted">
            {score.total === 0
              ? 'None of these questions could be graded by this version of the app.'
              : `${score.correct} of ${score.total} right · ${thresholdPct}% needed to pass`}
          </Text>

          {verdict.note ? (
            <Text className="mt-[10px] text-center text-[12.5px] leading-[18px] text-ink-faint">
              {verdict.note}
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
