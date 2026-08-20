import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SharedValue } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Face } from '@/components/Face';
import { MicGate } from '@/components/MicGate';
import { RichText } from '@/features/articles/RichText';
import {
  buildGrid,
  describeBias,
  describeBreakdown,
  describeScore,
  describeHeadroom,
  gradedMarks,
  SlotGrid,
  summariseRun,
  useRhythmDrill,
  verdictMap,
  type Calibration,
  type HeadroomReason,
  type PlayedMark,
  type RhythmGrid,
  type RoundResult,
} from '@/features/rhythm';
import type { ActivityDocument, RhythmActivity, RhythmRound } from '@/lib/content';
import { runnableRounds } from '@/lib/content';
import { getStatus, subscribeStatus } from '@/lib/mic';
import { useToken } from '@/lib/tokens';

import { ActivityIntro } from '../ActivityIntro';
import { ActivitySummary } from '../ActivitySummary';
import { recordActivityCompletion } from '../record';
import { RoundCountdown } from '../RoundCountdown';

// Play a written rhythm against a steady click, and be told when you played it.
//
// The drill listens for ONSETS rather than pitches. That is the whole design: a transient is
// detectable at a near-constant delay, whereas confirming which note it was takes another
// 40-100ms and takes longer for a low string than a high one. Timing measured through a
// pitch detector would be measuring the detector. Nothing here cares what was played, which
// is also why the exercise asks for muted strings.
//
// The audio, the microphone and the order the two may be started in live in
// `features/rhythm/useRhythmDrill`, which the standalone trainer runs on as well. What is left
// here is what a PATHWAY activity is: an intro card, a fixed list of authored rounds, a countdown
// between them, and the one local write that finishing leaves behind.

/** How long a round's result stays up on its own before the next countdown. */
const RESULT_MS = 4000;

export interface RhythmRunnerProps {
  document: ActivityDocument;
  activity: RhythmActivity;
  /** Null when opened outside a pathway — the run still works, nothing is recorded. */
  sectionId: string | null;
  userId: string | null;
  onDone: () => void;
}

type Phase =
  | { kind: 'intro' }
  | { kind: 'calibrating' }
  | { kind: 'blocked'; reason: HeadroomReason }
  | { kind: 'countdown'; round: number }
  | { kind: 'playing'; round: number }
  | { kind: 'result'; round: number; result: RoundResult }
  /** The mic went away mid-round — backgrounded, almost always. */
  | { kind: 'interrupted'; round: number }
  | { kind: 'summary' };

/**
 * `activity.rounds` is guaranteed to hold at least one runnable round: the registry checks
 * `runnableRounds` before this is ever rendered, so nothing here has to handle an empty
 * activity.
 */
