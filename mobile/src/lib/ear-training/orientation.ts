// How a graded session plants its key: the tonic triad struck up three octaves
// before the first question, so the ear has somewhere to hear the answers from.
//
// Always 1, 3, 5, whichever session is running — a minor session hears a major
// third on the way in, and that is accepted. The point of the sequence is to
// plant the *tonic*, and a landmark that never changes does that more reliably
// than one that moves under the learner every session.

import { toneMidiFor } from './degrees';

/** The landmark itself: tonic, third, fifth. */
export const ORIENTATION_DEGREES = [0, 4, 7] as const;

/** Low, base, high — the same three registers a question is drawn from. */
export const ORIENTATION_OCTAVES = [-1, 0, 1] as const;

/** Seconds between strikes. Fast enough to read as one gesture, slow enough to be nine notes. */
export const ORIENTATION_GAP_S = 0.22;

/**
 * How long a strike rings. Far shorter than a question tone's 1.6s: at full
 * decay the nine would pile into a chord, which is the one thing the sequence
 * must not sound like.
 */
export const ORIENTATION_DECAY_S = 0.35;

export interface OrientationStrike {
  midi: number;
  /** Seconds after the sequence starts, scheduled against the audio clock. */
  delay: number;
}

/**
 * Nine strikes, strictly ascending, ending a little under two seconds in.
 *
 * Scheduled as delays rather than played from a `setTimeout` chain so the
 * spacing is the audio clock's rather than the JS thread's — nine unevenly
 * spaced strikes read as a stumble, not a landmark.
 */
export function orientationSequence(tonicPc: number): OrientationStrike[] {
  return ORIENTATION_OCTAVES.flatMap((octave, octaveIndex) =>
    ORIENTATION_DEGREES.map((degree, degreeIndex) => ({
      midi: toneMidiFor(tonicPc, degree, octave),
      delay: (octaveIndex * ORIENTATION_DEGREES.length + degreeIndex) * ORIENTATION_GAP_S,
    })),
  );
}

/** Seconds from the first strike to the last one falling silent. */
export const ORIENTATION_TOTAL_S =
  (ORIENTATION_DEGREES.length * ORIENTATION_OCTAVES.length - 1) * ORIENTATION_GAP_S +
  ORIENTATION_DECAY_S;
