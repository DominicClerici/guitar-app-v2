import type { ScaleFamily, ScaleType } from './types';

// Eighteen scales in four families. Each modal family is written out mode by
// mode rather than derived by rotation, because a mode's *degrees* are what
// name it — Lydian ♯2 is the sixth mode of harmonic minor, but calling it that
// tells you nothing about the ♯2 that makes it worth playing.
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
];

export const FAMILY_ORDER: readonly ScaleFamily[] = [
  'major-modes',
  'pentatonic',
  'harmonic-minor',
  'melodic-minor',
];

export const FAMILY_LABELS: Record<ScaleFamily, string> = {
  'major-modes': 'Major modes',
  pentatonic: 'Pentatonic',
  'harmonic-minor': 'Harmonic',
  'melodic-minor': 'Melodic',
};

const BY_ID = new Map(SCALE_TYPES.map((type) => [type.id, type]));

export function scaleTypeById(id: string): ScaleType | undefined {
  return BY_ID.get(id);
}

export function scaleTypesByFamily(family: ScaleFamily): ScaleType[] {
  return SCALE_TYPES.filter((type) => type.family === family);
}
