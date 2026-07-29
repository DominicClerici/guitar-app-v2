// Every playable way to hold one chord.
//
// The search is partitioned by hand position: position 0 is the shapes with no
// fingered notes at all, and position p covers the shapes whose lowest fingered
// fret is exactly p, reaching up to p+3. That partition means no shape is
// generated twice, and it keeps the whole search in the low tens of thousands of
// combinations — a few milliseconds, which is why nothing here is precomputed.
//
// What makes a shape *valid* is split between two places on purpose. Which tones
// the chord may give up is the chord library's business (`dropOrder`, applied
// through `essentialTones`); where the surviving tones sit and whether a hand can
// hold them is this module's.

import { essentialTones, type Chord, type ChordTone } from '../chord-library';
import { FRET_COUNT, midiAt, pitchClassAt, STRING_COUNT, type Degree } from '../theory';

import { fingerFor, geometry, MAX_SPAN } from './fingering';
import { chartFor } from './chart';
import { difficultyOf, scoreOf } from './score';
import { regionOf } from './region';
import type { Voicing, VoicingOptions } from './types';

/** A chord needs three voices to be a chord. A power chord is the exception. */
const MIN_SOUNDING = 3;
const MIN_SOUNDING_POWER = 2;

/** Hand span, so a window reaches three frets past the finger anchoring it. */
const WINDOW = 3;

/**
 * The closest two adjacent voices may sit, by register. Down where the low E
 * lives, anything tighter than a third turns to mud; by the third octave a
 * whole tone is a colour rather than a problem. These are the thresholds that
 * stop the generator offering shapes that are correct on paper and unusable in
 * the room.
 */
export const MUD_RULES = [
  { below: 45, minGap: 4 }, // under A2 — thirds and wider only
  { below: 48, minGap: 3 }, // under C3 — no seconds at all
  { below: 57, minGap: 2 }, // under A3 — whole tones are fine, semitones are not
];

export function generateVoicings(chord: Chord, options: VoicingOptions = {}): Voicing[] {
  const maxFret = options.maxFret ?? FRET_COUNT;
  const wantInversions = options.inversions ?? false;

  const byPitchClass = new Map<number, ChordTone>();
  for (const tone of chord.tones) byPitchClass.set(tone.pitchClass, tone);

  const minSounding = chord.type.family === 'power' ? MIN_SOUNDING_POWER : MIN_SOUNDING;
  const found = new Map<string, Voicing>();

  for (let position = 0; position <= maxFret - WINDOW; position += 1) {
    const candidates = candidatesFor(byPitchClass, position, maxFret);
    const frets: (number | null)[] = new Array(STRING_COUNT).fill(null);

    const walk = (string: number) => {
      if (string < 0) {
        const voicing = evaluate(chord, frets, position, minSounding, wantInversions);
        if (voicing) found.set(voicing.id, voicing);
        return;
      }

      for (const fret of candidates[string]) {
        frets[string] = fret;
        walk(string - 1);
      }

      frets[string] = null;
    };

    walk(STRING_COUNT - 1);
  }

  return [...found.values()].sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));
}

/**
 * What each string may do at this hand position: stay silent, ring open, or take
 * a fret in the window. Only pitches belonging to the chord are ever offered, so
 * "does this shape spell the chord" is answered before the search starts.
 */
function candidatesFor(
  byPitchClass: Map<number, ChordTone>,
  position: number,
  maxFret: number,
): (number | null)[][] {
  return Array.from({ length: STRING_COUNT }, (_, string) => {
    const options: (number | null)[] = [null];

    if (byPitchClass.has(pitchClassAt(string, 0))) options.push(0);

    // Position 0 is the all-open shapes and nothing else; every fingered shape
    // belongs to the position named by its lowest finger.
    for (let fret = position; position > 0 && fret <= Math.min(position + WINDOW, maxFret); fret += 1) {
      if (byPitchClass.has(pitchClassAt(string, fret))) options.push(fret);
    }

    return options;
  });
}

