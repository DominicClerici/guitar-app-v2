import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Easing,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { RichText } from '@/features/articles/RichText';
import type { ActivityDocument, RhythmActivity, RhythmRound } from '@/lib/content';
import { runnableRounds } from '@/lib/content';
import {
  acquire,
  configureOnsets,
  getStatus,
  release,
  subscribeOnsets,
  subscribeRawFrames,
  subscribeStatus,
  type OnsetEvent,
} from '@/lib/mic';
import { useToken } from '@/lib/tokens';

import { ActivityIntro } from '../ActivityIntro';
import { ActivitySummary } from '../ActivitySummary';
import { MicGate, useMicStatus } from '../MicGate';
import { recordActivityCompletion } from '../record';
import { RoundCountdown } from '../RoundCountdown';
import {
  CALIBRATION_BARS,
  CALIBRATION_REFRACTORY_MS,
  CALIBRATION_THRESHOLD,
  deriveCalibration,
  describeHeadroom,
  pairClicks,
  pairWindowMs,
  refractoryMsFor,
  type Calibration,
  type HeadroomReason,
} from './calibration';
import { disposeClock, startClicks, stopClicks } from './rhythmClock';
import {
  describeBias,
  describeBreakdown,
  describeScore,
  grade,
  onsetAtMs,
  summariseRun,
  type RoundResult,
  type Verdict,
} from './rhythmGrading';
import { buildGrid, type RhythmGrid } from './rhythmGrid';
import { SlotGrid, type PlayedMark } from './SlotGrid';

// Play a written rhythm against a steady click, and be told when you played it.
//
// The drill listens for ONSETS rather than pitches. That is the whole design: a transient is
// detectable at a near-constant delay, whereas confirming which note it was takes another
// 40-100ms and takes longer for a low string than a high one. Timing measured through a
// pitch detector would be measuring the detector. Nothing here cares what was played, which
// is also why the exercise asks for muted strings.
//
// Everything decidable lives in `rhythmGrid`, `rhythmGrading` and `calibration`, all pure and
// all tested. This file is the part that cannot be: the audio, the microphone, and the order
// the two are allowed to be started in.

/** How long a round's result stays up on its own before the next countdown. */
const RESULT_MS = 4000;
/** Let the last click ring out, and give a late onset time to be delivered. */
const ROUND_TAIL_MS = 350;
/** Same, for the calibration bars. */
const CALIBRATION_TAIL_MS = 400;

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
 * A `setTimeout` that can be abandoned. A round waits out its own length; a phase that ends
 * early has to stop waiting without leaving an async function parked on a timer that will
 * still fire, and without leaving that function parked forever either.
 */
function createWaiter() {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let finish: (() => void) | null = null;

  return {
    until(ms: number): Promise<void> {
      return new Promise<void>((resolve) => {
        finish = resolve;
        timer = setTimeout(resolve, Math.max(ms, 0));
      });
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
      finish?.();
      finish = null;
    },
  };
}

/**
 * `activity.rounds` is guaranteed to hold at least one runnable round: the registry checks
 * `runnableRounds` before this is ever rendered, so nothing here has to handle an empty
 * activity.
 */
