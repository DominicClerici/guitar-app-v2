// Which other scales are next to this one.
//
// Two questions, both answered by comparing pitch-class masks across the whole
// catalogue at every root — 18 × 12 = 216 integers, so it is cheaper to
// recompute than to cache:
//
//   same notes    — an identical mask. The other modes of the same parent.
//   one note away — the same number of notes, exactly one swapped. This is the
//                   useful one: it is how you wander the catalogue by ear.
//
// ROOTS comes from chord-library because that is where the seventeen root
// spellings already live; the list is theory-level and neither module owns it
// more than the other.

import { ROOTS, type RootName } from '@/lib/chord-library';

import { SCALE_TYPES } from './catalog';
import { pitchClassMask } from './scale';
import { accidentalWeight, noteToPitchClass, spellScale } from './spell';
import type { Scale, ScaleType } from './types';

export interface RelatedScale {
  root: RootName;
  type: ScaleType;
  notes: readonly string[];
  /** For a one-note-away row: the note that replaces the one that leaves. */
  swap: { added: string; removed: string } | null;
}

export interface Related {
  sameNotes: RelatedScale[];
  oneAway: RelatedScale[];
}

/** How many candidate rows the one-note-away list is allowed to show. */
const ONE_AWAY_LIMIT = 6;

const ROOTS_BY_PITCH_CLASS = ((): RootName[][] => {
  const table: RootName[][] = Array.from({ length: 12 }, () => []);
  for (const root of ROOTS) table[noteToPitchClass(root)].push(root);
  return table;
})();

/**
 * The spelling of `pitchClass` this scale reads best in. B♭ Lydian and A♯ Lydian
 * are the same seven pitches, but one of them contains a D♯♯ — so the choice is
 * made by whichever spelling carries the least accidental baggage.
 *
 * `prefer` is consulted only where the baggage is equal, which for a symmetric type it can be:
 * F♯ major and G♭ major are six accidentals each and neither reads better than the other. That is
 * the one spelling here nobody has decided, so it is the one a caller — and behind it, a user's
 * accidental setting — is allowed to decide. Letting it in any earlier would put back the double
 * accidentals the weight exists to keep out.
 */
export function preferredRoot(pitchClass: number, type: ScaleType, prefer?: string): RootName {
  const candidates = ROOTS_BY_PITCH_CLASS[pitchClass];
  let best = candidates[0];
  let bestWeight = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const weight = accidentalWeight(spellScale(candidate, type));
    if (weight < bestWeight || (weight === bestWeight && candidate === prefer)) {
      best = candidate;
      bestWeight = weight;
    }
  }
  return best;
}

function popcount(mask: number): number {
  let count = 0;
  let bits = mask;
  while (bits) {
    bits &= bits - 1;
    count += 1;
  }
  return count;
}

/** The single set bit's index, for a mask known to have exactly one. */
function bitIndex(mask: number): number {
  return Math.log2(mask) | 0;
}

function toRelated(pitchClass: number, type: ScaleType): RelatedScale {
  const root = preferredRoot(pitchClass, type);
  return { root, type, notes: spellScale(root, type), swap: null };
}

function nameOf(entry: RelatedScale, pitchClass: number): string {
  const rootPc = noteToPitchClass(entry.root);
  const index = entry.type.semitones.findIndex((s) => (rootPc + s) % 12 === pitchClass);
  return index < 0 ? '' : entry.notes[index];
}

function nameInScale(scale: Scale, pitchClass: number): string {
  const index = scale.pitchClasses.indexOf(pitchClass);
  return index < 0 ? '' : scale.notes[index];
}

export function relatedScales(scale: Scale): Related {
  const rootPc = noteToPitchClass(scale.root);
  const mask = pitchClassMask(rootPc, scale.type);
  const size = scale.type.semitones.length;

  const sameNotes: RelatedScale[] = [];
  const oneAway: RelatedScale[] = [];

  for (const type of SCALE_TYPES) {
    for (let pc = 0; pc < 12; pc += 1) {
      if (pc === rootPc && type.id === scale.type.id) continue;

      const other = pitchClassMask(pc, type);
      if (other === mask) {
        sameNotes.push(toRelated(pc, type));
        continue;
      }

      // Only compare scales of the same size: "one note away" has to mean a
      // swap, not a scale with a note added or taken out.
      if (type.semitones.length !== size) continue;

      const difference = mask ^ other;
      if (popcount(difference) !== 2) continue;

      const entry = toRelated(pc, type);
      const addedPc = bitIndex(difference & other);
      const removedPc = bitIndex(difference & mask);
      entry.swap = {
        added: nameOf(entry, addedPc),
        removed: nameInScale(scale, removedPc),
      };
      oneAway.push(entry);
    }
  }

  // Same notes reads as a walk up the parent scale, so order it by distance
  // above the current root.
  sameNotes.sort(
    (a, b) =>
      ((noteToPitchClass(a.root) - rootPc + 12) % 12) -
      ((noteToPitchClass(b.root) - rootPc + 12) % 12),
  );

  // One note away is a long list, so the rows most likely to be wanted come
  // first: the same root re-coloured, then a neighbour in the same family.
  const rank = (entry: RelatedScale) => {
    if (noteToPitchClass(entry.root) === rootPc) return 0;
    if (entry.type.family === scale.type.family) return 1;
    return 2;
  };
  oneAway.sort(
    (a, b) =>
      rank(a) - rank(b) ||
      SCALE_TYPES.indexOf(a.type) - SCALE_TYPES.indexOf(b.type) ||
      ((noteToPitchClass(a.root) - rootPc + 12) % 12) -
        ((noteToPitchClass(b.root) - rootPc + 12) % 12),
  );

  return { sameNotes, oneAway: oneAway.slice(0, ONE_AWAY_LIMIT) };
}
