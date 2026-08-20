import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import {
  DegreeCircle,
  SessionResult,
  useEarSession,
  type DegreeMark,
  type EarPhase,
} from '@/features/ear-trainer';
import { recordAttempt } from '@/features/quiz';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import {
  degreeLabel,
  EAR_PASS_PCT,
  EAR_SESSION_QUESTIONS,
  earSessionById,
  sessionAfter,
  sessionBestPct,
  type EarSessionAt,
  type SessionSummary,
  type Verdict,
} from '@/lib/ear-training';
import { useLearnerId, useProgress } from '@/lib/learning';

// One graded session, start to finish, on one screen.
//
// The summary is a phase of this screen rather than a route of its own, for the
// reason the quiz runner gives: Back from a result should land on the pathway
// the learner came from, not replay the session they just sat.
//
// Nothing is written until the tenth verdict is confirmed. There is no partial
// credit and no resume — leaving mid-session records nothing, which is the
// honest behaviour when the alternative is deciding what a resumed run does
// about the questions it has already shown the answers to.

/** What this run left behind, frozen at the moment it was recorded. */
interface Outcome {
  scorePct: number;
  passed: boolean;
  /** The high-water mark *before* this run — captured before the write raises it. */
  previousBestPct: number | null;
}

export function EarSessionScreen({ id }: { id: string | undefined }) {
  const at = earSessionById(id);

  // A route naming a session no release ever minted, which is only reachable
  // from a stale link — there is nothing to run, so the screen says so.
  if (!at) return <Missing />;

  return <Session key={at.session.id} at={at} />;
}

function Missing() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[44px] flex-row items-center px-[18px]">
        <BackLink title="Ear" />
      </View>
      <View className="flex-1 items-center justify-center px-[32px]">
        <Text className="text-center text-[13px] leading-[19px] text-ink-muted">
          That session is not in the pathway.
        </Text>
      </View>
    </View>
  );
}