export function RhythmRunner({ document, activity, sectionId, userId, onDone }: RhythmRunnerProps) {
  const insets = useSafeAreaInsets();
  const micStatus = useMicStatus();
  const muted = useToken('--ink-muted', '#9aa0aa');

  const rounds = runnableRounds(activity.rounds);
  const grids = rounds.map(buildGrid);

  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [marks, setMarks] = useState<PlayedMark[]>([]);
  const [countingIn, setCountingIn] = useState(false);

  // 0 at the downbeat, 1 at the end of the last bar; below zero parks the playhead offscreen.
  // Owned here because the runner is what knows when a round starts, and written only from
  // effects — never from a render, and never by the grid it is handed to.
  const progress = useSharedValue(-1);

  const needsMic =
    phase.kind === 'calibrating' ||
    phase.kind === 'countdown' ||
    phase.kind === 'playing' ||
    phase.kind === 'result' ||
    phase.kind === 'interrupted';

  // THE ORDER HERE IS THE FEATURE. The iOS audio session is process-wide, and the microphone
  // is what puts it into a category that can play as well as record. So the lease is taken
  // before any AudioContext exists, and given back after the context is gone.
  useEffect(() => {
    if (!needsMic) return;
    void acquire();

    return () => {
      void configureOnsets({ enabled: false, threshold: 1, refractoryMs: 0 });
      disposeClock();
      release();
    };
  }, [needsMic]);

  // ─ calibration ─
  useEffect(() => {
    if (phase.kind !== 'calibrating' || micStatus !== 'listening') return;

    const first = runnableRounds(activity.rounds)[0];
    const grid = buildGrid({ ...first, bars: CALIBRATION_BARS, countInBars: 0, slots: [] });
    const waiter = createWaiter();
    const noiseRms: number[] = [];
    const onsets: OnsetEvent[] = [];
    let cancelled = false;

    const offFrames = subscribeRawFrames((frame) => noiseRms.push(frame.rms));
    const offOnsets = subscribeOnsets((event) => onsets.push(event));

    const run = async () => {
      // Deliberately far too sensitive: during calibration every click bleeding back through
      // the speaker must fire, because a click we do not hear is a click we cannot measure a
      // round trip from.
      await configureOnsets({
        enabled: true,
        threshold: CALIBRATION_THRESHOLD,
        refractoryMs: CALIBRATION_REFRACTORY_MS,
      });
      if (cancelled) return;

      const timing = await startClicks(grid.clicks);
      if (cancelled) return;

      await waiter.until(timing.endsAtEpochMs - Date.now() + CALIBRATION_TAIL_MS);
      if (cancelled) return;
      stopClicks();
      // Disarmed rather than left at the calibration threshold, which is low enough that the
      // countdown before the first round would fire onsets at a chair moving.
      await configureOnsets({ enabled: false, threshold: 1, refractoryMs: 0 });
      if (cancelled) return;

      const result = deriveCalibration({
        noiseRms,
        pairs: pairClicks(timing.clickEpochMs, onsets, pairWindowMs(grid.beatMs)),
      });
      setCalibration(result);

      if (!result.headroom.ok) {
        setPhase({ kind: 'blocked', reason: result.headroom.reason });
        return;
      }
      setPhase({ kind: 'countdown', round: 0 });
    };

    void run();

    return () => {
      cancelled = true;
      waiter.cancel();
      offFrames();
      offOnsets();
      stopClicks();
    };
  }, [phase, micStatus, activity]);

  // ─ one round ─
  useEffect(() => {
    if (phase.kind !== 'playing' || !calibration || micStatus !== 'listening') return;

    const round = runnableRounds(activity.rounds)[phase.round];
    const grid = buildGrid(round);
    const waiter = createWaiter();
    const onsets: OnsetEvent[] = [];
    let anchorEpochMs: number | null = null;
    let cancelled = false;
    let countIn: ReturnType<typeof setTimeout> | null = null;

    const offOnsets = subscribeOnsets((event) => {
      onsets.push(event);
      // Drawn the moment it arrives, so the plan and the playing are one picture while the
      // round is still going. What it is worth is decided at the end, all at once.
      if (anchorEpochMs === null) return;
      const atMs = onsetAtMs(event.at, anchorEpochMs, calibration.latencyMs);
      setMarks((current) => [...current, { id: current.length, atMs, tone: 'pending' }]);
    });

    // `lib/mic` suspends the session when the app goes to the background, and a round that
    // stopped being listened to cannot be graded. Watched here rather than off the rendered
    // status so the round gives up before the effect that owns it is torn down.
    const offStatus = subscribeStatus(() => {
      if (getStatus() !== 'listening') setPhase({ kind: 'interrupted', round: phase.round });
    });

    const run = async () => {
      setMarks([]);
      setCountingIn(grid.countInBars > 0);

      await configureOnsets({
        enabled: true,
        threshold: calibration.threshold,
        refractoryMs: refractoryMsFor(grid.slotMs),
      });
      if (cancelled) return;

      const timing = await startClicks(grid.clicks);
      if (cancelled) return;
      anchorEpochMs = timing.anchorEpochMs;

      // The playhead is one straight line across the pattern. All the UI thread needs from
      // this side is how long until the downbeat, as a plain number — reading a clock inside
      // the animation is what the purity rule forbids, and what would make it lie anyway.
      const untilDownbeat = Math.max(timing.anchorEpochMs - Date.now(), 0);
      progress.value = 0;
      progress.value = withDelay(
        untilDownbeat,
        withTiming(1, { duration: grid.patternMs, easing: Easing.linear }),
      );
      countIn = setTimeout(() => setCountingIn(false), untilDownbeat);

      await waiter.until(timing.endsAtEpochMs - Date.now() + ROUND_TAIL_MS);
      if (cancelled) return;
      stopClicks();

      const result = grade({
        grid,
        anchorEpochMs: timing.anchorEpochMs,
        latencyMs: calibration.latencyMs,
        onsets,
      });

      progress.value = -1;
      setMarks(markRound(result));
      setResults((current) => [...current.slice(0, phase.round), result]);
      setPhase({ kind: 'result', round: phase.round, result });
    };

    void run();

    return () => {
      cancelled = true;
      waiter.cancel();
      if (countIn) clearTimeout(countIn);
      offOnsets();
      offStatus();
      stopClicks();
    };
  }, [phase, micStatus, activity, calibration, progress]);

  // The other half of the interruption: once the session is back, the round is counted in
  // again from the top rather than resumed. The clicks kept their schedule while the app was
  // away, but nothing was listening, so there is no grid left worth grading against.
  useEffect(() => {
    if (phase.kind !== 'interrupted') return;

    const resume = () => {
      if (getStatus() === 'listening') setPhase({ kind: 'countdown', round: phase.round });
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
    const last = runnableRounds(activity.rounds).length - 1;
    const timer = setTimeout(() => {
      setPhase(
        phase.round >= last ? { kind: 'summary' } : { kind: 'countdown', round: phase.round + 1 },
      );
    }, RESULT_MS);

    return () => clearTimeout(timer);
  }, [phase, activity]);

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
          setPhase(calibration ? { kind: 'countdown', round: 0 } : { kind: 'calibrating' });
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
        <View className="rounded-[13px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface px-[16px] py-[14px]">
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
            onRetry={() => setPhase({ kind: 'calibrating' })}
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
            progress={progress}
            marks={marks}
            countingIn={phase.kind === 'playing' && countingIn}
            result={phase.kind === 'result' ? phase.result : null}
            nominalLatency={calibration?.latencySource === 'nominal'}
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
          <Pressable
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel="Continue now"
            className="items-center rounded-[13px] bg-accent py-[13px] active:opacity-80"
          >
            <Text className="text-[15px] font-semibold tracking-[-0.2px] text-on-accent">
              Continue
            </Text>
          </Pressable>
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
        <Pressable
          onPress={onDone}
          accessibilityRole="button"
          accessibilityLabel="Leave the activity"
          className="h-[46px] items-center justify-center rounded-[12px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface-raised px-[18px] active:opacity-70"
        >
          <Text className="text-[14px] font-medium tracking-[-0.2px] text-ink-muted">Back</Text>
        </Pressable>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Calibrate again"
          className="h-[46px] items-center justify-center rounded-[12px] bg-accent px-[18px] active:opacity-80"
        >
          <Text className="text-[14px] font-semibold tracking-[-0.2px] text-on-accent">
            Try again
          </Text>
        </Pressable>
      </View>
    </Centred>
  );
}

function Centred({ children }: { children: ReactNode }) {
  return <View className="flex-1 items-center justify-center px-[32px]">{children}</View>;
}

function verdictMap(result: RoundResult): Map<number, Verdict> {
  return new Map(result.hits.map((hit) => [hit.slotIndex, hit.verdict]));
}

/** The live marks, replaced by the graded ones once the round has been judged. */
function markRound(result: RoundResult): PlayedMark[] {
  const marks: PlayedMark[] = [];

  for (const hit of result.hits) {
    if (hit.playedAtMs === null) continue;
    marks.push({
      id: marks.length,
      atMs: hit.playedAtMs,
      tone: hit.verdict === 'on' ? 'on' : 'off',
    });
  }
  for (const extra of result.extras) {
    marks.push({ id: marks.length, atMs: extra, tone: 'extra' });
  }

  return marks;
}
