// Public API for the scale library — chord-library's sibling, pointing the same
// way: an identity in, its tones out.
//
//   ROOTS × SCALE_TYPES → buildScale(root, type) → Scale
//
// Spelling is generated from the degree labels rather than tabulated (spell.ts),
// and everything relational — which scales share these notes, which sit one note
// away — falls out of comparing 12-bit pitch-class masks (neighbours.ts).
//
// Pure string/number math. No React, no native modules.

export {
  FAMILY_LABELS,
  FAMILY_ORDER,
  SCALE_TYPES,
  scaleTypeById,
  scaleTypesByFamily,
} from './catalog';
export { intervalLabel, stepFormula } from './intervals';
export { preferredRoot, relatedScales, type Related, type RelatedScale } from './neighbours';
export { accentPitchClass, buildScale, degreeAt, maskOf, pitchClassMask } from './scale';
export { degreeNumber, noteToPitchClass, spellDegree, spellScale } from './spell';
export type { JewelHue, Scale, ScaleAccent, ScaleFamily, ScaleType } from './types';
