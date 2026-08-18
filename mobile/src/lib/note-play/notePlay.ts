import {
  midiForTarget,
  type FretPosition,
  type FretWindow,
  type NotePlayRound,
} from '@/lib/content';
import { pitchName, type AccidentalSide } from '@/lib/accidentals';

// Every decision a note-play round makes, with no React and no microphone in sight.
//
// It is all here rather than in the runner because the interesting rules are the ones that are
// hard to see on a screen: which targets a frame is allowed to satisfy, and how many frames it
// takes before a pitch counts. Both are invisible when they work and indistinguishable from a
// flaky detector when they do not, so they are decided in functions a test can drive frame by
// frame.
//
// Targets are addressed by their index into `round.targets` throughout. A round is guaranteed by
// the publisher to contain no two targets sounding the same pitch, so a MIDI number would have
// been just as unique — but an index stays unique whatever a future schema allows, and it is what
// the board already draws from.

/** Beyond this the board stops being a board; the same ceiling the quiz board draws to. */
const MAX_FRET = 22;

/** Frets of air either side of the targets, so a shape does not sit flush against the edge. */
const WINDOW_PADDING = 1;

/**
 * Fewest frets a derived window shows. A round asking for one note would otherwise be drawn as a
 * three-column sliver, which tells the learner nothing about where on the neck they are.
 */
const MIN_WINDOW_FRETS = 5;

/**
 * A window starting this close to the nut is pulled down to it instead. The nut is the one
 * landmark a learner can find without counting, and the two frets it costs are cheap.
 */
const NUT_REACH = 2;

/**
 * The frets a round is drawn and read against: the round's own window, else the document's, else
 * one fitted to the targets.
 *
 * The declared cases are taken as written — the parser has already rejected any round whose
 * targets fall outside the window it declares, so there is nothing left here to reconcile.
 */
export function boardWindow(round: NotePlayRound, documentBoard?: FretWindow): FretWindow {
  return round.board ?? documentBoard ?? deriveWindow(round.targets);
}

/** The window a round gets when neither it nor its document names one. */
export function deriveWindow(targets: readonly FretPosition[]): FretWindow {
  const frets = targets.map((target) => target.fret);
  const lowest = Math.min(...frets);
  const highest = Math.max(...frets);

  let from = Math.max(0, lowest - WINDOW_PADDING);
  // Clamping the top could otherwise push it below a target on content written for a longer neck
  // than we draw, which would hide the very note being asked for.
  let to = Math.max(highest, Math.min(MAX_FRET, highest + WINDOW_PADDING));

  if (from <= NUT_REACH) from = 0;

  // Widened a fret at a time from alternating ends so a lone target lands mid-board rather than
  // against one edge of it.
  while (to - from + 1 < MIN_WINDOW_FRETS) {
    if (to < MAX_FRET) to += 1;
    else if (from > 0) from -= 1;
    else break;

    if (to - from + 1 >= MIN_WINDOW_FRETS) break;
    if (from > 0) from -= 1;
    else if (to < MAX_FRET) to += 1;
    else break;
  }

  return { fretFrom: from, fretTo: to };
}

/**
 * How far into a round the learner is.
 *
 * `pending` is the consecutive-frame rule, held as state rather than hidden in a ref inside the
 * runner: one frame on the right pitch is not a hit, two in a row is. It is the index a frame
 * matched and the next frame has to match again — anything else, including silence, drops it.
 */
export interface RoundProgress {
  /** Indexes into `round.targets` already found. A hit target stays hit. */
  readonly hits: ReadonlySet<number>;
  /** The target the previous frame matched, still one frame short of counting. */
  readonly pending: number | null;
}

export const emptyProgress: RoundProgress = { hits: new Set(), pending: null };

/**
 * The targets a frame is allowed to satisfy right now.
 *
 * An ordered round offers exactly one — the next unhit target — and a pitch matching any other is
 * simply not a hit. Anything else offers every unhit target at once, which is what makes a round
 * of three notes playable in whatever order they fall under the hand.
 */
export function liveTargets(round: NotePlayRound, hits: ReadonlySet<number>): number[] {
  const unhit = round.targets.map((_, index) => index).filter((index) => !hits.has(index));
  if (round.ordered !== true) return unhit;
  return unhit.length > 0 ? [unhit[0]] : [];
}

/**
 * The live target a pitch names, or null. Null covers three different situations the runner does
 * not need to tell apart: silence, a note that is on no target at all, and a note whose target has
 * already been found.
 */
export function matchingTarget(
  round: NotePlayRound,
  hits: ReadonlySet<number>,
  midi: number | null,
): number | null {
  if (midi === null) return null;
  const match = liveTargets(round, hits).find(
    (index) => midiForTarget(round.targets[index]) === midi,
  );
  return match ?? null;
}

/**
 * One detected frame folded into the round's progress. `midi` is `frame.note?.midi` — null for a
 * frame the detector called silence.
 *
 * Returns the progress it was given, by identity, when nothing changed. Frames arrive about every
 * 30ms and most of them change nothing, so this is what lets the runner hand every one of them
 * straight to `setState` without re-rendering the board thirty times a second.
 */
export function observeFrame(
  round: NotePlayRound,
  progress: RoundProgress,
  midi: number | null,
): RoundProgress {
  const match = matchingTarget(round, progress.hits, midi);

  if (match === null) {
    return progress.pending === null ? progress : { hits: progress.hits, pending: null };
  }

  // The second consecutive frame on the same target. One is too easy to fool with the transient at
  // the start of a note or a stray harmonic; a longer run starts refusing fast playing.
  if (progress.pending === match) {
    const hits = new Set(progress.hits);
    hits.add(match);
    return { hits, pending: null };
  }

  return { hits: progress.hits, pending: match };
}

export function roundComplete(round: NotePlayRound, progress: RoundProgress): boolean {
  return progress.hits.size >= round.targets.length;
}

/** The round after this one, or null when the run is over. */
export function nextRoundIndex(index: number, roundCount: number): number | null {
  const next = index + 1;
  return next < roundCount ? next : null;
}

/**
 * How a drill spells a black key when nothing has been chosen — sharps, which is how the neck is
 * counted going up and how these rounds have always been written.
 */
export const NOTE_PLAY_FALLBACK: AccidentalSide = 'sharp';

/**
 * A pitch as a learner reads it — "A3", "A#3". ASCII; the display layer glyphs it.
 *
 * A drill names a fret with no key or chord around it, so which side a black key is written on is
 * a genuinely open choice, and `side` is the user's answer to it (see `useAccidentalSide`).
 */
export function noteLabel(midi: number, side: AccidentalSide): string {
  return pitchName(midi, side);
}

/**
 * What a target sounds, named. Safe from `midiForTarget`'s throw: a round whose target is off a
 * six-string neck never survives parsing, so nothing that reaches here can name one.
 */
export function targetLabel(target: FretPosition, side: AccidentalSide): string {
  return noteLabel(midiForTarget(target), side);
}
