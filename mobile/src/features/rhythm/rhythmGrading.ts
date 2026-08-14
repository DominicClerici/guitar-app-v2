import type { RhythmGrid, GridSlot } from './rhythmGrid';

/**
 * Turning a list of microphone onsets into a verdict per written hit. The heart of the
 * drill, and a function of its arguments alone — no clock, no audio context, no state — so
 * that every judgement it makes can be pinned down in a test rather than on a device.
 *
 * The one number it cannot derive is `latencyMs`: how long the round trip from "the click
 * was scheduled" to "the microphone heard it" takes on this particular phone in this
 * particular room. Calibration measures it; this subtracts it. Everything else follows from
 * the grid.
 */

/** Half-width of the window an onset may be matched to a slot from, as a fraction of a SLOT. */
export const MATCH_WINDOW_FRACTION = 0.4;

/**
 * Half-width of the band inside that window which counts as on the beat. Proportional, so
 * the same drill reads the same at any tempo, but bounded at both ends because human timing
 * accuracy is not proportional: 18% of a slow quarter note is a fifth of a second, which
 * nobody would hear as "on", and 18% of a fast sixteenth is tighter than a session player.
 */
export const ON_BAND_FRACTION = 0.18;
export const ON_BAND_FLOOR_MS = 25;
export const ON_BAND_CEILING_MS = 70;

export type Verdict = 'early' | 'on' | 'late' | 'missed';

export type Bias =
  | 'steady'
  | 'slightly-ahead'
  | 'ahead'
  | 'slightly-behind'
  | 'behind'
  /** Nothing landed close enough to any written hit to say. */
  | 'unknown';

export interface HitResult {
  slotIndex: number;
  /** Where the hit is written, milliseconds from the downbeat. */
  slotAtMs: number;
  verdict: Verdict;
  /** Where the onset actually landed, milliseconds from the downbeat. Null when missed. */
  playedAtMs: number | null;
  /** Signed distance from the slot. Negative is early. Null when missed. */
  deviationMs: number | null;
}

export interface RoundResult {
  /** One entry per written hit, in the order they are written. */
  hits: HitResult[];
  /** Onsets belonging to no written hit, as milliseconds from the downbeat. */
  extras: number[];
  expected: number;
  onTime: number;
  early: number;
  late: number;
  missed: number;
  /** Mean signed deviation across matched onsets. Negative means ahead of the beat. */
  meanDeviationMs: number | null;
  bias: Bias;
  /** The windows this result was judged against, so the display can draw them. */
  onBandMs: number;
  matchWindowMs: number;
}

export interface GradingInput {
  grid: RhythmGrid;
  /** Epoch ms of the pattern's downbeat, from the clock that scheduled the round. */
  anchorEpochMs: number;
  /** Measured round trip from scheduling a click to hearing it, in ms. */
  latencyMs: number;
  onsets: readonly { at: number }[];
}

export function matchWindowMs(slotMs: number): number {
  return slotMs * MATCH_WINDOW_FRACTION;
}

export function onBandMs(slotMs: number): number {
  const proportional = slotMs * ON_BAND_FRACTION;
  const bounded = Math.min(Math.max(proportional, ON_BAND_FLOOR_MS), ON_BAND_CEILING_MS);
  // At extreme tempos the floor can exceed the window an onset had to fall inside to be
  // matched at all. Everything that got this far is then as close as the grid can resolve.
  return Math.min(bounded, matchWindowMs(slotMs));
}

/** Where an onset sits on the grid: what the microphone timestamped, less the round trip. */
export function onsetAtMs(onsetEpochMs: number, anchorEpochMs: number, latencyMs: number): number {
  return onsetEpochMs - latencyMs - anchorEpochMs;
}

interface Candidate {
  onset: number;
  slot: number;
  distance: number;
}

