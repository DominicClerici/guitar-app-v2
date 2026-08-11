/**
 * What two bars of click, played to a silent room, tell us.
 *
 * Echo cancellation is deliberately off — the capture session runs in `.measurement` mode so
 * the pitch reading is honest (`modules/expo-pitch-detector/ios/AudioEngine.swift`) — which
 * means the click bleeds from the speaker back into the microphone. That bleed is not a
 * nuisance to be suppressed; it is the measurement. Three numbers fall out of it at once:
 *
 *   · the room's noise floor, from the raw frames between clicks;
 *   · how loud the click reads through the mic, which is the level a pluck must clear;
 *   · the round trip from scheduling a click to hearing it — output latency plus air plus
 *     input latency, for this device, in this room, with this volume.
 *
 * All of it is arithmetic over numbers someone else collected, so all of it is pure and all
 * of it is tested. The collecting lives in the runner.
 *
 * The absolute levels below are RMS over a 256-sample hop of float PCM in [-1, 1]. They are
 * reasoned estimates rather than measurements — a picked muted string a phone's length away
 * reads far hotter than a click through a phone speaker at half volume — and they are the
 * part of this file most likely to want retuning against a real device.
 */

/** Bars of click the calibration plays. Two is enough clicks for a median to mean something. */
export const CALIBRATION_BARS = 2;

/**
 * The threshold calibration listens at: low enough that every click bleed opens an onset,
 * because a click we do not hear is a click we cannot measure the round trip from. It is far
 * too low to run a round at, which is the whole reason calibration exists.
 */
export const CALIBRATION_THRESHOLD = 0.004;

/** Short enough not to swallow a click, long enough not to double-trigger on one. */
export const CALIBRATION_REFRACTORY_MS = 60;

/**
 * What the round trip is assumed to be when the click never comes back — headphones, almost
 * always. Roughly an iOS output buffer plus the onset detector's own hop, and openly a guess:
 * a wired pair is faster than this and a Bluetooth pair is several times slower, which is
 * why the UI says so rather than quietly grading against it.
 */
export const NOMINAL_LATENCY_MS = 60;

/** Onsets a click may be paired with must fall inside this much of it. */
export const MAX_PLAUSIBLE_LATENCY_MS = 400;

/**
 * A hop of slack before the click, because the onset is timestamped at the start of the
 * 256-sample hop whose envelope crossed — that start can precede the transient it detected.
 */
export const PAIR_BACK_SLACK_MS = 15;

/** Fewer pairs than this is not a median, it is an anecdote. */
export const MIN_CLICK_PAIRS = 3;

/**
 * The noise floor is taken low in the distribution rather than at the middle: the raw frame's
 * RMS spans ~93ms, so a good share of the frames collected during calibration have a click
 * inside them, and the median would measure the click we are trying to sit above.
 */
export const NOISE_PERCENTILE = 0.25;

/** How far above the click bleed the working threshold sits. One doubling, ~6 dB. */
export const CLICK_MARGIN = 2;
/** How far above the room. Wider, because the floor is a quiet-moment estimate. */
export const NOISE_MARGIN = 4;
/** Below this, a threshold is measuring the converter rather than the room. */
export const MIN_THRESHOLD = 0.012;
/**
 * The highest threshold a picked muted string can still be relied on to clear. Above it we
 * would be arming a detector that only fires for the loudest strokes, so the honest move is
 * to stop rather than to grade a round whose misses are ours.
 */
export const MAX_USABLE_THRESHOLD = 0.06;

export interface ClickPair {
  /** Epoch ms the click was scheduled to sound. */
  scheduledAtMs: number;
  /** Epoch ms the microphone put on the onset it produced. */
  heardAtMs: number;
  /** Peak short-window RMS of that onset — the click, as the microphone hears it. */
  peak: number;
  /** `heardAtMs - scheduledAtMs`. The round trip, once. */
  latencyMs: number;
}

export type HeadroomReason = 'click-too-loud' | 'room-too-noisy';

export type Headroom = { ok: true } | { ok: false; reason: HeadroomReason };

export interface Calibration {
  noiseFloor: number;
  /** Null when no click came back at all — headphones, or a muted phone. */
  clickPeak: number | null;
  latencyMs: number;
  latencySource: 'measured' | 'nominal';
  /** What to arm the onset detector with for the rounds. */
  threshold: number;
  headroom: Headroom;
}

