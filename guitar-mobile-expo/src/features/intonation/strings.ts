import { midiToNoteName } from '@/features/tuner';

export type Stage = 'harmonic' | 'fretted';

export interface GuitarString {
  id: string;
  /** How the string is spoken about in an instruction. */
  label: string;
  /** Rail glyph. Case carries the octave the way tab does: low E vs high e. */
  glyph: string;
  openMidi: number;
  /**
   * Where both readings land. The 12th-fret harmonic is the string's second
   * partial and the 12th fret is its midpoint, so a correctly intonated string
   * sounds the same pitch either way — one octave above open.
   */
  targetMidi: number;
}

function makeString(
  id: string,
  label: string,
  glyph: string,
  openMidi: number,
): GuitarString {
  return { id, label, glyph, openMidi, targetMidi: openMidi + 12 };
}

/**
 * Standard tuning, thickest first. The checker walks them in this order because
 * that is the order a saddle adjustment is usually worked through, and the low
 * strings are where intonation error is largest.
 */
export const STRINGS: GuitarString[] = [
  makeString('low-e', 'low E', 'E', 40),
  makeString('a', 'A', 'A', 45),
  makeString('d', 'D', 'D', 50),
  makeString('g', 'G', 'G', 55),
  makeString('b', 'B', 'B', 59),
  makeString('high-e', 'high e', 'e', 64),
];

export const OPEN_MIDI = STRINGS.map((s) => s.openMidi);

/** The string whose open note this pitch is, if it is one of the six. */
export function stringForOpenMidi(midi: number): GuitarString | undefined {
  return STRINGS.find((s) => s.openMidi === midi);
}

export function instruction(string: GuitarString, stage: Stage): string {
  return stage === 'harmonic'
    ? `Rest a fingertip lightly on the ${string.label} string directly over the 12th fret — don't press down — pluck, then lift your finger and let it ring.`
    : `Press the ${string.label} string down at the 12th fret, pluck, and let it ring.`;
}

export function stageTitle(string: GuitarString, stage: Stage): string {
  return stage === 'harmonic'
    ? `12th-fret harmonic · ${string.label}`
    : `12th fret · ${string.label}`;
}

/**
 * Why a take was rejected, in the player's terms. The two mistakes worth naming
 * are the ones this test invites: sounding the open string instead of the note
 * an octave up, and catching the 5th-fret harmonic instead of the 12th.
 */
export function misfireMessage(
  detectedMidi: number,
  string: GuitarString,
  stage: Stage,
): string {
  if (detectedMidi === string.openMidi) {
    return stage === 'harmonic'
      ? `That's the open ${string.label} string, an octave below the harmonic. Touch the string lightly right above the 12th fret wire rather than pressing it down.`
      : `That's the open ${string.label} string. Press it down at the 12th fret before you pluck.`;
  }

  if (detectedMidi === string.targetMidi + 12) {
    return `That's two octaves up — the 5th-fret harmonic. Move your finger to the 12th fret, halfway along the string.`;
  }

  const heard = midiToNoteName(detectedMidi);
  const where = stage === 'harmonic' ? 'the 12th-fret harmonic' : 'the 12th fret';
  return `Heard ${heard}. Make sure you're playing ${where} on the ${string.label} string.`;
}