export function grade({ grid, anchorEpochMs, latencyMs, onsets }: GradingInput): RoundResult {
  const window = matchWindowMs(grid.slotMs);
  const band = onBandMs(grid.slotMs);
  const expected: GridSlot[] = grid.slots.filter((slot) => slot.expectsHit);

  // Anything outside the pattern belongs to another part of the run — a string ringing
  // through the count-in, a chord struck after the last bar — and is neither a hit nor a
  // mistake this round can name.
  const played = onsets
    .map((onset) => onsetAtMs(onset.at, anchorEpochMs, latencyMs))
    .filter((at) => at >= -window && at <= grid.patternMs)
    .sort((a, b) => a - b);

  const candidates: Candidate[] = [];
  played.forEach((at, onset) => {
    expected.forEach((slot, index) => {
      const distance = Math.abs(at - slot.atMs);
      // Inclusive: an onset exactly on the boundary is inside the window it is measured
      // against, and rounding it out would make the window's edge depend on float noise.
      if (distance <= window) candidates.push({ onset, slot: index, distance });
    });
  });

  // Nearest first, so a slot goes to the onset that best explains it and a second onset in
  // the same window falls through to `extras` rather than displacing the better one. The
  // later tiebreakers only exist to make the outcome independent of iteration order.
  candidates.sort((a, b) => a.distance - b.distance || a.onset - b.onset || a.slot - b.slot);

  const slotForOnset = new Array<number>(played.length).fill(-1);
  const onsetForSlot = new Array<number>(expected.length).fill(-1);
  for (const candidate of candidates) {
    if (slotForOnset[candidate.onset] !== -1) continue;
    if (onsetForSlot[candidate.slot] !== -1) continue;
    slotForOnset[candidate.onset] = candidate.slot;
    onsetForSlot[candidate.slot] = candidate.onset;
  }

  const deviations: number[] = [];
  const hits: HitResult[] = expected.map((slot, index) => {
    const onset = onsetForSlot[index];
    if (onset === -1) {
      return {
        slotIndex: slot.index,
        slotAtMs: slot.atMs,
        verdict: 'missed' as const,
        playedAtMs: null,
        deviationMs: null,
      };
    }

    const at = played[onset];
    const deviation = at - slot.atMs;
    deviations.push(deviation);

    return {
      slotIndex: slot.index,
      slotAtMs: slot.atMs,
      verdict:
        Math.abs(deviation) <= band ? ('on' as const) : deviation < 0 ? 'early' : ('late' as const),
      playedAtMs: at,
      deviationMs: deviation,
    };
  });

  const extras = played.filter((_, onset) => slotForOnset[onset] === -1);
  const meanDeviationMs = deviations.length
    ? deviations.reduce((sum, value) => sum + value, 0) / deviations.length
    : null;

  return {
    hits,
    extras,
    expected: expected.length,
    onTime: hits.filter((hit) => hit.verdict === 'on').length,
    early: hits.filter((hit) => hit.verdict === 'early').length,
    late: hits.filter((hit) => hit.verdict === 'late').length,
    missed: hits.filter((hit) => hit.verdict === 'missed').length,
    meanDeviationMs,
    bias: biasOf(meanDeviationMs, band),
    onBandMs: band,
    matchWindowMs: window,
  };
}

/**
 * A drift smaller than a fraction of the on-band is the grader's own noise as much as the
 * player's — the calibrated latency is a median estimate, not a measurement of this one
 * hit — so the only bias worth naming is one large enough to survive it.
 */
function biasOf(mean: number | null, band: number): Bias {
  if (mean === null) return 'unknown';
  const size = Math.abs(mean);
  if (size <= band * 0.4) return 'steady';
  if (size <= band) return mean < 0 ? 'slightly-ahead' : 'slightly-behind';
  return mean < 0 ? 'ahead' : 'behind';
}

const BIAS_LINE: Record<Bias, string> = {
  steady: 'Sitting right on the beat.',
  'slightly-ahead': 'Slightly ahead of the beat.',
  ahead: 'Consistently ahead of the beat — let the click arrive before you pick.',
  'slightly-behind': 'Slightly behind the beat.',
  behind: 'Consistently behind the beat — pick with the click rather than after it.',
  unknown: 'Nothing landed close enough to the pattern to read.',
};

export function describeBias(bias: Bias): string {
  return BIAS_LINE[bias];
}

export function describeScore(result: RoundResult): string {
  return `${result.onTime} of ${result.expected} on time`;
}

/**
 * What went wrong, counted rather than measured. Deliberately no milliseconds anywhere: the
 * onsets are sample-accurate but the latency they are judged against is a median estimate, so
 * "early" against a window drawn on screen is the most this can honestly claim.
 */
export function describeBreakdown(result: RoundResult): string {
  const parts: string[] = [];
  if (result.early > 0) parts.push(`${result.early} early`);
  if (result.late > 0) parts.push(`${result.late} late`);
  if (result.missed > 0) parts.push(`${result.missed} not heard`);
  if (result.extras.length > 0) parts.push(`${result.extras.length} in a rest`);

  return parts.length > 0 ? parts.join(', ') : 'Nothing landed outside the window.';
}

export interface RunSummary {
  onTime: number;
  expected: number;
  bias: Bias;
}

/**
 * A whole run, folded down. The bias is weighted by how many hits each round actually landed
 * rather than by round, so a round where almost nothing connected does not get an equal vote
 * on which way the learner leans.
 */
export function summariseRun(results: readonly RoundResult[]): RunSummary {
  let onTime = 0;
  let expected = 0;
  let matched = 0;
  let total = 0;
  let band = 0;

  for (const result of results) {
    onTime += result.onTime;
    expected += result.expected;
    band = Math.max(band, result.onBandMs);

    for (const hit of result.hits) {
      if (hit.deviationMs === null) continue;
      matched += 1;
      total += hit.deviationMs;
    }
  }

  return { onTime, expected, bias: biasOf(matched ? total / matched : null, band) };
}