export interface CalibrationInput {
  /** Raw-frame RMS collected while the learner stayed quiet. */
  noiseRms: readonly number[];
  pairs: readonly ClickPair[];
}

export function medianOf(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Nearest-rank, so the answer is always a value that was actually observed. */
export function percentileOf(values: readonly number[], fraction: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.min(sorted.length - 1, Math.max(0, Math.round(fraction * (sorted.length - 1))));
  return sorted[rank];
}

/**
 * Attributes onsets to the clicks that caused them.
 *
 * A click claims the first onset inside its window, and an onset can only be claimed once —
 * otherwise one late detection would be counted as evidence for two clicks in a row and drag
 * the median with it. Clicks with nothing in range simply produce no pair: the learner may be
 * on headphones, and half a bar of silence is not a failure to report.
 */
export function pairClicks(
  scheduledEpochMs: readonly number[],
  onsets: readonly { at: number; peak: number }[],
  windowMs: number = MAX_PLAUSIBLE_LATENCY_MS,
): ClickPair[] {
  const sorted = [...onsets].sort((a, b) => a.at - b.at);
  const claimed = new Array<boolean>(sorted.length).fill(false);
  const pairs: ClickPair[] = [];

  for (const scheduled of scheduledEpochMs) {
    const index = sorted.findIndex(
      (onset, i) =>
        !claimed[i] &&
        onset.at >= scheduled - PAIR_BACK_SLACK_MS &&
        onset.at <= scheduled + windowMs,
    );
    if (index === -1) continue;

    claimed[index] = true;
    pairs.push({
      scheduledAtMs: scheduled,
      heardAtMs: sorted[index].at,
      peak: sorted[index].peak,
      latencyMs: sorted[index].at - scheduled,
    });
  }

  return pairs;
}

/**
 * The window `pairClicks` should use for a given click spacing. It must stay well inside one
 * click so a very late detection is dropped rather than blamed on the click after it.
 */
export function pairWindowMs(clickSpacingMs: number): number {
  return Math.min(MAX_PLAUSIBLE_LATENCY_MS, clickSpacingMs * 0.6);
}

export function deriveCalibration({ noiseRms, pairs }: CalibrationInput): Calibration {
  const noiseFloor = percentileOf(noiseRms, NOISE_PERCENTILE) ?? 0;

  const measured = pairs.length >= MIN_CLICK_PAIRS;
  const clickPeak = measured ? medianOf(pairs.map((pair) => pair.peak)) : null;
  // A median across the calibration clicks, so one detection that fired on a chair creak
  // instead of the click moves the answer by nothing.
  const latency = measured ? medianOf(pairs.map((pair) => pair.latencyMs)) : null;

  const fromClick = (clickPeak ?? 0) * CLICK_MARGIN;
  const fromRoom = noiseFloor * NOISE_MARGIN;
  const threshold = Math.max(MIN_THRESHOLD, fromClick, fromRoom);

  return {
    noiseFloor,
    clickPeak,
    // Negative would mean the microphone heard the click before it was scheduled, which is
    // the hop-start slack showing rather than a real measurement.
    latencyMs: latency === null ? NOMINAL_LATENCY_MS : Math.max(0, latency),
    latencySource: latency === null ? 'nominal' : 'measured',
    threshold,
    headroom:
      threshold <= MAX_USABLE_THRESHOLD
        ? { ok: true }
        : { ok: false, reason: fromClick >= fromRoom ? 'click-too-loud' : 'room-too-noisy' },
  };
}

/**
 * The refractory gap to run a round at. Long enough that one pick attack cannot register
 * twice, and never long enough to hide the next written slot — at the fastest grid the
 * schema allows (sixteenths at 300 bpm, a 50ms slot) the floor still fits between two hits.
 */
export function refractoryMsFor(slotMs: number): number {
  return Math.min(90, Math.max(40, slotMs * 0.6));
}

const HEADROOM_ADVICE: Record<HeadroomReason, string> = {
  'click-too-loud':
    'The click is coming back into the microphone almost as loudly as your guitar would. Turn the volume down, move the phone further from the speaker, or use headphones.',
  'room-too-noisy':
    'There is too much going on in the room for a pick to stand out from it. Somewhere quieter, or headphones, would fix it.',
};

export function describeHeadroom(reason: HeadroomReason): string {
  return HEADROOM_ADVICE[reason];
}
