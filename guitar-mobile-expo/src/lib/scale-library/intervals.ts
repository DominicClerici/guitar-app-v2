// Interval names, derived from a degree label and its semitone rather than
// stored. The degree number fixes the interval's number, and the gap between the
// tone and where the major scale would have put it fixes its quality — which is
// how ♯4 becomes A4 and ♭5 becomes d5 even though both sound the same.

import { degreeNumber } from './spell';

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11] as const;
const PERFECT = new Set([1, 4, 5]);

/** Interval label from the root: 'R', 'M3', 'm7', 'P5', 'A4', 'd5'. */
export function intervalLabel(degree: string, semitone: number): string {
  const number = degreeNumber(degree);
  const reference = MAJOR_STEPS[(number - 1) % 7];

  let diff = (((semitone - reference) % 12) + 12) % 12;
  if (diff > 6) diff -= 12;

  if (number === 1 && diff === 0) return 'R';

  const quality = PERFECT.has(number) ? perfectQuality(diff) : imperfectQuality(diff);
  return `${quality}${number}`;
}

function perfectQuality(diff: number): string {
  if (diff === 0) return 'P';
  if (diff > 0) return 'A'.repeat(diff);
  return 'd'.repeat(-diff);
}

function imperfectQuality(diff: number): string {
  if (diff === 0) return 'M';
  if (diff === -1) return 'm';
  if (diff > 0) return 'A'.repeat(diff);
  // Two below major is diminished, three is doubly so.
  return 'd'.repeat(-diff - 1);
}

/**
 * The scale as step sizes between consecutive tones, wrapping back to the root.
 * Whole and half steps read as W and H; the three-semitone gap a pentatonic
 * leaves reads as 1½, which is how it is written on paper.
 */
export function stepFormula(semitones: readonly number[]): string[] {
  return semitones.map((semitone, index) => {
    const next = index === semitones.length - 1 ? semitones[0] + 12 : semitones[index + 1];
    return stepName(next - semitone);
  });
}

function stepName(gap: number): string {
  if (gap === 1) return 'H';
  if (gap === 2) return 'W';
  if (gap === 3) return '1½';
  if (gap === 4) return '2';
  return String(gap / 2);
}
