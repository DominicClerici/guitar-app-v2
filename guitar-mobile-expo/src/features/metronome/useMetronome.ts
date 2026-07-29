import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { useTapTempo } from '@/features/bpm-finder';

import {
  beatSV,
  getSnapshot,
  release,
  setBpm as engineSetBpm,
  setHaptics,
  setPattern,
  setPerBeat,
  setVoiceId,
  subscribe,
  tickSV,
  toggle,
  type MetronomeSnapshot,
} from './metronomeEngine';
import { clampBeats, cycleAccent, resizePattern } from './patterns';

/** Named so the screen's lock can be released independently of anything else holding one. */
const KEEP_AWAKE_TAG = 'metronome';

export type UseMetronomeResult = MetronomeSnapshot & {
  beats: number;
  /** Taps recorded in the current tap-tempo run, for the button's own feedback. */
  taps: number;
  beatSV: typeof beatSV;
  tickSV: typeof tickSV;
  toggle: () => void;
  setBpm: (bpm: number) => void;
  nudge: (delta: number) => void;
  setBeats: (beats: number) => void;
  cycleBeat: (index: number) => void;
  setPerBeat: (perBeat: number) => void;
  setVoiceId: (id: string) => void;
  setHaptics: (enabled: boolean) => void;
  tap: (at: number) => void;
};

/**
 * The screen's handle on the metronome. State lives in the engine rather than here
 * — the scheduler runs off a timer that no render is involved in, and it has to read
 * the current tempo and bar at the moment it commits a click, not at the moment React
 * last drew. So the engine owns them and this reports them.
 */
export function useMetronome(): UseMetronomeResult {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const tapTempo = useTapTempo();

  const tapBpm = tapTempo.bpm;
  useEffect(() => {
    if (tapBpm !== null) engineSetBpm(tapBpm);
  }, [tapBpm]);

  // Nothing on this screen is touched while it runs, and a metronome that lets the
  // display sleep mid-practice is broken. The lock lasts only as long as the click.
  useEffect(() => {
    if (!snapshot.running) return;
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [snapshot.running]);

  useEffect(() => () => release(), []);

  const nudge = useCallback((delta: number) => {
    engineSetBpm(getSnapshot().bpm + delta);
  }, []);

  const setBeats = useCallback((beats: number) => {
    setPattern(resizePattern(getSnapshot().pattern, clampBeats(beats)));
  }, []);

  const cycleBeat = useCallback((index: number) => {
    const pattern = getSnapshot().pattern;
    if (index < 0 || index >= pattern.length) return;
    const next = [...pattern];
    next[index] = cycleAccent(next[index]);
    setPattern(next);
  }, []);

  return {
    ...snapshot,
    beats: snapshot.pattern.length,
    // A timed-out run is history; the button should be inviting a fresh count, not
    // still showing the last one's total.
    taps: tapTempo.stale ? 0 : tapTempo.taps,
    beatSV,
    tickSV,
    toggle,
    setBpm: engineSetBpm,
    nudge,
    setBeats,
    cycleBeat,
    setPerBeat,
    setVoiceId,
    setHaptics,
    tap: tapTempo.tap,
  };
}
