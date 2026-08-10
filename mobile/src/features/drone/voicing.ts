import type { PlacedNote } from '@/features/chord-detection/useChordDetection';
import { essentialTones, type Chord, type ChordTone } from '@/lib/chord-library';
import { OPEN_PITCHES_MIDI } from '@/lib/theory';

/** Six notes is as many as a guitar holds, and as many as a chord needs to be itself. */
export const MAX_VOICES = 6;

/** Lowest the bass note is allowed to sit: E2, the guitar's own floor. */
const BASS_FLOOR = 40;
const BASS_FLOOR_PITCH_CLASS = BASS_FLOOR % 12;

/**
 * Space the bass wants beneath the note above it. A third stacked directly on a
 * low root is mud; the interval has to open out down there, which is why every
 * instrument that voices chords low plays a tenth rather than a third.
 */
const BASS_GAP = 7;
/** Space every other pair wants. Above the bass, close voicing is the point. */
const INNER_GAP = 3;

export const MIN_OCTAVE = -1;
export const MAX_OCTAVE = 1;

export function clampOctave(octave: number): number {
  return Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, octave));
}

/** Where the bass lands for a root: the lowest E2-and-up placement of it. */
function bassPitchFor(rootPitchClass: number): number {
  return BASS_FLOOR + ((rootPitchClass - BASS_FLOOR_PITCH_CLASS + 12) % 12);
}

/**
 * The tones that make it into the voicing. A thirteenth has seven and six
 * strings' worth of room, so the library's own drop order decides what goes.
 */
export function voicedTones(chord: Chord): ChordTone[] {
  return essentialTones(chord, MAX_VOICES);
}

/**
 * Tones as pitches to sound, voiced the way a pad or an organ would rather than
 * the way a hand would: bass on the root, then each tone at the next placement
 * that clears the gap its register asks for. Wide at the bottom, closing up as
 * it rises — which is the shape that stays legible however many tones the chord
 * has.
 */
export function chordPitches(tones: ChordTone[]): number[] {
  if (tones.length === 0) return [];

  const bass = bassPitchFor(tones[0].pitchClass);
  const pitches = [bass];

  for (let index = 1; index < tones.length; index += 1) {
    const previous = pitches[pitches.length - 1];
    const gap = index === 1 ? BASS_GAP : INNER_GAP;

    // The next placement of this pitch class above the note below it, pushed up
    // an octave if it landed too close.
    const rise = ((((tones[index].pitchClass - previous) % 12) + 12) % 12) || 12;
    let pitch = previous + rise;
    if (rise < gap) pitch += 12;

    pitches.push(pitch);
  }

  return pitches;
}

/** A single held note: the root alone, in the same register the chords use. */
export function notePitches(rootPitchClass: number): number[] {
  return [bassPitchFor(rootPitchClass)];
}

/**
 * What a shape on the neck actually sounds. No re-voicing — the point of
 * building it by hand is to hear the octaves you chose.
 *
 * Unisons are dropped. Two strings at the same pitch is ordinary on a guitar
 * and part of why a shape rings, but that comes from two strings never being
 * exactly in tune with each other; sounded twice from one oscillator bank it is
 * only the same note at double the level. The detuned layers inside each voice
 * already supply the beating a unison would have given.
 */
export function neckPitches(placed: PlacedNote[]): number[] {
  const pitches = placed.map((note) => OPEN_PITCHES_MIDI[note.string] + note.fret);
  return [...new Set(pitches)].sort((a, b) => a - b);
}

/**
 * The pitch just intonation tunes everything else against. The sounding root
 * where there is one; otherwise the root's pitch class dropped to just under
 * the chord, so the ratios still come out of the harmony rather than out of
 * whichever note happens to be lowest.
 */
export function rootPitchFor(pitches: number[], rootPitchClass: number | null): number {
  if (pitches.length === 0) return BASS_FLOOR;

  const lowest = pitches[0];
  if (rootPitchClass === null) return lowest;

  const sounding = pitches.find((pitch) => pitch % 12 === rootPitchClass);
  if (sounding !== undefined) return sounding;

  return lowest - ((((lowest - rootPitchClass) % 12) + 12) % 12);
}

export function shiftOctave(pitches: number[], octave: number): number[] {
  if (octave === 0) return pitches;
  return pitches.map((pitch) => pitch + octave * 12);
}
