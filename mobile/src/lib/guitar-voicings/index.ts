// Public API for the guitar voicing engine. See VOICINGS.md for the reference.
//
//   Chord (from @/lib/chord-library) → chordShapes(chord) → shapes on a neck
//
// The chord library says which tones have to be there; this says where they can
// go and whether a hand can hold them. Pure string/number math — no React, no
// native modules.
//
// The neck searched is the user's own: a shape is only the chord it is named
// after on the tuning it was generated for, so `chordShapes` takes one.

import type { Chord } from '../chord-library';
import type { Tuning } from '../tuning';

import { generateVoicings } from './generate';
import { applyPins, groupByRegion, FEATURED_PER_REGION, type VoicingGroup } from './select';
import type { Voicing } from './types';

export { chartFor, fretsFromChart } from './chart';
export { generateVoicings } from './generate';
export { REGION_LABELS, REGION_ORDER } from './region';
export { applyPins, FEATURED_PER_REGION, pinKey, pinnedFor, groupByRegion } from './select';
export type { VoicingGroup } from './select';
export type { Barre, Difficulty, Finger, NeckRegion, Voicing, VoicingOptions } from './types';

export interface ChordShapes {
  /** A couple per neck region — the default view. */
  featured: VoicingGroup[];
  /** Everything playable with the root in the bass, still grouped. */
  all: VoicingGroup[];
  /** The second pass: chord tones other than the root in the bass. */
  inversions: Voicing[];
  /** How many root-position shapes exist, for the "see all" affordance. */
  total: number;
}

// Generation is a few milliseconds, but a chord is re-read on every render while
// the user scrolls, so the result is held rather than recomputed. The catalogue
// is 510 chords; the cache cannot grow past that.
//
// It is emptied when the tuning changes rather than keyed by it. There is only ever one tuning in
// force, so keying would grow the bound by a factor of however many the user had passed through
// this session while every entry but the last was unreachable — and a stale shape here is the
// quiet kind of wrong: a chart that looks right and is in the tuning the user has left.
const cache = new Map<string, ChordShapes>();
let cachedFor: string | null = null;

export function chordShapes(tuning: Tuning, chord: Chord): ChordShapes {
  if (cachedFor !== tuning.stored) {
    cache.clear();
    cachedFor = tuning.stored;
  }

  const cached = cache.get(chord.symbol);
  if (cached) return cached;

  const generated = generateVoicings(tuning, chord);
  // Pins are hand-authored standard-tuning charts (see `pins.ts`), matched by the shape they spell.
  // On a retuned neck they name grips the generator no longer produces, so there is nothing to
  // hoist and the scorer's own order stands — which is the order the pins were measured against.
  const rooted = tuning.isStandard ? applyPins(chord, generated) : generated;
  const inversions = generateVoicings(tuning, chord, { inversions: true });

  const shapes: ChordShapes = {
    featured: groupByRegion(rooted, FEATURED_PER_REGION),
    all: groupByRegion(rooted),
    inversions,
    total: rooted.length,
  };

  cache.set(chord.symbol, shapes);
  return shapes;
}
