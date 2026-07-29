// Can a hand actually hold this shape, and how?
//
// Fingering is not decoration — it is a validity test. A shape needing five
// fingers is not a voicing, it is a chord diagram nobody can play. So this runs
// inside the filter, not after it.

import type { Barre, Finger } from './types';

export const MAX_FINGERS = 4;
/** Comfortable reach. A five-fret stretch exists, but not in a reference tool. */
export const MAX_SPAN = 4;
/**
 * How far apart two strings on the *same* fret may be before separate fingers
 * stop working and the shape needs a barre. Two apart is fine — that is A7's
 * `x02020`, middle and ring either side of an open G. Four apart is the index
 * arching over half the neck, which is not a chord anyone plays.
 */
const MAX_REACH = 2;

export interface Fingering {
  fingers: (Finger | null)[];
  barre?: Barre;
}

interface Fretted {
  string: number;
  fret: number;
}

/**
 * Assign fingers to a fret pattern, or return null when no hand can hold it.
 *
 * A barre is taken only when the shape cannot be fingered without one, so
 * `x32010` comes back as three separate fingers rather than a barre at fret 1.
 */
export function fingerFor(frets: (number | null)[]): Fingering | null {
  const fretted: Fretted[] = [];
  frets.forEach((fret, string) => {
    if (fret !== null && fret > 0) fretted.push({ string, fret });
  });

  if (fretted.length === 0) return { fingers: openFingers(frets) };

  if (fretted.length <= MAX_FINGERS && !needsBarre(fretted)) {
    return { fingers: assign(frets, fretted, null) };
  }

  return withBarre(frets, fretted);
}

/**
 * True when the notes sharing the lowest fret are too far apart for one finger
 * each. The index has to lie flat to reach them — and if anything between them
 * is open or silent, `withBarre` will then reject the shape, which is the right
 * answer: nobody plays it.
 */
function needsBarre(fretted: Fretted[]): boolean {
  const lowest = Math.min(...fretted.map((note) => note.fret));
  const strings = fretted.filter((note) => note.fret === lowest).map((note) => note.string);
  if (strings.length < 2) return false;

  return Math.max(...strings) - Math.min(...strings) > MAX_REACH;
}

/** Everything sounding rings open. */
function openFingers(frets: (number | null)[]): (Finger | null)[] {
  return frets.map((fret) => (fret === null ? null : 0));
}

/**
 * Fingers ascend with the fret, so nothing is asked to reach back behind a
 * finger already down. Within one fret they run low string to high, which is the
 * order a hand falls into.
 */
function assign(
  frets: (number | null)[],
  fretted: Fretted[],
  barre: Barre | null,
): (Finger | null)[] {
  const fingers = openFingers(frets);

  const free = fretted
    .filter((note) => !(barre && note.fret === barre.fret && underBarre(barre, note.string)))
    .sort((a, b) => a.fret - b.fret || b.string - a.string);

  let next = barre ? 2 : 1;
  for (const note of free) {
    fingers[note.string] = next as Finger;
    next += 1;
  }

  if (barre) {
    for (let string = barre.firstString; string <= barre.lastString; string += 1) {
      if (frets[string] === barre.fret) fingers[string] = 1;
    }
  }

  return fingers;
}

function underBarre(barre: Barre, string: number): boolean {
  return string >= barre.firstString && string <= barre.lastString;
}

/**
 * The index finger flattens across the lowest fret, freeing the other three.
 *
 * The barre spans from the first string at that fret to the last, and strings
 * *between* them may be fretted higher — that is exactly how a D-shape barre
 * (x 5 7 7 7 5, low E first) works. A muted string inside the span is rejected:
 * a flattened finger is already touching it.
 */
function withBarre(frets: (number | null)[], fretted: Fretted[]): Fingering | null {
  const barreFret = Math.min(...fretted.map((note) => note.fret));
  const atFret = fretted.filter((note) => note.fret === barreFret).map((note) => note.string);
  if (atFret.length < 2) return null;

  const barre: Barre = {
    fret: barreFret,
    firstString: Math.min(...atFret),
    lastString: Math.max(...atFret),
  };

  // Nothing inside the span may be silent or ringing open: the finger is already
  // lying across it. An open string between two barred strings is the giveaway
  // that a shape only looks playable on paper.
  for (let string = barre.firstString; string <= barre.lastString; string += 1) {
    const fret = frets[string];
    if (fret === null || fret < barreFret) return null;
  }

  const remaining = fretted.filter(
    (note) => !(note.fret === barreFret && underBarre(barre, note.string)),
  );
  if (remaining.length > MAX_FINGERS - 1) return null;

  // The free fingers all have to fall on one side of the flattened index. A
  // barre across the middle three strings with notes fretted above *and* below
  // it wants the ring finger on the low E and the pinky on the high e at the
  // same time, which is not a hand.
  const outside = fretted.filter(
    (note) => note.string < barre.firstString || note.string > barre.lastString,
  );
  const above = outside.some((note) => note.string < barre.firstString);
  const below = outside.some((note) => note.string > barre.lastString);
  if (above && below) return null;

  return { fingers: assign(frets, fretted, barre), barre };
}

/** Lowest fingered fret, and how many frets the fingered notes cover. */
export function geometry(frets: (number | null)[]): { position: number; span: number } {
  const fingered = frets.filter((fret): fret is number => fret !== null && fret > 0);
  if (fingered.length === 0) return { position: 0, span: 0 };

  const lowest = Math.min(...fingered);
  return { position: lowest, span: Math.max(...fingered) - lowest + 1 };
}
