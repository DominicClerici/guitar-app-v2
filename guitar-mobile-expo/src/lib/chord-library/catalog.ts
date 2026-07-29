// The chord catalogue: 30 qualities covering pop, rock, blues, folk and
// mainstream jazz charts.
//
// Each entry is a formula in degree labels, plus the order its tones may be
// given up when a voicing can't fit them all. The essential tones are
// `degrees` minus `dropOrder` — the ones that make the name true. That's why a
// major seventh can lose its fifth and a diminished seventh can lose nothing:
// the dim7 is a symmetrical stack where every tone is doing identifying work.

import type { ChordType } from './types';

export const CHORD_TYPES: readonly ChordType[] = [
  // ─── Power ───────────────────────────────────────────────────────────────
  {
    id: 'power',
    name: 'Power Chord',
    symbol: '5',
    family: 'power',
    degrees: ['1', '5'],
    aliases: ['5', 'no3', 'fifth'],
    dropOrder: [],
    note: 'No third, so it is neither major nor minor — which is why it sits under distortion so well.',
  },

  // ─── Triads ──────────────────────────────────────────────────────────────
  {
    id: 'maj',
    name: 'Major',
    symbol: '',
    family: 'triad',
    degrees: ['1', '3', '5'],
    aliases: ['M', 'maj', 'major'],
    dropOrder: ['5'],
  },
  {
    id: 'min',
    name: 'Minor',
    symbol: 'm',
    family: 'triad',
    degrees: ['1', 'm3', '5'],
    aliases: ['min', '-', 'minor'],
    dropOrder: ['5'],
  },
  {
    id: 'dim',
    name: 'Diminished',
    symbol: 'dim',
    family: 'triad',
    degrees: ['1', 'm3', 'b5'],
    aliases: ['°', 'o', 'diminished'],
    dropOrder: [],
  },
  {
    id: 'aug',
    name: 'Augmented',
    symbol: 'aug',
    family: 'triad',
    degrees: ['1', '3', '#5'],
    aliases: ['+', 'augmented'],
    dropOrder: [],
  },

  // ─── Suspended ───────────────────────────────────────────────────────────
  {
    id: 'sus2',
    name: 'Suspended Second',
    symbol: 'sus2',
    family: 'sus',
    degrees: ['1', 'sus2', '5'],
    aliases: ['2', 'sus9'],
    dropOrder: ['5'],
  },
  {
    id: 'sus4',
    name: 'Suspended Fourth',
    symbol: 'sus4',
    family: 'sus',
    degrees: ['1', 'sus4', '5'],
    aliases: ['sus', '4'],
    dropOrder: ['5'],
  },
  {
    id: '7sus4',
    name: 'Dominant Seventh Suspended Fourth',
    symbol: '7sus4',
    family: 'sus',
    degrees: ['1', 'sus4', '5', '7'],
    aliases: ['7sus'],
    dropOrder: ['5'],
  },

  // ─── Added ───────────────────────────────────────────────────────────────
  {
    id: 'add9',
    name: 'Added Ninth',
    symbol: 'add9',
    family: 'added',
    degrees: ['1', '3', '5', '9'],
    aliases: ['add2', 'major add nine'],
    dropOrder: ['5'],
    note: 'A ninth with no seventh under it — the stack is skipped, not completed.',
  },
  {
    id: 'madd9',
    name: 'Minor Added Ninth',
    symbol: 'm(add9)',
    family: 'added',
    degrees: ['1', 'm3', '5', '9'],
    aliases: ['madd9', 'm(add2)', 'minor add nine'],
    dropOrder: ['5'],
  },

  // ─── Sixths ──────────────────────────────────────────────────────────────
  {
    id: 'maj6',
    name: 'Major Sixth',
    symbol: '6',
    family: 'sixth',
    degrees: ['1', '3', '5', '6'],
    aliases: ['6', 'M6', 'maj6'],
    dropOrder: ['5'],
  },
  {
    id: 'min6',
    name: 'Minor Sixth',
    symbol: 'm6',
    family: 'sixth',
    degrees: ['1', 'm3', '5', '6'],
    aliases: ['min6', '-6'],
    dropOrder: ['5'],
  },
  {
    id: '69',
    name: 'Six Nine',
    symbol: '6/9',
    family: 'sixth',
    degrees: ['1', '3', '5', '6', '9'],
    aliases: ['69', '6add9', 'six nine'],
    dropOrder: ['5'],
  },

  // ─── Sevenths ────────────────────────────────────────────────────────────
  {
    id: 'dom7',
    name: 'Dominant Seventh',
    symbol: '7',
    family: 'seventh',
    degrees: ['1', '3', '5', '7'],
    aliases: ['7', 'dom7', 'dominant'],
    dropOrder: ['5'],
  },
  {
    id: 'maj7',
    name: 'Major Seventh',
    symbol: 'maj7',
    family: 'seventh',
    degrees: ['1', '3', '5', 'maj7'],
    aliases: ['M7', 'Δ', 'Δ7', 'major seven'],
    dropOrder: ['5'],
  },
  {
    id: 'min7',
    name: 'Minor Seventh',
    symbol: 'm7',
    family: 'seventh',
    degrees: ['1', 'm3', '5', '7'],
    aliases: ['min7', '-7', 'minor seven'],
    dropOrder: ['5'],
  },
  {
    id: 'm7b5',
    name: 'Half-Diminished Seventh',
    symbol: 'm7(b5)',
    family: 'seventh',
    degrees: ['1', 'm3', 'b5', '7'],
    aliases: ['ø', 'ø7', 'm7b5', 'm7-5', 'half diminished'],
    dropOrder: [],
    note: 'Half-diminished, not fully: the seventh is minor, where a dim7 lowers it again.',
  },
  {
    id: 'dim7',
    name: 'Diminished Seventh',
    symbol: 'dim7',
    family: 'seventh',
    degrees: ['1', 'm3', 'b5', 'dim7'],
    aliases: ['°7', 'o7', 'fully diminished'],
    dropOrder: [],
    note: 'A stack of four minor thirds. It divides the octave evenly, so all four notes can claim to be the root — and nothing can be left out.',
  },
  {
    id: 'mMaj7',
    name: 'Minor Major Seventh',
    symbol: 'm(maj7)',
    family: 'seventh',
    degrees: ['1', 'm3', '5', 'maj7'],
    aliases: ['mM7', 'minMaj7', '-Δ7'],
    dropOrder: ['5'],
  },

  // ─── Extended ────────────────────────────────────────────────────────────
  {
    id: 'dom9',
    name: 'Dominant Ninth',
    symbol: '9',
    family: 'extended',
    degrees: ['1', '3', '5', '7', '9'],
    aliases: ['9', 'dom9'],
    dropOrder: ['5'],
  },
  {
    id: 'maj9',
    name: 'Major Ninth',
    symbol: 'maj9',
    family: 'extended',
    degrees: ['1', '3', '5', 'maj7', '9'],
    aliases: ['M9', 'Δ9', 'major nine'],
    dropOrder: ['5'],
  },
  {
    id: 'min9',
    name: 'Minor Ninth',
    symbol: 'm9',
    family: 'extended',
    degrees: ['1', 'm3', '5', '7', '9'],
    aliases: ['min9', '-9', 'minor nine'],
    dropOrder: ['5'],
  },
  {
    id: 'dom11',
    name: 'Dominant Eleventh',
    symbol: '11',
    family: 'extended',
    degrees: ['1', '5', '7', '9', '11'],
    aliases: ['11'],
    dropOrder: ['5', '9'],
    note: 'No third. A natural eleventh sits a semitone above the major third, and that clash is why the third is left out — which is also why an 11 chord is often written as a minor seventh over its own root (C11 ≈ Gm7/C).',
  },
  {
    id: 'min11',
    name: 'Minor Eleventh',
    symbol: 'm11',
    family: 'extended',
    degrees: ['1', 'm3', '5', '7', '9', '11'],
    aliases: ['min11', '-11'],
    dropOrder: ['5', '9'],
    note: 'Keeps its third, unlike the dominant eleventh: a minor third and an eleventh are a whole tone apart, so there is nothing to avoid.',
  },
  {
    id: 'dom13',
    name: 'Dominant Thirteenth',
    symbol: '13',
    family: 'extended',
    degrees: ['1', '3', '5', '7', '9', '13'],
    aliases: ['13'],
    dropOrder: ['5', '9'],
    note: 'The eleventh is omitted, for the same clash with the major third that empties out the 11 chord.',
  },
  {
    id: 'min13',
    name: 'Minor Thirteenth',
    symbol: 'm13',
    family: 'extended',
    degrees: ['1', 'm3', '5', '7', '9', '11', '13'],
    aliases: ['min13', '-13'],
    dropOrder: ['5', '11', '9'],
    note: 'Seven notes and six strings — something has to give, which is what the drop order is for.',
  },

  // ─── Altered dominants ───────────────────────────────────────────────────
  {
    id: 'dom7b9',
    name: 'Dominant Seventh Flat Ninth',
    symbol: '7(b9)',
    family: 'altered',
    degrees: ['1', '3', '5', '7', 'b9'],
    aliases: ['7b9'],
    dropOrder: ['5'],
  },
  {
    id: 'dom7#9',
    name: 'Dominant Seventh Sharp Ninth',
    symbol: '7(#9)',
    family: 'altered',
    degrees: ['1', '3', '5', '7', '#9'],
    aliases: ['7#9', 'Hendrix chord'],
    dropOrder: ['5'],
    note: 'The sharp ninth is spelled as a raised second, not a minor third — the chord keeps its major third, and hearing both at once is the point.',
  },
  {
    id: 'dom7b5',
    name: 'Dominant Seventh Flat Fifth',
    symbol: '7(b5)',
    family: 'altered',
    degrees: ['1', '3', 'b5', '7'],
    aliases: ['7b5', '7-5'],
    dropOrder: [],
    note: 'The flattened fifth replaces the perfect fifth rather than joining it, so this is a four-note chord.',
  },
  {
    id: 'dom7#5',
    name: 'Dominant Seventh Sharp Fifth',
    symbol: '7(#5)',
    family: 'altered',
    degrees: ['1', '3', '#5', '7'],
    aliases: ['7#5', '7+', 'aug7', 'augmented seventh'],
    dropOrder: [],
  },
];

const BY_ID = new Map(CHORD_TYPES.map((type) => [type.id, type]));

export function chordTypeById(id: string): ChordType | undefined {
  return BY_ID.get(id);
}

export const FAMILY_ORDER: readonly ChordType['family'][] = [
  'power',
  'triad',
  'sus',
  'added',
  'sixth',
  'seventh',
  'extended',
  'altered',
];

export const FAMILY_LABELS: Record<ChordType['family'], string> = {
  power: 'Power',
  triad: 'Triads',
  sus: 'Suspended',
  added: 'Added Tone',
  sixth: 'Sixths',
  seventh: 'Sevenths',
  extended: 'Extended',
  altered: 'Altered Dominants',
};

export function chordTypesByFamily(family: ChordType['family']): ChordType[] {
  return CHORD_TYPES.filter((type) => type.family === family);
}
