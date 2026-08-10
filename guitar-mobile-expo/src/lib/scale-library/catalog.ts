import type { ScaleFamily, ScaleType } from './types';

// Twenty-six scales in five families. Each modal family is written out mode by
// mode rather than derived by rotation, because a mode's *degrees* are what
// name it — Lydian ♯2 is the sixth mode of harmonic minor, but calling it that
// tells you nothing about the ♯2 that makes it worth playing.
//
// The parent families are carried mode-complete on purpose. Naming a set of
// notes is only half the job; scale-analysis names the *chord* it sits over, and
// it can only do that when the mode rooted on that chord is in here. Leaving out
// Mixolydian ♭6 meant the scale over a V/ii came back as "D melodic minor" — the
// right notes, filed under a root the player has no use for.
//
// `accent` marks the one tone that separates a scale from its nearest plain
// relative. That is what the neck tints, so it has to be the note a player
// would point at to explain the scale: Dorian's bright 6th, Phrygian's ♭2, the
// blue note. The four scales other scales are measured against carry null.

export const SCALE_TYPES: readonly ScaleType[] = [
  // ─ modes of the major scale ─
  {
    id: 'major',
    name: 'Major',
    family: 'major-modes',
    semitones: [0, 2, 4, 5, 7, 9, 11],
    degrees: ['1', '2', '3', '4', '5', '6', '7'],
    character: 'The reference the others are heard against',
    accent: null,
  },
  {
    id: 'dorian',
    name: 'Dorian',
    family: 'major-modes',
    semitones: [0, 2, 3, 5, 7, 9, 10],
    degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    character: 'Minor with a bright 6th — hopeful rather than sad',
    accent: { degree: '6', hue: 'amber' },
  },
  {
    id: 'phrygian',
    name: 'Phrygian',
    family: 'major-modes',
    semitones: [0, 1, 3, 5, 7, 8, 10],
    degrees: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    character: 'Minor with a ♭2 leaning on the root — Spanish, dark',
    accent: { degree: 'b2', hue: 'rose' },
  },
  {
    id: 'lydian',
    name: 'Lydian',
    family: 'major-modes',
    semitones: [0, 2, 4, 6, 7, 9, 11],
    degrees: ['1', '2', '3', '#4', '5', '6', '7'],
    character: 'Major with a ♯4 — weightless, floating',
    accent: { degree: '#4', hue: 'violet' },
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian',
    family: 'major-modes',
    semitones: [0, 2, 4, 5, 7, 9, 10],
    degrees: ['1', '2', '3', '4', '5', '6', 'b7'],
    character: 'Major with a ♭7 — the dominant sound, blues and rock',
    accent: { degree: 'b7', hue: 'amber' },
  },
  {
    id: 'minor',
    name: 'Natural minor',
    family: 'major-modes',
    semitones: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    character: 'The plain minor scale — Aeolian',
    accent: null,
  },
  {
    id: 'locrian',
    name: 'Locrian',
    family: 'major-modes',
    semitones: [0, 1, 3, 5, 6, 8, 10],
    degrees: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    character: 'No perfect 5th — unstable, and the reason it is rare',
    accent: { degree: 'b5', hue: 'rose' },
  },

  // ─ pentatonic and blues ─
  {
    id: 'major-pentatonic',
    name: 'Major pentatonic',
    family: 'pentatonic',
    semitones: [0, 2, 4, 7, 9],
    degrees: ['1', '2', '3', '5', '6'],
    character: 'Major with the two half steps removed — nothing can clash',
    accent: null,
  },
  {
    id: 'minor-pentatonic',
    name: 'Minor pentatonic',
    family: 'pentatonic',
    semitones: [0, 3, 5, 7, 10],
    degrees: ['1', 'b3', '4', '5', 'b7'],
    character: 'Five notes, and most of the guitar solos ever played',
    accent: null,
  },
  {
    id: 'blues',
    name: 'Blues',
    family: 'pentatonic',
    semitones: [0, 3, 5, 6, 7, 10],
    degrees: ['1', 'b3', '4', 'b5', '5', 'b7'],
    character: 'Minor pentatonic with the blue note passing through',
    accent: { degree: 'b5', hue: 'rose' },
  },
  {
    id: 'major-blues',
    name: 'Major blues',
    family: 'pentatonic',
    semitones: [0, 2, 3, 4, 7, 9],
    degrees: ['1', '2', 'b3', '3', '5', '6'],
    character: 'Major pentatonic with the ♭3 rubbing against the 3rd',
    accent: { degree: 'b3', hue: 'rose' },
  },

  // ─ harmonic minor and its two useful modes ─
  {
    id: 'harmonic-minor',
    name: 'Harmonic minor',
    family: 'harmonic-minor',
    semitones: [0, 2, 3, 5, 7, 8, 11],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', '7'],
    character: 'Minor with a raised 7th — the leading tone a minor key wants',
    accent: { degree: '7', hue: 'amber' },
  },
  {
    id: 'phrygian-dominant',
    name: 'Phrygian dominant',
    family: 'harmonic-minor',
    semitones: [0, 1, 4, 5, 7, 8, 10],
    degrees: ['1', 'b2', '3', '4', '5', 'b6', 'b7'],
    character: 'Major 3rd over a ♭2 — flamenco, and every V7 in a minor key',
    accent: { degree: 'b2', hue: 'rose' },
  },
  {
    id: 'lydian-sharp2',
    name: 'Lydian ♯2',
    family: 'harmonic-minor',
    semitones: [0, 3, 4, 6, 7, 9, 11],
    degrees: ['1', '#2', '3', '#4', '5', '6', '7'],
    character: 'Lydian with a ♯2 opening a minor 3rd off the root',
    accent: { degree: '#2', hue: 'violet' },
  },
  {
    id: 'dorian-sharp4',
    name: 'Dorian ♯4',
    family: 'harmonic-minor',
    semitones: [0, 2, 3, 6, 7, 9, 10],
    degrees: ['1', '2', 'b3', '#4', '5', '6', 'b7'],
    character: 'Dorian with a ♯4 — klezmer, and the minor blues gone strange',
    accent: { degree: '#4', hue: 'violet' },
  },
  {
    id: 'locrian-natural6',
    name: 'Locrian ♮6',
    family: 'harmonic-minor',
    semitones: [0, 1, 3, 5, 6, 9, 10],
    degrees: ['1', 'b2', 'b3', '4', 'b5', '6', 'b7'],
    character: 'Locrian with the 6th put back — over m7♭5, one shade less bleak',
    accent: { degree: '6', hue: 'amber' },
  },
  {
    id: 'ionian-sharp5',
    name: 'Ionian ♯5',
    family: 'harmonic-minor',
    semitones: [0, 2, 4, 5, 8, 9, 11],
    degrees: ['1', '2', '3', '4', '#5', '6', '7'],
    character: 'Major with a ♯5 — the maj7♯5 that will not sit still',
    accent: { degree: '#5', hue: 'violet' },
  },
  {
    id: 'altered-bb7',
    name: 'Altered ♭♭7',
    family: 'harmonic-minor',
    semitones: [0, 1, 3, 4, 6, 8, 9],
    degrees: ['1', 'b2', 'b3', 'b4', 'b5', 'b6', 'bb7'],
    character: 'The scale a diminished seventh comes from',
    accent: { degree: 'bb7', hue: 'violet' },
  },

  // ─ melodic minor and its three useful modes ─
  {
    id: 'melodic-minor',
    name: 'Melodic minor',
    family: 'melodic-minor',
    semitones: [0, 2, 3, 5, 7, 9, 11],
    degrees: ['1', '2', 'b3', '4', '5', '6', '7'],
    character: 'Minor 3rd, major everything above it — the jazz minor',
    accent: { degree: '7', hue: 'amber' },
  },
  {
    id: 'lydian-dominant',
    name: 'Lydian dominant',
    family: 'melodic-minor',
    semitones: [0, 2, 4, 6, 7, 9, 10],
    degrees: ['1', '2', '3', '#4', '5', '6', 'b7'],
    character: 'A dominant with a ♯11 — the sound over an unresolved 7th',
    accent: { degree: '#4', hue: 'violet' },
  },
  {
    id: 'mixolydian-b6',
    name: 'Mixolydian ♭6',
    family: 'melodic-minor',
    semitones: [0, 2, 4, 5, 7, 8, 10],
    degrees: ['1', '2', '3', '4', '5', 'b6', 'b7'],
    character: 'A dominant with a ♭13 — the V7 that leans towards minor',
    accent: { degree: 'b6', hue: 'rose' },
  },
  {
    id: 'locrian-natural2',
    name: 'Locrian ♮2',
    family: 'melodic-minor',
    semitones: [0, 2, 3, 5, 6, 8, 10],
    degrees: ['1', '2', 'b3', '4', 'b5', 'b6', 'b7'],
    character: 'Locrian made playable by a natural 2nd — over m7♭5',
    accent: { degree: '2', hue: 'amber' },
  },
  {
    id: 'altered',
    name: 'Altered',
    family: 'melodic-minor',
    semitones: [0, 1, 3, 4, 6, 8, 10],
    degrees: ['1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'],
    character: 'Every tension a dominant can carry — super Locrian',
    accent: { degree: 'b4', hue: 'violet' },
  },
  {
    id: 'dorian-b2',
    name: 'Dorian ♭2',
    family: 'melodic-minor',
    semitones: [0, 1, 3, 5, 7, 9, 10],
    degrees: ['1', 'b2', 'b3', '4', '5', '6', 'b7'],
    character: 'Phrygian with the 6th raised — dark at the bottom, open on top',
    accent: { degree: 'b2', hue: 'rose' },
  },
  {
    id: 'lydian-augmented',
    name: 'Lydian augmented',
    family: 'melodic-minor',
    semitones: [0, 2, 4, 6, 8, 9, 11],
    degrees: ['1', '2', '3', '#4', '#5', '6', '7'],
    character: 'Lydian lifted again at the 5th — nothing left holding it down',
    accent: { degree: '#5', hue: 'violet' },
  },

  // ─ harmonic major ─
  //
  // Major with a ♭6, and the reason it earns a family of its own: it is what a
  // major key sounds like the moment it borrows a iv or a ♭VI without giving up
  // its leading tone — the commonest chromatic move in pop, and one no mode of
  // the major scale can spell.
  {
    id: 'harmonic-major',
    name: 'Harmonic major',
    family: 'harmonic-major',
    semitones: [0, 2, 4, 5, 7, 8, 11],
    degrees: ['1', '2', '3', '4', '5', 'b6', '7'],
    character: 'Major with a ♭6 — the borrowed minor iv, without leaving home',
    accent: { degree: 'b6', hue: 'rose' },
  },
];

export const FAMILY_ORDER: readonly ScaleFamily[] = [
  'major-modes',
  'pentatonic',
  'harmonic-minor',
  'melodic-minor',
  'harmonic-major',
];

// "Harmonic" and "Melodic" alone stopped being enough to point at once harmonic
// major joined them on the shelf.
export const FAMILY_LABELS: Record<ScaleFamily, string> = {
  'major-modes': 'Major modes',
  pentatonic: 'Pentatonic',
  'harmonic-minor': 'Harmonic minor',
  'melodic-minor': 'Melodic minor',
  'harmonic-major': 'Harmonic major',
};

const BY_ID = new Map(SCALE_TYPES.map((type) => [type.id, type]));

export function scaleTypeById(id: string): ScaleType | undefined {
  return BY_ID.get(id);
}

export function scaleTypesByFamily(family: ScaleFamily): ScaleType[] {
  return SCALE_TYPES.filter((type) => type.family === family);
}
