import { pitchName, toAccidentalGlyphs, type AccidentalSide } from '@/lib/accidentals';
import { stringLabels, type Tuning } from '@/lib/tuning';

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

/** How many strings there are, which is also what a rail and a summary count. */
export const STRING_COUNT = 6;

let cached: { tuning: Tuning; side: AccidentalSide; strings: GuitarString[] } | null = null;

/**
 * The six strings as this checker walks them: **thickest first**, the reverse of the app's usual
 * 0 = high e ordering. That is the order a saddle adjustment is worked through, and the low strings
 * are where intonation error is largest.
 *
 * Names come off the user's own tuning rather than a table of standard ones, because this is the
 * one screen whose entire subject is the strings actually on the guitar — an instruction to press
 * "the low E string" is wrong the moment someone has dropped it, and wrong in the way that makes a
 * reading impossible to take rather than merely mislabelled.
 *
 * Ids stay positional. A measurement belongs to a physical string, so retuning mid-session must
 * not orphan the readings already taken by renaming what they were taken on.
 */
export function guitarStrings(tuning: Tuning, side: AccidentalSide): GuitarString[] {
  if (cached && cached.tuning === tuning && cached.side === side) return cached.strings;

  // `stringLabels` runs high e first and already lowercases the thinnest string, which is the case
  // convention this rail was drawing by hand.
  const glyphs = [...stringLabels(tuning, side)].reverse();

  const strings = glyphs.map((glyph, index) => {
    const openMidi = tuning.open[STRING_COUNT - 1 - index];
    // Only the outer two are qualified. In standard tuning that is exactly what tells the two E's
    // apart, and on any other it still says which end of the neck to reach for.
    const label =
      index === 0 ? `low ${glyph}` : index === STRING_COUNT - 1 ? `high ${glyph}` : glyph;

    return { id: `string-${STRING_COUNT - index}`, label, glyph, openMidi, targetMidi: openMidi + 12 };
  });

  cached = { tuning, side, strings };

  return strings;
}

/** The string whose open note this pitch is, if it is one of the six. */
export function stringForOpenMidi(
  strings: readonly GuitarString[],
  midi: number,
): GuitarString | undefined {
  return strings.find((s) => s.openMidi === midi);
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
  side: AccidentalSide,
): string {
  if (detectedMidi === string.openMidi) {
    return stage === 'harmonic'
      ? `That's the open ${string.label} string, an octave below the harmonic. Touch the string lightly right above the 12th fret wire rather than pressing it down.`
      : `That's the open ${string.label} string. Press it down at the 12th fret before you pluck.`;
  }

  if (detectedMidi === string.targetMidi + 12) {
    return `That's two octaves up — the 5th-fret harmonic. Move your finger to the 12th fret, halfway along the string.`;
  }

  const heard = toAccidentalGlyphs(pitchName(detectedMidi, side));
  const where = stage === 'harmonic' ? 'the 12th-fret harmonic' : 'the 12th fret';
  return `Heard ${heard}. Make sure you're playing ${where} on the ${string.label} string.`;
}
