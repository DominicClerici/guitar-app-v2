// Picks the primary chord from the variations array and trims to ≤5 entries.
//
// createVariations() returns one reading per input pitch class, in chromatic
// order from the bass — so variations[0] is the bass-as-root reading. That is
// a poor default on its own: an open C major voiced with G in the bass reads
// as "G6sus" (a flagged inversion) rather than the C/G most players expect.
//
// Instead we score each reading by plausibility (lower = more likely the
// intended chord) and surface the cleanest as primary. The warning rules
// already flag readings that "want a different root" (inversion / fragment),
// which is the strongest signal; structural complexity and a bass-rooted
// tiebreak refine the rest.

import { noteToSemitone } from '../theory'
import type { Variation } from './types'
import { chordWarnings } from './warnings'

function plausibilityScore(v: Variation, bassPitchClass: number): number {
  let score = 0

  // Warnings are the strongest signal. Inversion/fragment rules literally mean
  // "this reads better rooted on a different note".
  for (const w of chordWarnings(v)) {
    if (w.cat === 'inversion' || w.cat === 'fragment') score += 10
    else if (w.cat === 'uncommon') score += 4
    else if (w.cat === 'cluster' || w.cat === 'dissonance' || w.cat === 'double') score += 1
  }

  // Structural complexity — simpler chord names read as more likely.
  const p = v.csParams
  if (p.sus) score += 2
  if (p.omit) score += 3
  if (p.extNum === 'b6') score += 2
  score += Object.values(p.tensionsObj).filter(Boolean).length
  score += Object.values(p.addsObj).filter(Boolean).length

  // Tiebreak: prefer the reading rooted on the actual bass note, so a clean
  // root-position chord stays primary (and renders without a needless slash).
  const root = v.autoRootMode === 'sharp' ? v.rootToneSharp : v.rootToneFlat
  if (noteToSemitone(root) !== bassPitchClass) score += 0.5

  return score
}

export function rankVariations(
  variations: Variation[],
  bassPitchClass: number,
): Variation[] {
  return variations
    .map((v, i) => ({ v, i, score: plausibilityScore(v, bassPitchClass) }))
    // Sort by score; ties keep the original chromatic-from-bass order.
    .sort((a, b) => a.score - b.score || a.i - b.i)
    .map((x) => x.v)
    .slice(0, 5)
}
