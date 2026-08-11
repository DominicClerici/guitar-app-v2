import { AudioContext, type GainNode } from 'react-native-audio-api';

import { DEFAULT_VOICE, renderClick } from '@/features/metronome/clickVoices';

import type { ClickBeat } from './rhythmGrid';

/**
 * The click for one round, and the only thing here that touches an AudioContext.
 *
 * It is a much smaller relative of `features/metronome/metronomeEngine.ts`, and deliberately
 * so: a round is a fixed tempo for a fixed number of bars, with no tempo change, no pattern
 * editing and nothing to rebase, and in exchange for giving all of that up it hands back the
 * one thing the engine keeps to itself — the wall-clock time every click was scheduled for.
 * The drill cannot grade without that.
 *
 * What it borrows from the engine is the part that matters: a lookahead window, so a JS stall
 * shorter than it is inaudible; positions derived from a fixed anchor rather than accumulated,
 * so a round cannot drift; and a master fade on stop, because clicks already handed to the
 * audio thread cannot be recalled.
 *
 * THE AUDIO SESSION. The iOS session is process-wide. The microphone configures it as
 * `.playAndRecord` when it starts (`modules/expo-pitch-detector/ios/AudioEngine.swift`), which
 * is the only reason a click and a live microphone can coexist at all. So nothing in this
 * file calls `AudioManager` — not `setAudioSessionOptions`, not `setAudioSessionActivity` —
 * and callers must hold a microphone lease BEFORE `startClicks`, so the category is already
 * right when the context is created and the first click is scheduled.
 */

/** Everything inside this window is already on the audio thread. */
const LOOKAHEAD = 0.12;
/** Scheduler cadence. */
const TICK_MS = 16;
/** Gap between starting and the first click — room to schedule it rather than chase it. */
const LEAD_IN = 0.08;
/** Long enough not to pop, short enough to read as immediate. */
const STOP_FADE = 0.01;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

// The round, as a segment. `anchorAudioTime` is the AudioContext time of the pattern's
// downbeat — millisecond zero of the grid — and every click is one multiply-add away from it.
let plan: ClickBeat[] = [];
let scheduled = 0;
let anchorAudioTime = 0;

export interface RoundTiming {
  /** Epoch ms of the pattern's downbeat. The anchor everything else is graded against. */
  anchorEpochMs: number;
  /** Epoch ms of every click, in plan order. Calibration pairs its onsets against these. */
  clickEpochMs: number[];
  /** Epoch ms of the last click, so a caller knows when the round is over. */
  endsAtEpochMs: number;
}

function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  return ctx;
}

function pump() {
  const context = ctx;
  const out = master;
  if (!context || !out) return;

  const now = context.currentTime;

  while (scheduled < plan.length) {
    const time = anchorAudioTime + plan[scheduled].atMs / 1000;
    if (time >= now + LOOKAHEAD) break;

    // A click whose moment has already passed is dropped rather than fired late: the audio
    // API would sound it immediately, which after a stall means several at once. The grid is
    // unaffected either way — a round is graded against where the clicks were scheduled, not
    // against which of them were heard.
    if (time >= now) {
      renderClick(
        context,
        out,
        DEFAULT_VOICE.tones[plan[scheduled].accent ? 'accent' : 'beat'],
        time,
      );
    }
    scheduled += 1;
  }

  if (scheduled >= plan.length && timer) {
    clearInterval(timer);
    timer = null;
  }
}

/**
 * Schedules a whole round's clicks and returns when they are due, in wall-clock terms.
 *
 * The two clocks are tied together exactly once, here:
 *
 *     epochAtAudioZero = Date.now() - ctx.currentTime * 1000
 *
 * From that single anchor every click's epoch time is `epochAtAudioZero + audioTime * 1000`,
 * and every click's audio time is `anchorAudioTime + atMs / 1000` off a fixed number. Nothing
 * is re-read from a JS timer per beat, which is what would fold the scheduler's own jitter
 * into the very measurement the drill exists to take. Within a round the mapping is one
 * addition, so it cannot drift; across rounds it is re-established, which is the right place
 * for the two clocks to have wandered apart.
 */
export async function startClicks(clicks: readonly ClickBeat[]): Promise<RoundTiming> {
  const context = ensureContext();
  if (context.state !== 'running') await context.resume();

  const out = master;
  if (!out) throw new Error('The click has no output.');

  const now = context.currentTime;
  const epochAtAudioZero = Date.now() - now * 1000;

  plan = [...clicks];
  scheduled = 0;
  // The plan opens on the count-in, at the most negative offset it holds; shifting the anchor
  // forward by it is what puts the first click a lead-in from now.
  anchorAudioTime = now + LEAD_IN - (plan[0]?.atMs ?? 0) / 1000;

  out.gain.cancelScheduledValues(now);
  out.gain.setValueAtTime(1, now);

  if (timer) clearInterval(timer);
  timer = setInterval(pump, TICK_MS);
  pump();

  const anchorEpochMs = epochAtAudioZero + anchorAudioTime * 1000;
  const clickEpochMs = plan.map((click) => anchorEpochMs + click.atMs);

  return {
    anchorEpochMs,
    clickEpochMs,
    endsAtEpochMs: clickEpochMs[clickEpochMs.length - 1] ?? anchorEpochMs,
  };
}

export function stopClicks(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  plan = [];
  scheduled = 0;

  // Up to a lookahead of clicks are already on the audio thread and cannot be recalled.
  if (ctx && master) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + STOP_FADE);
  }
}

/**
 * Hands the context back. The session it was built on belongs to the microphone, so this has
 * to happen before the lease is released, not after.
 */
export function disposeClock(): void {
  stopClicks();
  const context = ctx;
  ctx = null;
  master = null;
  void context?.close().catch(() => {
    // A context the system already tore down is still gone, which is all this asked for.
  });
}
