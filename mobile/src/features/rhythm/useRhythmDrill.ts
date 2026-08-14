import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Easing,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useMicStatus } from '@/components/MicGate';
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

import {
  CALIBRATION_BARS,
  CALIBRATION_REFRACTORY_MS,
  CALIBRATION_THRESHOLD,
  deriveCalibration,
  pairClicks,
  pairWindowMs,
  refractoryMsFor,
  type Calibration,
  type HeadroomReason,
} from './calibration';
import { disposeClock, startClicks, stopClicks } from './rhythmClock';
import { grade, onsetAtMs, type RoundResult } from './rhythmGrading';
import { buildGrid, type RhythmGrid } from './rhythmGrid';
import type { PlayedMark } from './SlotGrid';

/**
 * Playing one pass of a written rhythm and being told how it went — the part of the drill that
 * cannot be a pure function, kept in one place so both things that run rhythms share it.
 *
 * Everything decidable is still outside: `rhythmGrid` says where the slots are, `rhythmGrading`
 * says what landed, `calibration` says what the room is like. What is left here is the audio
 * session, the microphone, and the order the two are allowed to be started in — and that order is
 * the reason this is a hook rather than a component. Two shells (the pathway activity and the
 * standalone trainer) want completely different chrome around identical audio; duplicating the
 * audio to get the chrome is how the two would drift.
 *
 * The shell owns what a pass MEANS — the next round, or the same pattern again — and this owns
 * what a pass IS.
 */

export type InputMode =
  /** Listening for the moment a string is picked. Needs calibration, and a quiet-ish room. */
  | 'mic'
  /** Tapping the screen instead. No permission, no calibration, and usable in a waiting room. */
  | 'tap';

/** Let the last click ring out, and give a late onset time to be delivered. */
const ROUND_TAIL_MS = 350;
/** Same, for the calibration bars. */
const CALIBRATION_TAIL_MS = 400;

export type DrillPhase =
  | { kind: 'idle' }
  | { kind: 'calibrating' }
  | { kind: 'blocked'; reason: HeadroomReason }
  | { kind: 'playing' }
  /** The mic went away mid-pass — backgrounded, almost always. */
  | { kind: 'interrupted' };

/** Where the calibration bars should click, since there is no pattern yet to take it from. */
export interface CalibrationTempo {
  bpm: number;
  beatsPerBar: number;
}

export interface UseRhythmDrillOptions {
  input: InputMode;
  /**
   * Whether a run is under way. The microphone lease is held for as long as this is true, rather
   * than per pass: dropping and retaking it between passes would flicker the recording indicator
   * and cost a session restart every time round.
   */
  engaged: boolean;
  /** A pass finished and was graded. */
  onPass: (result: RoundResult) => void;
  /** Calibration finished. `headroom.ok` false means the phase is now `blocked`. */
  onCalibrated?: (calibration: Calibration) => void;
  /** The microphone went away mid-pass, so there is nothing left worth grading. */
  onInterrupted?: () => void;
}

export interface RhythmDrill {
  phase: DrillPhase;
  calibration: Calibration | null;
  /** What has been heard so far in this pass. A shell showing a graded pass derives its own. */
  marks: PlayedMark[];
  /** 0 at the downbeat, 1 at the end of the last bar. Below zero parks the playhead offscreen. */
  progress: SharedValue<number>;
  countingIn: boolean;
  /** Measure the room. Mic mode only — in tap mode this is a no-op and there is nothing to measure. */
  calibrate: (at: CalibrationTempo) => void;
  start: (grid: RhythmGrid) => void;
  stop: () => void;
  /** A tap, in epoch milliseconds. Ignored unless a pass is running in tap mode. */
  strike: (atEpochMs: number) => void;
  /** Throw the measurement away, so the next `calibrate` takes a fresh one. */
  forget: () => void;
}

