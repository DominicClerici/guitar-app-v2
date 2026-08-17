// Close-voiced triads as concrete places on a neck.
//
// caged.ts answers "where does the C form of an A chord sit, and what is inside
// it". This answers the question the triads pathway needs instead: "where does a
// C major triad with E in the bass sit on strings 4-3-2". The two are different
// shapes of answer on purpose — a CAGED window draws every note it contains and
// leaves the grip to `/chord-shapes`, whereas a close triad *is* the grip, three
// notes on three adjacent strings and nothing to choose. So this returns
// voicings, not marks.
//
// The close voicing falls out of one rule rather than a shape table: put the
// bass tone on the set's lowest string, then take each remaining tone at its
// first occurrence *above* the note before it. Nothing here knows that the G→B
// major third shifts a shape by a fret — that emerges, which is the property the
// tests pin.
//
// String indices are @/lib/theory's throughout: 0 = high e, 5 = low E. String
// *set* names count the other way, from one at the high e, because that is what
// the content wire format and every lesson say.

import { FRET_COUNT, midiAt, pitchClassAt } from '@/lib/theory';

export const TRIAD_QUALITIES = ['major', 'minor', 'diminished', 'augmented'] as const;

export type TriadQuality = (typeof TRIAD_QUALITIES)[number];

/** The four sets of three adjacent strings, named high-string-first as lessons name them. */
export const STRING_SETS = ['1-2-3', '2-3-4', '3-4-5', '4-5-6'] as const;

export type StringSet = (typeof STRING_SETS)[number];

/** Which chord tone is in the bass. Rotating the bottom note up an octave is the whole move. */
export const TRIAD_INVERSIONS = ['root', 'first', 'second'] as const;

export type TriadInversion = (typeof TRIAD_INVERSIONS)[number];

/** Set → its three string indices, **low string first** — the order the notes sound in. */
export const STRING_SET_INDICES: Record<StringSet, readonly [number, number, number]> = {
  '1-2-3': [2, 1, 0],
  '2-3-4': [3, 2, 1],
  '3-4-5': [4, 3, 2],
  '4-5-6': [5, 4, 3],
};

interface TriadTone {
  /** Above the root. */
  semitones: number;
  degree: string;
}

/** Root, third, fifth — in that order, before any inversion rotates them. */
const TRIAD_TONES: Record<TriadQuality, readonly [TriadTone, TriadTone, TriadTone]> = {
  major: [
    { semitones: 0, degree: '1' },
    { semitones: 4, degree: '3' },
    { semitones: 7, degree: '5' },
  ],
  minor: [
    { semitones: 0, degree: '1' },
    { semitones: 3, degree: 'b3' },
    { semitones: 7, degree: '5' },
  ],
  diminished: [
    { semitones: 0, degree: '1' },
    { semitones: 3, degree: 'b3' },
    { semitones: 6, degree: 'b5' },
  ],
  augmented: [
    { semitones: 0, degree: '1' },
    { semitones: 4, degree: '3' },
    { semitones: 8, degree: '#5' },
  ],
};

/** The suffix printed after the root, matching the chord library's symbols. */
export const TRIAD_SYMBOL: Record<TriadQuality, string> = {
  major: '',
  minor: 'm',
  diminished: 'dim',
  augmented: 'aug',
};

/**
 * Widest fret span a triad grip may cover. Four is a hand: the same bound
 * `guitar-voicings` puts on a fingered shape, and it is what disqualifies the
 * E-G-C on strings 6-5-4 at the nut — G2 lies below the open A string, so the
 * close voicing has to wait for the twelfth fret.
 */
const MAX_SPAN = 4;

export interface TriadNote {
  /** 0 = high e … 5 = low E. */
  string: number;
  fret: number;
  /** '1', 'b3', '#5' … — what the dot says. */
  degree: string;
  isRoot: boolean;
}

export interface TriadVoicing {
  quality: TriadQuality;
  set: StringSet;
  inversion: TriadInversion;
  /** Low string first, which is also low pitch first — a close voicing ascends. */
  notes: [TriadNote, TriadNote, TriadNote];
  /** Lowest and highest fret the grip touches, inclusive. An open string is fret 0. */
  from: number;
  to: number;
}

