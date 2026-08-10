// The trainer's vocabulary: the twelve chromatic scale degrees, named the way
// functional ear training names them — numbers off the tonic, never note names,
// so what is learned in one key is what is known in every key.

/** Label for each degree, indexed by semitones above the tonic. */
export const DEGREE_LABELS = [
  '1',
  'b2',
  '2',
  'b3',
  '3',
  '4',
  '#4',
  '5',
  'b6',
  '6',
  'b7',
  '7',
] as const;

/**
 * The circle's seating order, clockwise from 12 o'clock: degrees a fifth apart
 * sit next to each other. Fifth-related degrees feel alike, so distance around
 * the circle reads as distance in feeling — 1 and 5 are neighbours, 1 and #4
 * face each other across the middle.
 */
export const FIFTHS_ORDER = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5] as const;

/** Where new ears start: the tonic triad. */
export const DEFAULT_DEGREES = [0, 4, 7];

export function degreeLabel(semitones: number): string {
  return DEGREE_LABELS[((semitones % 12) + 12) % 12];
}

/** C2 — the drone lives in the octave a low E string shares. */
const DRONE_BASE_MIDI = 36;

/** The drone's pitch for a tonic, always in the low octave the ear rests on. */
export function droneMidiFor(tonicPc: number): number {
  return DRONE_BASE_MIDI + tonicPc;
}

/**
 * A question or audition tone. The base sits two octaves over the drone — far
 * enough up to read as a separate voice — and `octave` moves it a further
 * octave either way, which is what stops a degree being memorised as one pitch.
 */
export function toneMidiFor(tonicPc: number, degree: number, octave: number): number {
  return droneMidiFor(tonicPc) + 24 + degree + octave * 12;
}
