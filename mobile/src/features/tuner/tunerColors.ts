import { useCSSVariable } from 'uniwind';

// Pitch error in cents at each colour stop: dead-on stays accent through the in-tune
// band, drifts amber, then rose once it is audibly wrong.
export const CENTS_STOPS = [0, 5, 15, 50];
export const MAX_CENTS = 50;

export type TunerColors = {
  accent: string;
  amber: string;
  rose: string;
  ink: string;
  inkMuted: string;
  inkFaint: string;
  line: string;
  lineSoft: string;
  bg: string;
  surface: string;
};

const FALLBACKS: TunerColors = {
  accent: '#5ec8c2',
  amber: '#e0a84e',
  rose: '#e0788f',
  ink: '#eef0f4',
  inkMuted: '#9aa0aa',
  inkFaint: '#62666e',
  line: '#2a2e36',
  lineSoft: '#23262d',
  bg: '#0c0d10',
  surface: '#181a1f',
};

const NAMES = [
  '--accent',
  '--amber',
  '--rose',
  '--ink',
  '--ink-muted',
  '--ink-faint',
  '--line',
  '--line-soft',
  '--bg',
  '--surface',
];

const KEYS = Object.keys(FALLBACKS) as (keyof TunerColors)[];

/** Aurora tokens the tuner draws with, resolved to plain strings for worklet use. */
export function useTunerColors(): TunerColors {
  const vars = useCSSVariable(NAMES);
  const out = {} as TunerColors;
  KEYS.forEach((key, i) => {
    out[key] = (vars[i] as string | undefined) ?? FALLBACKS[key];
  });
  return out;
}

/** Colour ramp for `interpolateColor` over `CENTS_STOPS`. */
export function centsRamp(c: TunerColors): string[] {
  return [c.accent, c.accent, c.amber, c.rose];
}

/** The same ramp pre-multiplied to a glow alpha, so tint and halo can never disagree. */
export function glowRamp(c: TunerColors, alpha = 0.55): string[] {
  return centsRamp(c).map((hex) => withAlpha(hex, alpha));
}

/**
 * The same three zones as a text utility, for the JS-thread readouts that update at the
 * 100ms throttle rather than per frame. Quantised rather than interpolated — text does
 * not need a continuous ramp, and this keeps colour in classes rather than inline styles.
 */
export function centsTextClass(cents: number | null): string {
  if (cents === null) return 'text-ink-muted';
  const a = Math.abs(cents);
  if (a <= 5) return 'text-accent';
  if (a <= 15) return 'text-amber';
  return 'text-rose';
}

/** `#rrggbb` -> `rgba(r, g, b, alpha)`. Safe to call from a worklet. */
export function withAlpha(hex: string, alpha: number): string {
  'worklet';
  const v = parseInt(hex.slice(1), 16);
  const r = (v >> 16) & 255;
  const g = (v >> 8) & 255;
  const b = v & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
