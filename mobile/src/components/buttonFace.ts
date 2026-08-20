import { useTokens } from '@/lib/tokens';

/**
 * The tables every button-shaped control paints from: what a face is made of,
 * and how big the boxes come.
 *
 * They live here rather than in `Button` because every rounded thing in the app
 * paints from them — `Button`, `ArmedButton`, `SelectableChip` and `Face` — and a
 * size scale that drifted between them would be worse than no scale at all. Each
 * of them still owns its own variant table; what is shared is the vocabulary
 * those tables are written in.
 */

/** Fallbacks mirror `global.css`, for the moment before uniwind has resolved. */
export const PALETTE = {
  '--accent': '#5ec8c2',
  '--accent-edge': 'rgba(255, 255, 255, 0.16)',
  '--accent-line': 'rgba(94, 200, 194, 0.5)',
  '--accent-wash': 'rgba(94, 200, 194, 0.12)',
  '--on-accent': '#04211f',
  '--bg': '#0c0d10',
  '--surface': '#181a1f',
  '--surface-raised': '#20232a',
  '--tray': '#131418',
  '--line': '#2a2e36',
  '--line-soft': '#23262d',
  '--ink': '#eef0f4',
  '--ink-muted': '#9aa0aa',
  '--ink-faint': '#62666e',
  '--rose': '#e0788f',
  '--rose-wash': 'rgba(224, 120, 143, 0.12)',
} as const;

export type Token = keyof typeof PALETTE;

const TOKENS = Object.keys(PALETTE) as Token[];

/** A colour a face paints with, or the absence of one. */
export type Paint = Token | 'transparent';

export interface FaceSpec {
  fill: Paint;
  /**
   * Every face declares one, `transparent` where it should not show, so the
   * shape is drawn from the same props whatever it is wearing.
   */
  stroke: Paint;
  /** The label colour as a utility, since a `Text` takes a class. */
  text: string;
  /** The same colour as a value, for the symbol tint and the spinner. */
  tint: Token;
  press: string;
}

/**
 * Resolves a face's colours for the native squircle layer. One hook call
 * covers every token in the palette, so a component makes it once regardless
 * of which face it ends up wearing.
 */
export function useFacePaint(): (paint: Paint) => string {
  const values = useTokens(TOKENS);

  return (paint) =>
    paint === 'transparent' ? 'transparent' : (values[TOKENS.indexOf(paint)] ?? PALETTE[paint]);
}

/**
 * Disabled overrides the face rather than dimming it, so a control that cannot
 * be pressed reads as disabled instead of as a faded version of the thing it
 * was — a 45% accent on near-black still half-reads as the CTA.
 */
export const DISABLED: FaceSpec = {
  fill: '--surface',
  stroke: '--line-soft',
  text: 'text-ink-faint',
  tint: '--ink-faint',
  press: '',
};

export interface SizeSpec {
  /** Height and the padding a label needs either side of it. */
  box: string;
  /** The same height with no padding, locked square, for a control carrying only a glyph. */
  square: string;
  radius: number;
  label: string;
  /** Where the pending spinner sits, matching the box's own padding. */
  spinner: string;
  icon: number;
  soloIcon: number;
}

export const SIZES = {
  /** A pill or a mini key, for a control that has to sit inside something else. */
  xs: {
    box: 'h-[30px] gap-[5px] px-[10px]',
    square: 'h-[30px] w-[30px]',
    radius: 8,
    label: 'text-[12px] font-semibold tracking-[-0.1px]',
    spinner: 'right-[10px]',
    icon: 11,
    soloIcon: 13,
  },
  sm: {
    box: 'h-[38px] gap-[6px] px-[14px]',
    square: 'h-[38px] w-[38px]',
    radius: 10,
    label: 'text-[13px] font-semibold tracking-[-0.2px]',
    spinner: 'right-[14px]',
    icon: 12,
    soloIcon: 15,
  },
  md: {
    box: 'h-[46px] gap-[8px] px-[16px]',
    square: 'h-[46px] w-[46px]',
    radius: 12,
    label: 'text-[15px] font-semibold tracking-[-0.2px]',
    spinner: 'right-[16px]',
    icon: 13,
    soloIcon: 17,
  },
  lg: {
    box: 'h-[50px] gap-[9px] px-[18px]',
    square: 'h-[50px] w-[50px]',
    radius: 13,
    label: 'text-[15px] font-semibold tracking-[-0.2px]',
    spinner: 'right-[18px]',
    icon: 13,
    soloIcon: 17,
  },
  /**
   * The transport key: the one thing on a screen you press without looking, and
   * the only size that is a target before it is a label. Square and round, in
   * practice — `radius={999}` is what makes it the circle it reads as.
   */
  xl: {
    box: 'h-[78px] gap-[10px] px-[26px]',
    square: 'h-[78px] w-[78px]',
    radius: 22,
    label: 'text-[17px] font-semibold tracking-[-0.3px]',
    spinner: 'right-[26px]',
    icon: 17,
    soloIcon: 27,
  },
  /**
   * No box: as tall as its own label, and no wider than it either. For a
   * control that reads as a piece of the text around it rather than as a key —
   * which is only ever `ghost` or `link`, since a face needs a box to be drawn
   * on. The vertical padding is a tap target, not a look; reach for `hitSlop`
   * before adding more of it.
   */
  inline: {
    box: 'gap-[6px] py-[6px]',
    square: 'p-[6px]',
    radius: 0,
    label: 'text-[15px] font-medium tracking-[-0.2px]',
    spinner: 'right-0',
    icon: 15,
    soloIcon: 15,
  },
} satisfies Record<string, SizeSpec>;

export type Size = keyof typeof SIZES;

/** The micro-label, which does not scale — it is 10.5px at every size. */
export const MONO = 'font-mono text-[10.5px] uppercase tracking-[1.5px]';
