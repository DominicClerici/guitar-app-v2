import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useMicStatus } from '@/components/MicGate';
import { clampBpm } from '@/features/metronome/patterns';
import type { RhythmSlot } from '@/lib/content';

import type { Calibration } from './calibration';
import { generatePattern, seededRng } from './patternGenerator';
import { presetFor, presetSlots } from './presets';
import type { RoundResult, Verdict } from './rhythmGrading';
import { buildGrid, type RhythmGrid } from './rhythmGrid';
import { gradedMarks, verdictMap, type PlayedMark } from './SlotGrid';
import { applyRamp, IDLE_RAMP, type RampState } from './tempoRamp';
import {
  COUNT_IN_BARS,
  PATTERN_BARS,
  type PatternSource,
  type TrainerSettings,
} from './trainerSettings';
import { loadSettings, saveSettings } from './trainerSettingsStore';
import { useRhythmDrill, type RhythmDrill } from './useRhythmDrill';

/**
 * The standalone trainer's session: one pattern, looping, graded every time round.
 *
 * The looping is what makes it a tool rather than a drill with an end. A pattern you can only play
 * once teaches you whether you got it; a pattern that comes back teaches you to hold it, which is
 * what the metronome next to it is for. So the pattern stays put until you change it, the tempo is
 * yours to move — or the ramp's, if you let it — and nothing here decides you are finished.
 *
 * `useRhythmDrill` runs the passes. This decides what the next one should be.
 */

/** Settings are saved this long after the last change, so dragging the tempo rail is one write. */
const SAVE_AFTER_MS = 500;

const KEEP_AWAKE_TAG = 'rhythm-trainer';

interface Pattern {
  slots: RhythmSlot[];
  subdivision: number;
  beatsPerBar: number;
}

export interface RhythmTrainer {
  settings: TrainerSettings;
  /** Replaces the named fields and leaves the rest, saving shortly after. */
  update: (patch: Partial<TrainerSettings>) => void;
  setBpm: (bpm: number) => void;
  nudge: (delta: number) => void;
  /** Generate mode only: another draw from the same note values. */
  shuffle: () => void;
  /** What is being played, at the tempo it is being played at. */
  grid: RhythmGrid;
  running: boolean;
  toggle: () => void;
  /** Passes completed in this run, and how they went in total. */
  passes: number;
  onTime: number;
  expected: number;
  /** The pass just graded, or null before the first one finishes. */
  last: RoundResult | null;
  /**
   * The last pass is what is on the grid rather than the one being played — true between passes and
   * through the count-in, which is the only window in which a looping drill can be read.
   */
  reviewing: boolean;
  /** What to draw under the pattern: the graded pass while reviewing, the live one otherwise. */
  marks: PlayedMark[];
  /** How each written hit was judged, or null while there is nothing to say about them. */
  verdicts: ReadonlyMap<number, Verdict> | null;
  /** Which way the ramp last moved the tempo. */
  moved: 'up' | 'down' | null;
  /** The room has not been measured yet, so pressing start measures it first. */
  needsCalibration: boolean;
  recalibrate: () => void;
  drill: RhythmDrill;
}

function patternFor(source: PatternSource, beatsPerBar: number, draw: number): Pattern {
  if (source.mode === 'preset') {
    const preset = presetFor(source.id);
    return {
      slots: presetSlots(preset, PATTERN_BARS),
      subdivision: preset.subdivision,
      // A preset brings its own meter: "Waltz" is not a 4/4 figure that happens to be in three.
      beatsPerBar: preset.beatsPerBar,
    };
  }

  const { slots, subdivision } = generatePattern(
    {
      values: source.values,
      rests: source.rests,
      beatsPerBar,
      bars: PATTERN_BARS,
    },
    seededRng(draw),
  );

  return { slots, subdivision, beatsPerBar };
}

function gridFor(pattern: Pattern, bpm: number): RhythmGrid {
  return buildGrid({
    bpm,
    beatsPerBar: pattern.beatsPerBar,
    subdivision: pattern.subdivision,
    bars: PATTERN_BARS,
    slots: pattern.slots,
    countInBars: COUNT_IN_BARS,
  });
}

