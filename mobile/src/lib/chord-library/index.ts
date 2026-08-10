// Public API for the chord library. See LIBRARY.md for the full reference.
//
//   ROOTS × CHORD_TYPES → buildChord(root, type) → Chord
//
// Pure string/number math — no React, no native modules. The chord detector
// goes the other way (notes → names); both share @/lib/theory, so a chord
// spells identically wherever it appears.

export { toChordTones } from './adapter';
export { buildChord, chordSymbolFor, essentialTones } from './build';
export {
  CHORD_TYPES,
  chordTypeById,
  chordTypesByFamily,
  FAMILY_LABELS,
  FAMILY_ORDER,
} from './catalog';
export { enharmonicRoot, isRootName, ROOTS } from './roots';
export { findChordTypes, parseChordSymbol } from './search';
export type { BuildOptions, Chord, ChordFamily, ChordTone, ChordType, RootName } from './types';
