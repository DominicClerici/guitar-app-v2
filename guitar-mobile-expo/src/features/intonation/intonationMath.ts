/** Interval between two frequencies, in cents. Positive means `a` is the higher. */
export function centsBetween(a: number, b: number): number {
  return 1200 * Math.log2(a / b);
}

/**
 * Average of two readings, taken in pitch space rather than frequency space —
 * the geometric mean sits exactly halfway between them in cents, which is the
 * quantity being measured.
 */
export function meanHz(values: number[]): number {
  const sum = values.reduce((acc, v) => acc + Math.log(v), 0);
  return Math.exp(sum / values.length);
}

export function medianOf(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Inside this band the reading is within the mic's own noise, so it reads as done. */
export const TOLERANCE_CENTS = 3;

export type Direction = 'toward' | 'away' | 'none';

/**
 * Which way the saddle moves. A fretted note sharp of the harmonic means the
 * string's speaking length is short, so the saddle goes back, away from the neck.
 */
export function directionFor(cents: number): Direction {
  if (cents > TOLERANCE_CENTS) return 'away';
  if (cents < -TOLERANCE_CENTS) return 'toward';
  return 'none';
}

export type Severity = 'good' | 'slight' | 'noticeable' | 'large';

export function severityFor(cents: number): Severity {
  const a = Math.abs(cents);
  if (a <= TOLERANCE_CENTS) return 'good';
  if (a <= 8) return 'slight';
  if (a <= 20) return 'noticeable';
  return 'large';
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  good: 'Within tolerance',
  slight: 'Slightly out',
  noticeable: 'Noticeably out',
  large: 'Badly out',
};

/** Tailwind text utility per severity, matching the tuner's own cents ramp. */
export const SEVERITY_TONE: Record<Severity, string> = {
  good: 'text-accent',
  slight: 'text-amber',
  noticeable: 'text-amber',
  large: 'text-rose',
};

const MM_PER_INCH = 25.4;

/**
 * Cents per unit of saddle travel, from the geometry alone. Nut-to-12th-fret is
 * fixed at half the designed scale L, so moving the saddle by d makes the open
 * string L + d and the fretted note L/2 + d. Differentiating
 * 1200·log2((L + d)/(L/2 + d)) at d = 0 gives 1200/ln2 / L — about 2.7 cents per
 * millimetre at 25.5", which is why the answer barely moves across the range of
 * real scale lengths.
 */
const CENTS_PER_OCTAVE_LN = 1200 / Math.LN2;

/**
 * How far the saddle has to travel to null out `cents` of error, in millimetres.
 * Always positive — `directionFor` carries the sign.
 *
 * Linearised around the current position, which holds well over the millimetre or
 * two a correction actually spans. It assumes an adjustable saddle: on a fixed or
 * shared compensated saddle only the direction is actionable.
 */
export function saddleTravelMm(cents: number, scaleInches: number): number {
  return (Math.abs(cents) * scaleInches * MM_PER_INCH) / CENTS_PER_OCTAVE_LN;
}

export interface ScalePreset {
  label: string;
  inches: number;
  note: string;
}

export const SCALE_PRESETS: ScalePreset[] = [
  { label: '24"', inches: 24, note: 'Short scale' },
  { label: '24¾"', inches: 24.75, note: 'Gibson' },
  { label: '25"', inches: 25, note: 'PRS' },
  { label: '25½"', inches: 25.5, note: 'Fender' },
];

export const DEFAULT_SCALE_INCHES = 25.5;
export const MIN_SCALE_INCHES = 20;
export const MAX_SCALE_INCHES = 30;
