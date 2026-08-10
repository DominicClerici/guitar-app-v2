// Ranking, and the separate question of how hard a shape is to hold.
//
// These are deliberately two different numbers. A five-string barre at fret 8 can
// be the best voicing of a rare quality and still be honestly labelled hard —
// collapsing the two would either bury the right answer or lie about the effort.

import type { Fingering } from './fingering';
import type { Difficulty } from './types';

interface Shape {
  fingering: Fingering;
  span: number;
  interiorMutes: number;
}

interface Ranking extends Shape {
  position: number;
  openStrings: number;
  sounding: number;
  /** How many chord tones the shape gave up, and out of how many. */
  omitted: number;
  chordSize: number;
  rootDoubled: boolean;
}

const WEIGHTS = {
  finger: 1,
  span: 0.8,
  barre: 1.5,
  /** Heavy: a string you have to deaden mid-chord is the hardest thing here. */
  interiorMute: 4,
  /**
   * Strong enough that a three-string shape at fret 10 cannot outrank the open
   * chord just by using fewer fingers. Everything is playable somewhere up the
   * neck; what a reference tool should offer first is what is near the nut.
   */
  position: 0.5,
  openString: 0.5,
  /**
   * Must exceed `finger`, or a shape always wins by dropping its outer string:
   * the five-string G beat the canonical six-string one until it did.
   */
  sounding: 1.1,
  /**
   * Charged in proportion to the chord, not per tone: losing one of a triad's
   * three notes guts it, losing one of a thirteenth's six is how the chord is
   * normally played. A flat penalty rated a fifth-less Bm above the real barre
   * shape.
   */
  omission: 12,
  rootDoubled: 0.3,
};

function fingersUsed(fingering: Fingering): number {
  const used = new Set(fingering.fingers.filter((finger) => finger !== null && finger > 0));
  return used.size;
}

/** Lower sorts first. */
export function scoreOf(input: Ranking): number {
  const cost =
    fingersUsed(input.fingering) * WEIGHTS.finger +
    input.span * WEIGHTS.span +
    (input.fingering.barre ? WEIGHTS.barre : 0) +
    input.interiorMutes * WEIGHTS.interiorMute +
    input.position * WEIGHTS.position +
    (input.omitted / input.chordSize) * WEIGHTS.omission;

  const credit =
    input.openStrings * WEIGHTS.openString +
    input.sounding * WEIGHTS.sounding +
    (input.rootDoubled ? WEIGHTS.rootDoubled : 0);

  return cost - credit;
}

/**
 * Physical effort, in the terms a player would use. `easy` means you can put it
 * down without thinking; `hard` means a barre carrying most of the shape, a full
 * four-fret stretch, or a string muted in the middle of the chord.
 */
export function difficultyOf(input: Shape): Difficulty {
  const fingers = fingersUsed(input.fingering);
  const barre = input.fingering.barre;

  if (input.interiorMutes > 0) return 'hard';
  if (barre && fingers >= 4) return 'hard';
  if (input.span >= 4 && fingers >= 4) return 'hard';

  if (!barre && fingers <= 3 && input.span <= 3) return 'easy';

  return 'moderate';
}