/** The three tones in sounding order for this inversion: bass first. */
function toneOrder(quality: TriadQuality, inversion: TriadInversion): TriadTone[] {
  const tones = TRIAD_TONES[quality];
  const rotation = TRIAD_INVERSIONS.indexOf(inversion);
  return [0, 1, 2].map((offset) => tones[(offset + rotation) % 3]);
}

/** First fret on this string sounding `pitchClass` strictly above `floor` (a MIDI pitch). */
function firstAbove(string: number, pitchClass: number, floor: number): number | null {
  for (let fret = 0; fret <= FRET_COUNT; fret += 1) {
    if (pitchClassAt(string, fret) === pitchClass && midiAt(string, fret) > floor) return fret;
  }
  return null;
}

/**
 * Every place this inversion fits on the neck, lowest first — usually two, since
 * a set holding a shape at fret 2 holds it again at 14.
 */
export function triadVoicings(
  rootPitchClass: number,
  quality: TriadQuality,
  set: StringSet,
  inversion: TriadInversion,
): TriadVoicing[] {
  const strings = STRING_SET_INDICES[set];
  const tones = toneOrder(quality, inversion);
  const found: TriadVoicing[] = [];

  const asNote = (string: number, fret: number, tone: TriadTone): TriadNote => ({
    string,
    fret,
    degree: tone.degree,
    isRoot: tone.semitones === 0,
  });

  for (let bass = 0; bass <= FRET_COUNT; bass += 1) {
    if (pitchClassAt(strings[0], bass) !== (rootPitchClass + tones[0].semitones) % 12) continue;

    const notes = [asNote(strings[0], bass, tones[0])];
    let floor = midiAt(strings[0], bass);

    for (let voice = 1; voice < 3; voice += 1) {
      const fret = firstAbove(strings[voice], (rootPitchClass + tones[voice].semitones) % 12, floor);
      if (fret === null) break;

      notes.push(asNote(strings[voice], fret, tones[voice]));
      floor = midiAt(strings[voice], fret);
    }

    if (notes.length < 3) continue;

    const frets = notes.map((note) => note.fret);
    const from = Math.min(...frets);
    const to = Math.max(...frets);
    // A span no hand covers is not a voicing, and skipping it here is what makes
    // the next occurrence up the neck the answer rather than a fallback.
    if (to - from > MAX_SPAN) continue;

    found.push({
      quality,
      set,
      inversion,
      notes: notes as [TriadNote, TriadNote, TriadNote],
      from,
      to,
    });
  }

  return found;
}

/**
 * The one voicing a diagram should draw: the lowest that fits, or the lowest at
 * or above `minFret` when a lesson wants the copy further up the neck.
 */
export function triadVoicing(
  rootPitchClass: number,
  quality: TriadQuality,
  set: StringSet,
  inversion: TriadInversion,
  minFret = 0,
): TriadVoicing | undefined {
  return triadVoicings(rootPitchClass, quality, set, inversion).find(
    (voicing) => voicing.from >= minFret,
  );
}

/**
 * All three inversions along one string set, in neck order — the claim a single
 * diagram cannot make: that they are not three alternatives but one cycle of
 * chord tones climbing the set, repeating an octave up.
 */
export function triadLadder(
  rootPitchClass: number,
  quality: TriadQuality,
  set: StringSet,
): TriadVoicing[] {
  return TRIAD_INVERSIONS.flatMap((inversion) =>
    triadVoicings(rootPitchClass, quality, set, inversion),
  ).sort((a, b) => a.from - b.from || a.to - b.to);
}

/**
 * Rows of voicings, none of which holds two that overlap — the same packing
 * `cagedLadderLanes` does, for the same reason: bands are drawn over one fret
 * axis and two sharing a fret would collide. Close inversions rarely do overlap,
 * which is exactly why this is here rather than assumed away.
 */
export function triadLadderLanes(voicings: readonly TriadVoicing[]): TriadVoicing[][] {
  const lanes: TriadVoicing[][] = [];

  for (const voicing of voicings) {
    const lane = lanes.find((row) => (row[row.length - 1]?.to ?? -1) < voicing.from);
    if (lane) lane.push(voicing);
    else lanes.push([voicing]);
  }

  return lanes;
}
