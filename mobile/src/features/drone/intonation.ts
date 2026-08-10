// Where a note's frequency comes from. Two answers, and the difference is the
// whole reason the toggle exists.

/** How the notes above the root are tuned. */
export type Intonation = 'equal' | 'just';

const A4_MIDI = 69;
const A4_HZ = 440;

/**
 * Just ratios above the root, by semitone distance. These are the intervals as
 * the overtone series actually produces them, which is why a chord tuned this
 * way stops beating and locks: an equal-tempered major third is 14 cents sharp
 * of 5/4, and over a sustained drone those 14 cents are an audible wobble
 * rather than a rounding error.
 *
 * The minor seventh is 16/9 rather than the harmonic 7/4. 7/4 locks harder but
 * sits 31 cents below the fret you would play it on, and a drone you cannot
 * play in tune with is not a practice tool.
 */
const JUST_RATIOS = [
  1, // unison
  16 / 15, // m2
  9 / 8, // M2
  6 / 5, // m3
  5 / 4, // M3
  4 / 3, // P4
  45 / 32, // tritone
  3 / 2, // P5
  8 / 5, // m6
  5 / 3, // M6
  16 / 9, // m7
  15 / 8, // M7
];

/** Equal-tempered frequency of a MIDI pitch, off A440. */
export function equalFrequency(midi: number): number {
  return A4_HZ * 2 ** ((midi - A4_MIDI) / 12);
}

/**
 * The frequency to sound a pitch at. In just intonation the root keeps its
 * equal-tempered frequency and everything else is tuned as a ratio against it —
 * so the drone still agrees with the tuner and with an open string, and only
 * the intervals inside the chord move.
 */
export function frequencyFor(midi: number, rootMidi: number, mode: Intonation): number {
  if (mode === 'equal') return equalFrequency(midi);

  const distance = midi - rootMidi;
  // Floor rather than truncate: a note below the root is still some ratio above
  // a lower octave of it, and truncation would fold it the wrong way.
  const octaves = Math.floor(distance / 12);
  const step = distance - octaves * 12;

  return equalFrequency(rootMidi) * JUST_RATIOS[step] * 2 ** octaves;
}