/**
 * A `setTimeout` that can be abandoned. A pass waits out its own length; a phase that ends early
 * has to stop waiting without leaving an async function parked on a timer that will still fire,
 * and without leaving that function parked forever either.
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

export function useRhythmDrill({
  input,
  engaged,
  onPass,
  onCalibrated,
  onInterrupted,
}: UseRhythmDrillOptions): RhythmDrill {
  const [phase, setPhase] = useState<DrillPhase>({ kind: 'idle' });
  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [marks, setMarks] = useState<PlayedMark[]>([]);
  const [countingIn, setCountingIn] = useState(false);

  // Written only from effects — never from a render, and never by the grid it is handed to.
  const progress = useSharedValue(-1);

  // What a pass is being run against. Held in a ref rather than in the phase because a shell may
  // hand over a newly built grid on every render, and a phase holding one would restart the pass
  // it is in the middle of. `pass` is the token that actually says "run again".
  const gridRef = useRef<RhythmGrid | null>(null);
  const calibrateAtRef = useRef<CalibrationTempo>({ bpm: 90, beatsPerBar: 4 });
  const [pass, setPass] = useState(0);

  // Callbacks reached from inside long-lived effects, where the closure captured at the start of a
  // pass would otherwise be the one called four bars later.
  const onPassRef = useRef(onPass);
  const onCalibratedRef = useRef(onCalibrated);
  const onInterruptedRef = useRef(onInterrupted);

  useEffect(() => {
    onPassRef.current = onPass;
    onCalibratedRef.current = onCalibrated;
    onInterruptedRef.current = onInterrupted;
  }, [onPass, onCalibrated, onInterrupted]);

  /** Installed for the length of a pass; how both a mic onset and a screen tap get recorded. */
  const recordRef = useRef<((atEpochMs: number) => void) | null>(null);

  // The drill only cares while it is engaged: a tuner sheet opening elsewhere in the app changes
  // the session's status, and a pass that is not running has no opinion about it.
  const listening = useMicStatus() === 'listening' && input === 'mic' && engaged;

  // THE ORDER HERE IS THE FEATURE. The iOS audio session is process-wide, and the microphone is
  // what puts it into a category that can play as well as record. So the lease is taken before any
  // AudioContext exists, and given back after the context is gone.
  useEffect(() => {
    if (!engaged) return;
    if (input === 'tap') return () => disposeClock();

    void acquire();

    return () => {
      void configureOnsets({ enabled: false, threshold: 1, refractoryMs: 0 });
      disposeClock();
      release();
    };
  }, [engaged, input]);

  // ─ calibration ─
  useEffect(() => {
    if (phase.kind !== 'calibrating' || !listening) return;

    const { bpm, beatsPerBar } = calibrateAtRef.current;
    const grid = buildGrid({
      bpm,
      beatsPerBar,
      subdivision: 1,
      bars: CALIBRATION_BARS,
      countInBars: 0,
      slots: [],
    });
    const waiter = createWaiter();
    const noiseRms: number[] = [];
    const onsets: OnsetEvent[] = [];
    let cancelled = false;

    const offFrames = subscribeRawFrames((frame) => noiseRms.push(frame.rms));
    const offOnsets = subscribeOnsets((event) => onsets.push(event));

    const run = async () => {
      // Deliberately far too sensitive: during calibration every click bleeding back through the
      // speaker must fire, because a click we do not hear is a click we cannot measure a round
      // trip from.
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
      // Disarmed rather than left at the calibration threshold, which is low enough that a room
      // between passes would fire onsets at a chair moving.
      await configureOnsets({ enabled: false, threshold: 1, refractoryMs: 0 });
      if (cancelled) return;

      const result = deriveCalibration({
        noiseRms,
        pairs: pairClicks(timing.clickEpochMs, onsets, pairWindowMs(grid.beatMs)),
      });

      setCalibration(result);
      setPhase(
        result.headroom.ok ? { kind: 'idle' } : { kind: 'blocked', reason: result.headroom.reason },
      );
      onCalibratedRef.current?.(result);
    };

    void run();

    return () => {
      cancelled = true;
      waiter.cancel();
      offFrames();
      offOnsets();
      stopClicks();
    };
  }, [phase, listening]);

  // ─ one pass ─
  useEffect(() => {
    if (phase.kind !== 'playing') return;

    const grid = gridRef.current;
    if (!grid) return;

    const usesMic = input === 'mic';
    if (usesMic && (!calibration || !listening)) return;

    const latencyMs = usesMic ? (calibration?.latencyMs ?? 0) : 0;
    const waiter = createWaiter();
    const strikes: { at: number }[] = [];
    let anchorEpochMs: number | null = null;
    let cancelled = false;
    let countIn: ReturnType<typeof setTimeout> | null = null;

    const record = (at: number) => {
      strikes.push({ at });
      // Drawn the moment it arrives, so the plan and the playing are one picture while the pass is
      // still going. What it is worth is decided at the end, all at once.
      if (anchorEpochMs === null) return;
      const atMs = onsetAtMs(at, anchorEpochMs, latencyMs);
      setMarks((current) => [...current, { id: current.length, atMs, tone: 'pending' }]);
    };
    recordRef.current = record;

    const offOnsets = usesMic ? subscribeOnsets((event) => record(event.at)) : null;

    // `lib/mic` suspends the session when the app goes to the background, and a pass that stopped
    // being listened to cannot be graded. Watched here rather than off the rendered status so the
    // pass gives up before the effect that owns it is torn down.
    const offStatus = usesMic
      ? subscribeStatus(() => {
          if (getStatus() === 'listening') return;
          setPhase({ kind: 'interrupted' });
          onInterruptedRef.current?.();
        })
      : null;

    const run = async () => {
      setCountingIn(grid.countInBars > 0);

      if (usesMic && calibration) {
        await configureOnsets({
          enabled: true,
          threshold: calibration.threshold,
          refractoryMs: refractoryMsFor(grid.slotMs),
        });
        if (cancelled) return;
      }

      const timing = await startClicks(grid.clicks, !usesMic);
      if (cancelled) return;
      anchorEpochMs = timing.anchorEpochMs;

      // The playhead is one straight line across the pattern. All the UI thread needs from this
      // side is how long until the downbeat, as a plain number — reading a clock inside the
      // animation is what the purity rule forbids, and what would make it lie anyway.
      const untilDownbeat = Math.max(timing.anchorEpochMs - Date.now(), 0);
      progress.value = 0;
      progress.value = withDelay(
        untilDownbeat,
        withTiming(1, { duration: grid.patternMs, easing: Easing.linear }),
      );
      // The previous pass stays on the grid through the count-in and is cleared at the downbeat,
      // not when this one was armed. That is the moment it stops being what you just played and
      // starts being clutter over what you are playing now — and it gives a looping drill a beat
      // or four to look at its own result without a screen that flashes empty between passes.
      countIn = setTimeout(() => {
        setCountingIn(false);
        setMarks([]);
      }, untilDownbeat);

      await waiter.until(timing.endsAtEpochMs - Date.now() + ROUND_TAIL_MS);
      if (cancelled) return;
      stopClicks();

      const result = grade({
        grid,
        anchorEpochMs: timing.anchorEpochMs,
        latencyMs,
        onsets: strikes,
      });

      progress.value = -1;
      setPhase({ kind: 'idle' });
      onPassRef.current(result);
    };

    void run();

    return () => {
      cancelled = true;
      waiter.cancel();
      if (countIn) clearTimeout(countIn);
      recordRef.current = null;
      offOnsets?.();
      offStatus?.();
      stopClicks();
      // Parked here rather than in `stop`, because this is the effect that owns the playhead —
      // and it covers every way a pass can end, not only the ones a caller asked for.
      progress.value = -1;
    };
  }, [phase, pass, input, calibration, listening, progress]);

  const calibrate = useCallback((at: CalibrationTempo) => {
    calibrateAtRef.current = at;
    setPhase({ kind: 'calibrating' });
  }, []);

  const start = useCallback((grid: RhythmGrid) => {
    gridRef.current = grid;
    // Set here as well as at the top of the pass, so there is no window between arming a pass and
    // the effect reaching its first `await` in which the drill claims to be mid-pattern. A shell
    // that shows the last result "until the count-in ends" would flicker through it.
    setCountingIn(grid.countInBars > 0);
    setPass((token) => token + 1);
    setPhase({ kind: 'playing' });
  }, []);

  const stop = useCallback(() => {
    stopClicks();
    setCountingIn(false);
    setPhase({ kind: 'idle' });
  }, []);

  const strike = useCallback((atEpochMs: number) => {
    recordRef.current?.(atEpochMs);
  }, []);

  const forget = useCallback(() => setCalibration(null), []);

  return {
    phase,
    calibration,
    marks,
    progress,
    countingIn,
    calibrate,
    start,
    stop,
    strike,
    forget,
  };
}
