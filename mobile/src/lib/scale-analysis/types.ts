import type { Scale } from '@/lib/scale-library';

/** One tone of a (possibly modified) scale: its pitch class and spelled name. */
export interface ScaleTone {
  pc: number;
  name: string;
}

/**
 * One note-level change against the global scale. A swap displaces a scale tone
 * with its chromatic neighbour ("play A♭ instead of A"); an addition (fromPc
 * null) squeezes a note in without displacing anything — the chord uses both
 * neighbours, so nothing can leave.
 */
export interface NoteDelta {
  fromPc: number | null;
  toPc: number;
  fromName: string | null;
  toName: string;
}

/**
 * A maximal run of chords the global scale does not cover, with the smallest
 * set of note changes that does. `scale` is the dictionary name of the modified
 * set when it has one — the advice is the deltas either way.
 */
export interface ExceptionSpan {
  /** Chord indices into the progression, inclusive. */
  start: number;
  end: number;
  deltas: NoteDelta[];
  scale: Scale | null;
  /** The modified scale in full, ascending from the key's tonic. */
  tones: ScaleTone[];
}

/**
 * Whether the key's pentatonic works over the whole progression. Checked with a
 * clash rule rather than containment — a pentatonic doesn't need to hold a
 * chord's 7th to work over it, it only has to avoid grinding against one.
 */
export interface PentatonicVerdict {
  scale: Scale;
  /** The same five notes under their other name, e.g. C major pentatonic. */
  alias: Scale | null;
  survives: boolean;
  /** Indices of the chords the pentatonic rubs against. */
  clashes: number[];
}

/**
 * The full answer to "what can I play over this?": the key's scale, the
 * pentatonic lens on it, and the spans where the scale needs adjusting.
 */
export interface ScalePlan {
  global: Scale;
  pentatonic: PentatonicVerdict;
  /** The tonic blues scale, present only when the progression reads as blues. */
  blues: Scale | null;
  /** Per chord: do its sounding pitch classes all sit inside the global scale? */
  covered: boolean[];
  exceptions: ExceptionSpan[];
}