export function useRhythmTrainer(): RhythmTrainer {
  const micStatus = useMicStatus();

  const [settings, setSettings] = useState<TrainerSettings>(loadSettings);
  const [running, setRunning] = useState(false);
  const [passes, setPasses] = useState(0);
  const [onTime, setOnTime] = useState(0);
  const [expected, setExpected] = useState(0);
  const [last, setLast] = useState<RoundResult | null>(null);
  const [moved, setMoved] = useState<'up' | 'down' | null>(null);
  const [ramp, setRamp] = useState<RampState>(IDLE_RAMP);

  // The pattern is derived rather than stored, which it can be because the draw is seeded: the
  // same settings and the same shuffle count always compose the same rhythm. Keyed on what a
  // pattern is actually made of, so moving the tempo does not reshuffle it under the hands playing
  // it, and `draw` is how the shuffle button asks for another one.
  const [draw, setDraw] = useState(0);
  const { source, beatsPerBar } = settings;
  const pattern = useMemo(() => patternFor(source, beatsPerBar, draw), [source, beatsPerBar, draw]);

  useEffect(() => {
    const timer = setTimeout(() => saveSettings(settings), SAVE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [settings]);

  // Read from callbacks that outlive the render they were made in: a pass finishing four bars later
  // has to know whether the tool is still running NOW, and at what tempo.
  const runningRef = useRef(running);
  const patternRef = useRef(pattern);
  const settingsRef = useRef(settings);
  const rampRef = useRef(ramp);
  const startRef = useRef<((grid: RhythmGrid) => void) | null>(null);

  useEffect(() => {
    runningRef.current = running;
    patternRef.current = pattern;
    settingsRef.current = settings;
    rampRef.current = ramp;
  }, [running, pattern, settings, ramp]);

  // Leaving the screen inside the debounce would otherwise throw away the change that sent you
  // there — picking a preset and going straight back is the ordinary case, not a corner one.
  useEffect(
    () => () => {
      saveSettings(settingsRef.current);
    },
    [],
  );

  const onPass = useCallback((result: RoundResult) => {
    setPasses((count) => count + 1);
    setOnTime((total) => total + result.onTime);
    setExpected((total) => total + result.expected);
    setLast(result);

    const held = settingsRef.current;
    let bpm = held.bpm;

    if (held.ramp.enabled) {
      const outcome = applyRamp(rampRef.current, result, bpm, held.ramp.step);
      bpm = outcome.bpm;
      rampRef.current = outcome.state;
      setRamp(outcome.state);
      setMoved(outcome.moved);
      if (bpm !== held.bpm) setSettings((current) => ({ ...current, bpm }));
    } else {
      setMoved(null);
    }

    // Straight into the next pass, at the tempo just computed rather than the one in state, which
    // this render has not seen yet.
    if (runningRef.current) startRef.current?.(gridFor(patternRef.current, bpm));
  }, []);

  const onCalibrated = useCallback((calibration: Calibration) => {
    if (!calibration.headroom.ok) {
      setRunning(false);
      return;
    }
    if (runningRef.current) {
      startRef.current?.(gridFor(patternRef.current, settingsRef.current.bpm));
    }
  }, []);

  const drill = useRhythmDrill({ input: settings.input, engaged: running, onPass, onCalibrated });
  const { calibrate, forget, start, stop } = drill;
  const drillPhase = drill.phase.kind;
  const calibration = drill.calibration;

  useEffect(() => {
    startRef.current = start;
  }, [start]);

  const grid = useMemo(() => gridFor(pattern, settings.bpm), [pattern, settings.bpm]);

  // A looping drill would otherwise never show you a graded pass: the next one starts the moment
  // this one is judged. So the judgement holds the grid until the downbeat that replaces it.
  const reviewing = last !== null && (!running || drill.countingIn);
  const marks = useMemo(
    () => (reviewing && last ? gradedMarks(last) : drill.marks),
    [reviewing, last, drill.marks],
  );
  const verdicts = useMemo(() => (reviewing && last ? verdictMap(last) : null), [reviewing, last]);

  const needsCalibration =
    settings.input === 'mic' && (calibration === null || !calibration.headroom.ok);

  // The pass gave up because the app went away. Once the session is back the pattern starts again
  // from its count-in rather than resuming — the clicks kept their schedule while nothing was
  // listening, so there is no grid left worth grading against.
  useEffect(() => {
    if (drillPhase !== 'interrupted' || !running || micStatus !== 'listening') return;
    start(gridFor(patternRef.current, settingsRef.current.bpm));
  }, [drillPhase, micStatus, running, start]);

  // Nothing on this screen is touched while it runs, and a drill that lets the display sleep
  // mid-practice is broken. The lock lasts only as long as the pattern.
  useEffect(() => {
    if (!running) return;
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [running]);

  const update = useCallback((patch: Partial<TrainerSettings>) => {
    setSettings((held) => ({ ...held, ...patch }));
  }, []);

  const setBpm = useCallback((bpm: number) => {
    setSettings((held) => ({ ...held, bpm: clampBpm(bpm) }));
  }, []);

  const nudge = useCallback((delta: number) => {
    setSettings((held) => ({ ...held, bpm: clampBpm(held.bpm + delta) }));
  }, []);

  const shuffle = useCallback(() => setDraw((token) => token + 1), []);

  const toggle = useCallback(() => {
    if (running) {
      stop();
      setRunning(false);
      return;
    }

    setPasses(0);
    setOnTime(0);
    setExpected(0);
    setLast(null);
    setMoved(null);
    setRamp(IDLE_RAMP);
    rampRef.current = IDLE_RAMP;
    runningRef.current = true;
    setRunning(true);

    if (needsCalibration) calibrate({ bpm: settings.bpm, beatsPerBar: pattern.beatsPerBar });
    else start(gridFor(pattern, settings.bpm));
  }, [running, needsCalibration, settings.bpm, pattern, calibrate, start, stop]);

  const recalibrate = useCallback(() => {
    stop();
    setRunning(false);
    forget();
  }, [stop, forget]);

  return {
    settings,
    update,
    setBpm,
    nudge,
    shuffle,
    grid,
    running,
    toggle,
    passes,
    onTime,
    expected,
    last,
    reviewing,
    marks,
    verdicts,
    moved,
    needsCalibration,
    recalibrate,
    drill,
  };
}
