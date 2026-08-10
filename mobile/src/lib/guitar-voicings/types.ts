import type { Degree } from '../theory';

/**
 * IMPORTANT — string indexing.
 *
 * Every array of length six in this module is indexed **0 = high e … 5 = low E**,
 * matching OPEN_PITCHES, PlacedNote and the fretboard UI. Guitarists write chord
 * charts the other way round, low E first. That reversal happens once, at the
 * display boundary, and nowhere else. Reading `frets[0]` as the low E is the
 * single most likely bug in this file's consumers.
 */

/** 1–4 are the fretting fingers; 0 means the string rings open. */
export type Finger = 0 | 1 | 2 | 3 | 4;

/**
 * An index-finger barre. `firstString` and `lastString` are inclusive string
 * indices in the convention above, so `firstString` is the *higher-pitched* end.
 * Strings inside the span may be fretted above the barre by other fingers — that
 * is how a D-shape barre works — but none may be muted.
 */
export interface Barre {
  fret: number;
  firstString: number;
  lastString: number;
}

/**
 * Where on the neck a shape sits. `open` is any shape with a ringing open
 * string, wherever its fretted notes fall — an open string is the thing that
 * defines how the shape sounds and how it is reached for.
 */
export type NeckRegion = 'open' | 'low' | 'mid' | 'high';

/** Physical effort only — fingers, span, barre. Not the same thing as rank. */
export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface Voicing {
  /** Stable key for lists: the fret pattern, low E first. */
  id: string;
  /** Fret per string. null means the string is not played. */
  frets: (number | null)[];
  /** Finger per string: 1–4 fretted, 0 open, null muted. */
  fingers: (Finger | null)[];
  /** Present only when the shape needs a barre to be playable at all. */
  barre?: Barre;
  /** Lowest fingered fret; 0 when nothing is fingered. */
  position: number;
  /** Frets spanned by the fingered notes; 0 when nothing is fingered. */
  span: number;
  region: NeckRegion;
  /** Degree sounding on each string, aligned with `frets`. */
  degrees: (Degree | null)[];
  /** Spelled note sounding on each string, aligned with `frets`. */
  notes: (string | null)[];
  /** Chord tones this shape gives up, in the catalogue's drop order. */
  omitted: Degree[];
  /** Degree of the lowest sounding string. '1' is root position. */
  bass: Degree;
  /** Set only for inversions, e.g. "Cmaj7/E". */
  slashSymbol?: string;
  difficulty: Difficulty;
  /** Ranking cost — lower sorts first. Kept for debugging and dumps. */
  score: number;
}

export interface VoicingOptions {
  /** Highest fret to search. Defaults to the neck the fretboard UI draws. */
  maxFret?: number;
  /**
   * false (default) keeps the root in the bass. true returns *only* inversions,
   * so the two passes can be presented as separate groups.
   */
  inversions?: boolean;
}