export function RhythmRunner({ document, activity, sectionId, userId, onDone }: RhythmRunnerProps) {
  const insets = useSafeAreaInsets();
  const muted = useToken('--ink-muted', '#9aa0aa');

  const rounds = useMemo(() => runnableRounds(activity.rounds), [activity]);
  const grids = useMemo(() => rounds.map(buildGrid), [rounds]);

  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  const [results, setResults] = useState<RoundResult[]>([]);

  const engaged =
    phase.kind === 'calibrating' ||
    phase.kind === 'countdown' ||
    phase.kind === 'playing' ||
    phase.kind === 'result' ||
    phase.kind === 'interrupted';

  // The drill hands back three things, and each of them is a phase change here rather than
  // something to watch for in an effect: a pass was graded, the room was measured, or the
  // microphone went away mid-round.
  const onPass = useCallback((result: RoundResult) => {
    setPhase((current) => {
      if (current.kind !== 'playing') return current;
      setResults((all) => [...all.slice(0, current.round), result]);
      return { kind: 'result', round: current.round, result };
    });
  }, []);

  // A room the drill cannot hear a pick in stops the activity rather than grading through it: a run
  // judged in one would mark hits missed that were played perfectly well.
  const onCalibrated = useCallback((calibration: Calibration) => {
    setPhase(
      calibration.headroom.ok
        ? { kind: 'countdown', round: 0 }
        : { kind: 'blocked', reason: calibration.headroom.reason },
    );
  }, []);

  const onInterrupted = useCallback(() => {
    setPhase((current) =>
      current.kind === 'playing' ? { kind: 'interrupted', round: current.round } : current,
    );
  }, []);

  const drill = useRhythmDrill({
    input: 'mic',
    engaged,
    onPass,
    onCalibrated,
    onInterrupted,
  });
  const { calibrate, start } = drill;

  // The live marks while a round is being played; the graded ones the moment it has been judged.
  // Derived rather than handed back to the drill, which has no business knowing that a round is
  // being looked at rather than played.
  const marks = useMemo(
    () => (phase.kind === 'result' ? gradedMarks(phase.result) : drill.marks),
    [phase, drill.marks],
  );

  useEffect(() => {
    if (phase.kind !== 'calibrating') return;
    calibrate({ bpm: rounds[0].bpm, beatsPerBar: rounds[0].beatsPerBar });
  }, [phase.kind, rounds, calibrate]);

  useEffect(() => {
    if (phase.kind !== 'playing') return;
    start(grids[phase.round]);
  }, [phase, grids, start]);

  // The other half of the interruption. Watched through the session itself rather than the
  // rendered status, so the round resumes the moment the microphone is back rather than a render
  // later — and so the phase change happens in a callback, where one belongs.
  useEffect(() => {
    if (phase.kind !== 'interrupted') return;

    const round = phase.round;
    const resume = () => {
      if (getStatus() === 'listening') setPhase({ kind: 'countdown', round });
    };
    const offStatus = subscribeStatus(resume);
    // The session can come back between the round giving up and this subscribing.
    const timer = setTimeout(resume, 0);

    return () => {
      offStatus();
      clearTimeout(timer);
    };
  }, [phase]);

  // A learner mid-run has both hands on a guitar, so the result moves on by itself. The tap
  // on it only spends the wait early.
  useEffect(() => {
    if (phase.kind !== 'result') return;
    const last = rounds.length - 1;
    const timer = setTimeout(() => {
      setPhase(
        phase.round >= last ? { kind: 'summary' } : { kind: 'countdown', round: phase.round + 1 },
      );
    }, RESULT_MS);

    return () => clearTimeout(timer);
  }, [phase, rounds]);

  useEffect(() => {
    if (phase.kind !== 'summary') return;
    recordActivityCompletion(userId, sectionId);
  }, [phase.kind, userId, sectionId]);

  if (phase.kind === 'intro') {
    return (
      <ActivityIntro
        title={document.meta.title}
        summary={document.meta.summary}
        startLabel="Start"
        onStart={() => {
          setResults([]);
          setPhase(
            drill.calibration?.headroom.ok
              ? { kind: 'countdown', round: 0 }
              : { kind: 'calibrating' },
          );
        }}
      >
        <Explainer rounds={rounds} />
      </ActivityIntro>
    );
  }

  if (phase.kind === 'summary') {
    const run = summariseRun(results);
    return (
      <ActivitySummary
        title="Drill finished"
        subtitle={`${run.onTime} of ${run.expected} on time across ${results.length} round${results.length === 1 ? '' : 's'}.`}
        onPlayAgain={() => {
          setResults([]);
          setPhase({ kind: 'countdown', round: 0 });
        }}
        onDone={onDone}
      >
        <View className="px-[16px] py-[14px]">
          <Face name="card" radius={13} />
          <Text className="text-[13.5px] leading-[20px] text-ink-muted">
            {describeBias(run.bias)}
          </Text>
        </View>
      </ActivitySummary>
    );
  }

  return (
    <MicGate reason="This drill listens for the moment you pick, so it needs the microphone.">
      <View className="flex-1" style={{ paddingBottom: insets.bottom + 12 }}>
        {phase.kind === 'calibrating' ? (
          <Centred>
            <ActivityIndicator color={muted} />
            <Text className="mt-[16px] font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              Calibrating
            </Text>
            <Text className="mt-[12px] text-center text-[13.5px] leading-[20px] text-ink-muted">
              Two bars of click, and quiet from you. This measures the room, how loud the click
              comes back through the microphone, and how long this phone takes to make a sound and
              hear it again.
            </Text>
          </Centred>
        ) : phase.kind === 'blocked' ? (
          <Blocked
            reason={phase.reason}
            onRetry={() => {
              drill.forget();
              setPhase({ kind: 'calibrating' });
            }}
            onDone={onDone}
          />
        ) : phase.kind === 'interrupted' ? (
          <Centred>
            <ActivityIndicator color={muted} />
            <Text className="mt-[16px] font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              Paused
            </Text>
            <Text className="mt-[12px] text-center text-[13.5px] leading-[20px] text-ink-muted">
              The microphone stopped while the app was away, so that round could not be judged. It
              starts again from the count-in.
            </Text>
          </Centred>
        ) : phase.kind === 'countdown' ? (
          <RoundCountdown
            label={`Round ${phase.round + 1} of ${rounds.length}`}
            onDone={() => setPhase({ kind: 'playing', round: phase.round })}
          />
        ) : (
          <RoundView
            round={rounds[phase.round]}
            grid={grids[phase.round]}
            index={phase.round}
            total={rounds.length}
            progress={drill.progress}
            marks={marks}
            countingIn={phase.kind === 'playing' && drill.countingIn}
            result={phase.kind === 'result' ? phase.result : null}
            nominalLatency={drill.calibration?.latencySource === 'nominal'}
            onSkip={
              phase.kind === 'result'
                ? () =>
                    setPhase(
                      phase.round >= rounds.length - 1
                        ? { kind: 'summary' }
                        : { kind: 'countdown', round: phase.round + 1 },
                    )
                : null
            }
          />
        )}
      </View>
    </MicGate>
  );
}

