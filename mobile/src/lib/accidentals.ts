/**
 * How a black key is spelled, and how the spelling is shown.
 *
 * Two separate jobs, kept together because they are the two halves of one boundary. `accidentalSide`
 * answers *which* spelling — the user's choice, where the music leaves the choice open. The namers
 * turn a pitch into that spelling in ASCII, which is what the analysis engines read and write
 * (`noteToSemitone` parses names). `toAccidentalGlyphs` is the last step before a screen, and only
 * that: converting earlier would break every parser downstream of it.
 *
 * Nothing here decides spelling that the music has already decided. A key signature, a scale's
 * letter-per-degree, a chord's own root: those are settled by `accidentalSideFor`, `spellScale` and
 * the chord engine's accidental count, and the preference is only ever the tie-break they fall back
 * to. See `AccidentalSide` below.
 */
import type { AccidentalPreference } from '@guitar/shared';

import { notesFlat, notesSharp } from '@/lib/theory';

/**
 * Which way an enharmonic pitch is written, once something has decided.
 *
 * Narrower than the stored preference on purpose: `auto` is not a third spelling, so nothing that
 * actually writes a note should be able to hold it. `accidentalSide` is where the third value goes
 * away, and it is the only way to get one of these out of a preference.
 */
export type AccidentalSide = 'sharp' | 'flat';

/**
 * The side to spell on, from what the user chose.
 *
 * `auto` hands the question back to whoever asked it, which is what `fallback` answers: the side a
 * surface uses when nothing musical settles it. It differs by surface because the conventions do.
 * A slackened string is E♭ standard and never D♯ standard; a chromatic run up the neck is C♯ D♯ and
 * never D♭ E♭. Choosing sharps or flats overrides both — but only here, where the choice was open.
 */
export function accidentalSide(
  preference: AccidentalPreference,
  fallback: AccidentalSide,
): AccidentalSide {
  return preference === 'auto' ? fallback : preference;
}

/** Pitch class 0–11 as a plain note name. ASCII: glyph it at the view. */
export function chromaticName(pitchClass: number, side: AccidentalSide): string {
  return side === 'flat' ? notesFlat[pitchClass] : notesSharp[pitchClass];
}

/** A MIDI pitch named without its octave — "A#", the way a neck or a tuning reads. */
export function noteName(midi: number, side: AccidentalSide): string {
  return chromaticName(((midi % 12) + 12) % 12, side);
}

/** A MIDI pitch in scientific notation — "A#3", the way a tuner or a drill reads. */
export function pitchName(midi: number, side: AccidentalSide): string {
  return `${noteName(midi, side)}${Math.floor(midi / 12) - 1}`;
}

// Display-only: rewrite ASCII accidentals to typographic music glyphs at the UI
// boundary. The analysis engine keeps ASCII spellings internally because it parses
// and keys on note names (e.g. noteToSemitone); converting here leaves that
// machinery untouched.
//
// Input is assumed to be a musical token — a note name ("Bb", "C#"), chord symbol
// ("C#m7", "Bbmaj7") or interval label ("b5", "#9"). Within those tokens every '#'
// is a sharp and every lowercase 'b' is a flat: none of the words that appear
// (maj, min, m, sus, dim, aug, add) contain a literal lowercase 'b', so a blanket
// swap is safe. Uppercase 'B' (the note) is deliberately left alone.
const SHARP = '♯'; // ♯ MUSIC SHARP SIGN
const FLAT = '♭'; // ♭ MUSIC FLAT SIGN

export function toAccidentalGlyphs(label: string): string {
  return label.replace(/#/g, SHARP).replace(/b/g, FLAT);
}
