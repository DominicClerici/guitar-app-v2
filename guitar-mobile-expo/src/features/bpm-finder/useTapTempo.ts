import { useCallback, useEffect, useRef, useState } from 'react';

import { bpmFromIntervals, isRestart, MIN_INTERVAL_MS, spreadMs } from './tapTempo';

/** Silence that ends a session. The reading stays on screen; the next tap replaces it. */
export const IDLE_MS = 2200;

export interface TapTempoSession {
  /** Null until there are two taps to measure between. */
  bpm: number | null;
  taps: number;
  /** Mean absolute deviation of the intervals, in ms — null under three taps. */
  spread: number | null;
  /** The session timed out: what is on screen is the last reading, not a live one. */
  stale: boolean;
  /** Records a tap. Returns whether it began a new session rather than extending one. */
  tap: (at: number) => boolean;
  reset: () => void;
}

function toIntervals(stamps: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < stamps.length; i += 1) out.push(stamps[i] - stamps[i - 1]);
  return out;
}

/**
 * Tap timing for the BPM finder: taps in, a live tempo out, and a session that
 * ends itself after {@link IDLE_MS} of silence.
 *
 * The taps are held in a ref as well as in state because `tap` has to decide
 * against what has actually been recorded, not against what the last render saw.
 * Two taps landing in one batch would otherwise both measure from the same
 * predecessor — unlikely at a musical tempo, wrong whenever the JS thread hitches.
 */
export function useTapTempo(): TapTempoSession {
  const [stamps, setStamps] = useState<number[]>([]);
  const [stale, setStale] = useState(false);

  const stampsRef = useRef<number[]>([]);
  const staleRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const arm = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      staleRef.current = true;
      setStale(true);
    }, IDLE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const tap = useCallback(
    (at: number): boolean => {
      // A timed-out session is history the moment it is tapped on again.
      const previous = staleRef.current ? [] : stampsRef.current;
      const last = previous[previous.length - 1];

      let next: number[];
      let fresh: boolean;

      if (last === undefined) {
        next = [at];
        fresh = true;
      } else {
        const gap = at - last;
        // The finger bounced. Not a beat, and not something to restart on either.
        if (gap < MIN_INTERVAL_MS) return false;

        if (isRestart(toIntervals(previous), gap)) {
          next = [at];
          fresh = true;
        } else {
          next = [...previous, at];
          fresh = false;
        }
      }

      stampsRef.current = next;
      staleRef.current = false;
      setStamps(next);
      setStale(false);
      arm();
      return fresh;
    },
    [arm],
  );

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    stampsRef.current = [];
    staleRef.current = false;
    setStamps([]);
    setStale(false);
  }, []);

  const intervals = toIntervals(stamps);

  return {
    bpm: bpmFromIntervals(intervals),
    taps: stamps.length,
    spread: spreadMs(intervals),
    stale,
    tap,
    reset,
  };
}
