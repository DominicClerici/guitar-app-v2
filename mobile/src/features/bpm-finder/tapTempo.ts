/**
 * Which averaging the readout runs on. Both are implemented below and both are
 * live code — flip this to try the other one in the app.
 *
 * `window`   — flat mean of the last few intervals. Settles fast and tracks a
 *              drifting tap, which is what most tap-tempo tools do.
 * `weighted` — every interval counts, decaying with age. More responsive to the
 *              last tap, at the cost of a slightly livelier number.
 */
export const AVERAGING: 'window' | 'weighted' = 'window';

/** How many intervals `window` averages over. */
const WINDOW = 8;
/** Per-step decay for `weighted`: the newest interval carries this much weight. */
const ALPHA = 0.35;

/** Below this, two taps are one finger bouncing rather than a tempo. */
export const MIN_INTERVAL_MS = 120;
/**
 * An interval this many times the running median is a pause, not a beat. The
 * session restarts on it rather than letting the gap drag the average down —
 * this is the guard for hesitating mid-count, which the 3s idle timeout is too
 * slow to catch.
 */
const RESTART_RATIO = 2;

/** Taps needed before there is anything to report. */
export const MIN_TAPS = 2;

function mean(values: number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total / values.length;
}

/** The intervals `window` mode looks at — also what the spread is measured over. */
export function considered(intervals: number[]): number[] {
  return AVERAGING === 'window' ? intervals.slice(-WINDOW) : intervals;
}

/**
 * Exponentially weighted mean, newest first. Weights are normalised by their own
 * sum rather than assumed to reach 1, so a two-tap reading is as correct as a
 * twenty-tap one.
 */
function weightedMean(intervals: number[]): number {
  let total = 0;
  let weight = 0;
  for (let age = 0; age < intervals.length; age += 1) {
    const w = ALPHA * (1 - ALPHA) ** age;
    total += intervals[intervals.length - 1 - age] * w;
    weight += w;
  }
  return total / weight;
}

/** Beats per minute for a run of tap intervals, or null before there is one. */
export function bpmFromIntervals(intervals: number[]): number | null {
  if (intervals.length === 0) return null;
  const ms = AVERAGING === 'window' ? mean(considered(intervals)) : weightedMean(intervals);
  return ms > 0 ? 60000 / ms : null;
}

/**
 * Mean absolute deviation of the intervals in play, in milliseconds — how tight
 * the tapping was, and so how much the number can be trusted.
 */
export function spreadMs(intervals: number[]): number | null {
  const window = considered(intervals);
  if (window.length < 2) return null;
  const avg = mean(window);
  return mean(window.map((v) => Math.abs(v - avg)));
}

/** Whether a new interval reads as a pause rather than the next beat. */
export function isRestart(intervals: number[], next: number): boolean {
  if (intervals.length === 0) return false;
  const sorted = [...considered(intervals)].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return next > median * RESTART_RATIO;
}

const MARKINGS: { upTo: number; name: string }[] = [
  { upTo: 60, name: 'Largo' },
  { upTo: 76, name: 'Adagio' },
  { upTo: 108, name: 'Andante' },
  { upTo: 120, name: 'Moderato' },
  { upTo: 156, name: 'Allegro' },
  { upTo: 176, name: 'Vivace' },
  { upTo: Infinity, name: 'Presto' },
];

/** The classical term for a tempo, on the usual metronome-marking boundaries. */
export function tempoMarking(bpm: number): string {
  return MARKINGS.find((m) => bpm < m.upTo)!.name;
}