function evaluate(
  chord: Chord,
  frets: (number | null)[],
  position: number,
  minSounding: number,
  wantInversions: boolean,
): Voicing | null {
  const sounding: number[] = [];
  frets.forEach((fret, string) => {
    if (fret !== null) sounding.push(string);
  });
  if (sounding.length < minSounding) return null;

  // The bass is the lowest *pitch*, not the lowest string. A low E fretted at
  // the eighth fret sounds above an open A, so a shape can put its sixth in the
  // bass while the low E string is the one carrying the root.
  const bassString = sounding.reduce((lowest, string) =>
    midiAt(string, frets[string]!) < midiAt(lowest, frets[lowest]!) ? string : lowest,
  );
  const bass = toneAt(chord, bassString, frets[bassString]!);
  if (!bass) return null;
  if ((bass.degree === '1') === wantInversions) return null;

  // A shape is generated once, by the position that owns it.
  const { position: lowestFingered, span } = geometry(frets);
  if (lowestFingered !== position) return null;
  if (span > MAX_SPAN) return null;

  const interiorMutes = countInteriorMutes(frets, sounding);
  if (interiorMutes > 1) return null;

  const tones = frets.map((fret, string) =>
    fret === null ? null : toneAt(chord, string, fret),
  );
  if (tones.some((tone, index) => frets[index] !== null && !tone)) return null;

  const present = new Set<Degree>();
  for (const tone of tones) if (tone) present.add(tone.degree);

  // The chord library decides what may be dropped and in what order; this only
  // checks that whatever survived is enough to keep the name true.
  const required = essentialTones(chord, present.size);
  if (required.some((tone) => !present.has(tone.degree))) return null;

  if (isMuddy(frets)) return null;

  const fingering = fingerFor(frets);
  if (!fingering) return null;

  const omitted = chord.tones.filter((tone) => !present.has(tone.degree)).map((t) => t.degree);
  const openStrings = frets.filter((fret) => fret === 0).length;
  const rootDoubled = tones.filter((tone) => tone?.degree === '1').length > 1;

  const difficulty = difficultyOf({
    fingering,
    span,
    interiorMutes,
  });

  const score = scoreOf({
    fingering,
    span,
    position,
    interiorMutes,
    openStrings,
    sounding: sounding.length,
    omitted: omitted.length,
    chordSize: chord.type.degrees.length,
    rootDoubled,
  });

  return {
    id: chartFor(frets),
    frets: [...frets],
    fingers: fingering.fingers,
    ...(fingering.barre ? { barre: fingering.barre } : {}),
    position,
    span,
    region: regionOf(position, openStrings),
    degrees: tones.map((tone) => tone?.degree ?? null),
    notes: tones.map((tone) => tone?.note ?? null),
    omitted,
    bass: bass.degree,
    ...(bass.degree === '1' ? {} : { slashSymbol: `${chord.symbol}/${bass.note}` }),
    difficulty,
    score,
  };
}

function toneAt(chord: Chord, string: number, fret: number): ChordTone | null {
  const pitchClass = pitchClassAt(string, fret);
  return chord.tones.find((tone) => tone.pitchClass === pitchClass) ?? null;
}

/** Silent strings with sounding strings on both sides of them. */
function countInteriorMutes(frets: (number | null)[], sounding: number[]): number {
  let count = 0;
  for (let string = sounding[0]; string <= sounding[sounding.length - 1]; string += 1) {
    if (frets[string] === null) count += 1;
  }
  return count;
}

/** Two voices too close together, too far down the neck. */
function isMuddy(frets: (number | null)[]): boolean {
  const pitches: number[] = [];
  frets.forEach((fret, string) => {
    if (fret !== null) pitches.push(midiAt(string, fret));
  });
  pitches.sort((a, b) => a - b);

  for (let i = 0; i + 1 < pitches.length; i += 1) {
    const gap = pitches[i + 1] - pitches[i];
    for (const rule of MUD_RULES) {
      if (pitches[i] < rule.below && gap < rule.minGap) return true;
    }
  }

  return false;
}
