// Assembling a chord: root + quality → spelled tones.
//
// The whole job is delegating to getNotesFromIntervals, which owns the F#-vs-Gb
// decision for the entire app. What's added here is pitch classes, the
// essential/droppable split, and the hint for roots nobody actually writes.

import { ALTERED_DEGREES, getNotesFromIntervals, noteToSemitone, type Degree } from '../theory';

import { chordTypeById } from './catalog';
import { enharmonicRoot } from './roots';
import type { BuildOptions, Chord, ChordTone, ChordType, RootName } from './types';

/** How ugly a spelling is: a double accidental counts twice. */
function accidentalWeight(notes: string[]): number {
  let total = 0;
  for (const note of notes) {
    if (note.includes('bb') || note.includes('##')) total += 2;
    else if (note.includes('b') || note.includes('#')) total += 1;
  }
  return total;
}

export function chordSymbolFor(root: RootName, type: ChordType): string {
  return root + type.symbol;
}

/**
 * When the enharmonic root spells the same chord meaningfully more simply, name
 * it. D#maj7 is truly D# F## A# C##, which nobody writes — they write Ebmaj7,
 * and this returns that.
 *
 * The trigger is a double accidental, not merely a higher accidental count.
 * Gb7 (Gb Bb Db Fb) is one flat heavier than F#7 and is still an ordinary way
 * to write the chord in a flat key, so it gets no hint. Cdim7 gets none either
 * despite its Bbb: C has no enharmonic partner, and a double flat is simply how
 * a diminished seventh is spelled.
 */
function findSpellingHint(
  root: RootName,
  type: ChordType,
  correctNotes: string[],
): string | undefined {
  const runsPastOneAccidental = correctNotes.some(
    (note) => note.includes('bb') || note.includes('##'),
  );
  if (!runsPastOneAccidental) return undefined;

  const partner = enharmonicRoot(root);
  if (!partner) return undefined;

  const partnerNotes = getNotesFromIntervals(partner, type.degrees, true);
  if (accidentalWeight(partnerNotes) >= accidentalWeight(correctNotes)) return undefined;

  return chordSymbolFor(partner, type);
}

export function buildChord(
  root: RootName,
  type: ChordType | string,
  options: BuildOptions = {},
): Chord {
  const resolved = typeof type === 'string' ? chordTypeById(type) : type;
  if (!resolved) throw new Error(`buildChord: unknown chord type "${String(type)}"`);

  const correctNotes = getNotesFromIntervals(root, resolved.degrees, true);
  const displayNotes =
    options.spelling === 'collapsed'
      ? getNotesFromIntervals(root, resolved.degrees, false)
      : correctNotes;

  const droppable = new Set<Degree>(resolved.dropOrder);
  const rootPitchClass = noteToSemitone(root);

  const tones: ChordTone[] = resolved.degrees.map((degree, index) => ({
    degree,
    note: displayNotes[index],
    // Taken from the note actually spelled, so a collapsed spelling and its
    // pitch class can never disagree.
    pitchClass: noteToSemitone(displayNotes[index]),
    semitones: (noteToSemitone(correctNotes[index]) - rootPitchClass + 12) % 12,
    essential: !droppable.has(degree),
    altered: ALTERED_DEGREES.has(degree),
  }));

  const hint = findSpellingHint(root, resolved, correctNotes);

  return {
    root,
    type: resolved,
    symbol: chordSymbolFor(root, resolved),
    tones,
    ...(hint ? { spellingHint: hint } : {}),
  };
}

/** The tones that survive when a voicing can only fit `max` of them. */
export function essentialTones(chord: Chord, max: number): ChordTone[] {
  const kept = [...chord.tones];
  for (const degree of chord.type.dropOrder) {
    if (kept.length <= max) break;
    const index = kept.findIndex((tone) => tone.degree === degree);
    if (index >= 0) kept.splice(index, 1);
  }
  return kept;
}
