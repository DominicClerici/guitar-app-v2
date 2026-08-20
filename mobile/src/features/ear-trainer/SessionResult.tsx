import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import {
  degreeLabel,
  EAR_PASS_PCT,
  EAR_SESSION_QUESTIONS,
  type DegreeTally,
  type EarSession,
  type SessionSummary,
} from '@/lib/ear-training';
import { useTokens } from '@/lib/tokens';

// How a graded session went: the score against the pass mark, and then the part
// that is actually worth reading — which degrees you heard and which ones you
// did not. The per-degree tally is the only place a learner finds out that they
// pass every session and still cannot hear a sixth.

/**
 * Three tones, and the distinction the middle one exists for. A score below the
 * mark is only a setback if there was nothing behind it: `bestScorePct` merges
 * upwards and never falls, so a session already cleared cannot be lost by
 * sitting it again, and painting that the same alarming rose as a first miss
 * would say the opposite of what happened.
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
  /** The one sentence that puts this run next to the ones before it. */
  note: string | null;
}

function verdictFor({
  scorePct,
  passed,
  previousBestPct,
  nextTitle,
}: {
  scorePct: number;
  passed: boolean;
  previousBestPct: number | null;
  nextTitle: string | null;
}): Verdict {
  const clearedBefore = previousBestPct !== null && previousBestPct >= EAR_PASS_PCT;

  if (passed) {
    if (previousBestPct !== null && scorePct > previousBestPct) {
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
          scorePct === previousBestPct
            ? `You matched your best of ${previousBestPct}%.`
            : `Your best of ${previousBestPct}% still stands.`,
      };
    }

    return {
      tone: 'accent',
      symbol: 'checkmark.circle.fill',
      headline: 'Session passed',
      note: nextTitle === null ? 'That is the whole pathway.' : `${nextTitle} is open.`,
    };
  }

  if (clearedBefore) {
    return {
      tone: 'amber',
      symbol: 'checkmark.seal.fill',
      headline: 'Short of the mark this time',
      note: `Your best of ${previousBestPct}% still stands, so the session stays cleared.`,
    };
  }

  return {
    tone: 'rose',
    symbol: 'arrow.counterclockwise.circle.fill',
    headline: 'Not passed yet',
    note:
      previousBestPct !== null && scorePct > previousBestPct
        ? `Closer than last time — up from ${previousBestPct}%.`
        : 'Your best score is kept, so another go can only help.',
  };
}

/**
 * One degree's standing in this run, as one segment per time it was asked.
 *
 * Segments rather than a filled proportion: a degree comes up two or three times
 * in ten questions, and a bar drawn to 67% of a track invites the reader to
 * measure a percentage that was never the point. Right lights accent, wrong
 * lights rose, so the row says what happened rather than only how much of it did.
 *
 * A degree that never came up is drawn as an empty track rather than hidden:
 * ten questions over eight degrees cannot cover all of them, and a row that
 * vanished would read as a degree the session does not contain.
 */
function DegreeBar({ degree, tally }: { degree: number; tally: DegreeTally | undefined }) {
  const right = tally?.right ?? 0;
  const wrong = tally?.wrong ?? 0;
  const asked = right + wrong;

  return (
    <View
      accessibilityLabel={
        asked === 0
          ? `Degree ${degreeLabel(degree)} did not come up`
          : `Degree ${degreeLabel(degree)}: ${right} of ${asked} right`
      }
      className="flex-row items-center gap-[10px] py-[5px]"
    >
      <Text className="w-[26px] font-mono text-[11px] font-semibold text-ink-muted">
        {toAccidentalGlyphs(degreeLabel(degree))}
      </Text>

      <View className="h-[7px] flex-1 flex-row gap-[3px]">
        {asked === 0 ? (
          <View className="h-[7px] flex-1 rounded-full bg-line opacity-50" />
        ) : (
          Array.from({ length: asked }, (_, index) => (
            <View
              key={index}
              className={`h-[7px] flex-1 rounded-full ${index < right ? 'bg-accent' : 'bg-rose'}`}
            />
          ))
        )}
      </View>

      <Text className="w-[34px] text-right font-mono text-[10px] tracking-[0.5px] text-ink-faint">
        {asked === 0 ? '—' : `${right}/${asked}`}
      </Text>
    </View>
  );
}

export function SessionResult({
  session,
  result,
  scorePct,
  passed,
  previousBestPct,
  nextTitle,
}: {
  session: EarSession;
  result: SessionSummary;
  scorePct: number;
  passed: boolean;
  /** The high-water mark before this run; null if the session had never been sat. */
  previousBestPct: number | null;
  /** What a pass opens next, or null at the end of the pathway. */
  nextTitle: string | null;
}) {
  const [accent, amber, rose] = useTokens(TONE_TOKENS);

  const verdict = verdictFor({ scorePct, passed, previousBestPct, nextTitle });
  const tint =
    (verdict.tone === 'accent' ? accent : verdict.tone === 'amber' ? amber : rose) ??
    TONE[verdict.tone].fallback;

  return (
    <View>
      <View className="items-center px-[18px] pt-[20px]">
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
            {scorePct}
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
          {result.correct} of {EAR_SESSION_QUESTIONS} right · {EAR_PASS_PCT}% needed to pass
        </Text>

        {verdict.note ? (
          <Text className="mt-[10px] text-center text-[12.5px] leading-[18px] text-ink-faint">
            {verdict.note}
          </Text>
        ) : null}

        {result.bestStreak > 2 ? (
          <Text className="mt-[12px] font-mono text-[9.5px] uppercase tracking-[2px] text-accent">
            {result.bestStreak} in a row
          </Text>
        ) : null}
      </View>

      <View className="mt-[26px] px-[18px]">
        <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
          Degree by degree
        </Text>

        <View className="mt-[10px]">
          {session.degrees.map((degree) => (
            <DegreeBar key={degree} degree={degree} tally={result.perDegree[degree]} />
          ))}
        </View>
      </View>
    </View>
  );
}