function Session({ at }: { at: EarSessionAt }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const userId = useLearnerId();
  const progress = useProgress(userId);

  const { session, track, index } = at;
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const record = (result: SessionSummary) => {
    const scorePct = Math.round((result.correct / EAR_SESSION_QUESTIONS) * 100);
    const passed = scorePct >= EAR_PASS_PCT;

    // Read before the write, because the write is what raises it.
    setOutcome({ scorePct, passed, previousBestPct: sessionBestPct(session, progress) });

    // `total` is the ten questions asked, and the percentage is rounded here so
    // that the gate — which re-derives from the stored number — cannot disagree
    // with the score on this screen. No session means no account to record
    // against; the run was still worth sitting.
    if (userId) {
      recordAttempt(userId, session.sectionId, {
        correct: result.correct,
        total: EAR_SESSION_QUESTIONS,
        scorePct,
        passed,
      });
    }
  };

  const trainer = useEarSession({ session, onComplete: record });

  const circleSize = Math.min(width - 44, 340);
  const next = sessionAfter(index);

  const marks: Partial<Record<number, DegreeMark>> | undefined = trainer.verdict
    ? trainer.verdict.correct
      ? { [trainer.verdict.degree]: 'correct' }
      : { [trainer.verdict.pick]: 'wrong', [trainer.verdict.degree]: 'correct' }
    : undefined;

  const retry = () => {
    setOutcome(null);
    trainer.restart();
  };

  if (trainer.phase === 'summary' && trainer.result && outcome) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
        <View className="h-[44px] flex-row items-center px-[18px]">
          <BackLink title={track.title} />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <SessionResult
            session={session}
            result={trainer.result}
            scorePct={outcome.scorePct}
            passed={outcome.passed}
            previousBestPct={outcome.previousBestPct}
            nextTitle={next?.session.title ?? null}
          />
        </ScrollView>

        <View
          className="flex-row gap-[10px] border-t border-t-line-soft px-[18px] pt-[12px]"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          {outcome.passed && next ? (
            <>
              <Button
                variant="secondary"
                size="lg"
                icon="arrow.counterclockwise"
                square
                radius={12}
                accessibilityLabel="Sit this session again"
                onPress={retry}
              />
              <Button
                variant="primary"
                size="lg"
                icon="arrow.right"
                className="flex-1"
                accessibilityLabel={`Next session — ${next.session.title}`}
                onPress={() =>
                  router.replace({
                    pathname: '/ear-session/[id]',
                    params: { id: next.session.id },
                  })
                }
              >
                Next session
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                accessibilityLabel="Back to the ear pathway"
                onPress={router.back}
              >
                Pathway
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon="arrow.counterclockwise"
                className="flex-1"
                accessibilityLabel="Sit this session again"
                onPress={retry}
              >
                {outcome.passed ? 'Again' : 'Try again'}
              </Button>
            </>
          )}
        </View>
      </View>
    );
  }

  const listening = trainer.phase === 'orientation';

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[44px] flex-row items-center px-[18px]">
        <BackLink title={track.title} />
      </View>

      <View className="flex-1 items-center justify-center">
        <View pointerEvents={listening ? 'none' : 'auto'} className={listening ? 'opacity-60' : ''}>
          <DegreeCircle
            size={circleSize}
            activeDegrees={session.degrees}
            dimInactive
            lockInactive
            sounding={trainer.sounding}
            marks={marks}
            onPress={trainer.tapDegree}
          >
            {trainer.phase === 'reveal' ? (
              <Button
                variant="primary"
                size="md"
                radius={999}
                icon="arrow.right"
                accessibilityLabel="Continue to the next question"
                onPress={trainer.continueNext}
              >
                Continue
              </Button>
            ) : trainer.phase === 'question' ? (
              <Button
                variant="secondary"
                size="lg"
                square
                radius={999}
                icon="arrow.counterclockwise"
                hitSlop={6}
                accessibilityLabel="Replay the question tone"
                onPress={trainer.replay}
              />
            ) : null}
          </DegreeCircle>
        </View>

        {/* Fixed height, so the circle never shifts as guidance comes and goes. */}
        <View className="mt-[14px] h-[40px] items-center justify-center px-[24px]">
          <Text className="text-center font-mono text-[9.5px] uppercase tracking-[1.8px] text-ink-faint">
            {hintFor(trainer.phase, trainer.verdict)}
          </Text>
        </View>
      </View>

      <View className="px-[18px] pt-[10px]" style={{ paddingBottom: insets.bottom + 14 }}>
        <QuestionTrack marks={trainer.marks} />
      </View>
    </View>
  );
}

function hintFor(phase: EarPhase, verdict: Verdict | null): string {
  if (phase === 'orientation') return 'Listen — 1, 3, 5 in the key';
  if (phase === 'question') return 'Which degree was that?';

  if (!verdict) return '';

  return verdict.correct
    ? `Right — ${toAccidentalGlyphs(degreeLabel(verdict.degree))}`
    : `That was ${toAccidentalGlyphs(degreeLabel(verdict.degree))} · tap to compare`;
}

/**
 * Ten questions as ten marks: right in accent, wrong in rose, the rest waiting.
 *
 * Segments rather than a count, so the run reads at a glance — and so a session
 * that is going badly is visible before the score says so.
 */
function QuestionTrack({ marks }: { marks: boolean[] }) {
  return (
    <View className="h-[5px] flex-row gap-[3px]">
      {Array.from({ length: EAR_SESSION_QUESTIONS }, (_, index) => {
        const mark = marks[index];

        return (
          <View
            key={index}
            className={`h-[5px] flex-1 rounded-[2px] ${
              mark === undefined ? 'bg-line' : mark ? 'bg-accent' : 'bg-rose'
            }`}
          />
        );
      })}
    </View>
  );
}
