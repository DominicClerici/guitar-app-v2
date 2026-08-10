// Public API for the guitar voicing engine. See VOICINGS.md for the reference.
//
//   Chord (from @/lib/chord-library) → chordShapes(chord) → shapes on a neck
//
// The chord library says which tones have to be there; this says where they can
// go and whether a hand can hold them. Pure string/number math — no React, no
// native modules.
//
// Standard tuning only. Alternate tunings would touch nothing but the two
// constants in @/lib/theory, but they would need tuning UI on every screen that
// draws a neck, so they are deliberately out of scope.

import type { Chord } from '../chord-library';

import { generateVoicings } from './generate';
import { applyPins, groupByRegion, FEATURED_PER_REGION, type VoicingGroup } from './select';
import type { Voicing } from './types';

export { chartFor, fretsFromChart } from './chart';
export { generateVoicings } from './generate';
export { REGION_LABELS, REGION_ORDER } from './region';
export { FEATURED_PER_REGION, pinKey, pinnedFor, groupByRegion } from './select';
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
const cache = new Map<string, ChordShapes>();

export function chordShapes(chord: Chord): ChordShapes {
  const cached = cache.get(chord.symbol);
  if (cached) return cached;

  const rooted = applyPins(chord, generateVoicings(chord));
  const inversions = generateVoicings(chord, { inversions: true });

  const shapes: ChordShapes = {
    featured: groupByRegion(rooted, FEATURED_PER_REGION),
    all: groupByRegion(rooted),
    inversions,
    total: rooted.length,
  };

  cache.set(chord.symbol, shapes);
  return shapes;
}