function RoundView({
  round,
  grid,
  index,
  total,
  progress,
  marks,
  countingIn,
  result,
  nominalLatency,
  onSkip,
}: {
  round: RhythmRound;
  grid: RhythmGrid;
  index: number;
  total: number;
  progress: SharedValue<number>;
  marks: PlayedMark[];
  countingIn: boolean;
  result: RoundResult | null;
  nominalLatency: boolean;
  onSkip: (() => void) | null;
}) {
  return (
    <>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-[10px]"
      >
        <Text className="font-mono text-[10px] uppercase tracking-[2.5px] text-accent">
          Round {index + 1} of {total} · {round.bpm} bpm
        </Text>

        <RichText
          spans={round.prompt}
          className="mt-[10px] text-[15px] leading-[23px] text-ink-muted"
        />

        <View className="mt-[22px]">
          <SlotGrid
            grid={grid}
            progress={progress}
            marks={marks}
            verdicts={result ? verdictMap(result) : null}
          />
        </View>

        <View className="mt-[18px] min-h-[64px]">
          {result ? (
            <>
              <Text className="text-[18px] font-semibold tracking-[-0.4px] text-ink">
                {describeScore(result)}
              </Text>
              <Text className="mt-[6px] text-[13.5px] leading-[20px] text-ink-muted">
                {describeBias(result.bias)}
              </Text>
              <Text className="mt-[4px] text-[13px] leading-[19px] text-ink-faint">
                {describeBreakdown(result)}
              </Text>
            </>
          ) : (
            <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              {countingIn ? 'Count in' : 'Play'}
            </Text>
          )}
        </View>

        {nominalLatency ? (
          <Text className="mt-[14px] text-[12px] leading-[17px] text-ink-faint">
            The click never came back through the microphone — headphones, most likely — so the
            delay between hearing a click and being heard could not be measured. Early and late are
            judged against a typical value instead, and may sit a little to one side.
          </Text>
        ) : null}
      </ScrollView>

      {onSkip ? (
        // The result moves on by itself; this only spends the wait early, which is what keeps
        // it an accelerator rather than something a learner holding a guitar has to reach for.
        <View className="border-t border-t-line-soft px-[18px] pt-[12px]">
          <Button variant="primary" size="lg" accessibilityLabel="Continue now" onPress={onSkip}>
            Continue
          </Button>
        </View>
      ) : null}
    </>
  );
}

function Explainer({ rounds }: { rounds: RhythmRound[] }) {
  return (
    <View className="gap-[10px]">
      <Text className="text-[14px] leading-[21px] text-ink-muted">
        Mute the strings with your fretting hand and pick the written rhythm against the click.
        Nothing here listens for notes — only for the moment you pick — so what you play does not
        matter, and a dead, muted stroke reads best.
      </Text>
      <Text className="text-[14px] leading-[21px] text-ink-muted">
        The click sounds every beat, with the downbeat accented. It is a pacer, not the pattern:
        playing it back to you would be doing the exercise for you.
      </Text>
      <Text className="text-[14px] leading-[21px] text-ink-muted">
        Before the first round there are two bars of calibration. Stay quiet through them — that is
        when the room and the delay on this phone get measured.
      </Text>
      <Text className="text-[13px] leading-[19px] text-ink-faint">
        {rounds.length} round{rounds.length === 1 ? '' : 's'}. Nothing is graded and nothing is
        recorded but that you played it.
      </Text>
    </View>
  );
}

function Blocked({
  reason,
  onRetry,
  onDone,
}: {
  reason: HeadroomReason;
  onRetry: () => void;
  onDone: () => void;
}) {
  return (
    <Centred>
      <Text className="text-center text-[17px] font-semibold tracking-[-0.3px] text-ink">
        Not enough room to hear you
      </Text>
      <Text className="mt-[10px] text-center text-[13.5px] leading-[20px] text-ink-muted">
        {describeHeadroom(reason)}
      </Text>
      <Text className="mt-[10px] text-center text-[13px] leading-[19px] text-ink-faint">
        Starting anyway would mean marking hits missed that you played perfectly well.
      </Text>

      <View className="mt-[22px] flex-row gap-[10px]">
        <Button
          variant="secondary"
          size="md"
          accessibilityLabel="Leave the activity"
          onPress={onDone}
        >
          Back
        </Button>
        <Button variant="primary" size="md" accessibilityLabel="Calibrate again" onPress={onRetry}>
          Try again
        </Button>
      </View>
    </Centred>
  );
}

function Centred({ children }: { children: ReactNode }) {
  return <View className="flex-1 items-center justify-center px-[32px]">{children}</View>;
}
