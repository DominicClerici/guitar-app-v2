import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import type { SquircleCorners } from '@modules/expo-squircle-view';

import { useTokens } from '@/lib/tokens';

import { SquirclePressable } from './Squircle';

/**
 * Every button the app presses, as three independent choices: what it is
 * (`variant`), how big it is (`size`), and which of the two label typographies
 * it wears (`text`).
 *
 * The face is a native squircle rather than a `border-radius`, which is what
 * costs the bevel: that layer strokes one colour, and a bevel is a lit top
 * easing into a shadowed bottom. So a button is now a flat fill and a single
 * hairline, and the sense of lift comes from the fill alone.
 *
 * ```tsx
 * <Button variant="primary" size="lg" icon="play.fill" onPress={go}>
 *   Continue
 * </Button>
 *
 * <Button icon="ellipsis" variant="secondary" accessibilityLabel="More options" onPress={open} />
 * ```
 */

type SymbolName = ComponentProps<typeof SymbolView>['name'];

/** Fallbacks mirror `global.css`, for the moment before uniwind has resolved. */
const PALETTE = {
  '--accent': '#5ec8c2',
  '--accent-edge': 'rgba(255, 255, 255, 0.16)',
  '--accent-line': 'rgba(94, 200, 194, 0.5)',
  '--accent-wash': 'rgba(94, 200, 194, 0.12)',
  '--on-accent': '#04211f',
  '--surface': '#181a1f',
  '--surface-raised': '#20232a',
  '--line-soft': '#23262d',
  '--ink': '#eef0f4',
  '--ink-muted': '#9aa0aa',
  '--ink-faint': '#62666e',
  '--rose': '#e0788f',
} as const;

type Token = keyof typeof PALETTE;

const TOKENS = Object.keys(PALETTE) as Token[];

/** A colour a variant paints with, or the absence of one. */
type Paint = Token | 'transparent';

interface VariantSpec {
  fill: Paint;
  /**
   * Every variant declares one, `transparent` where it should not show, so the
   * shape is drawn from the same props whatever it is wearing.
   */
  stroke: Paint;
  /** The label colour as a utility, since a `Text` takes a class. */
  text: string;
  /** The same colour as a value, for the symbol tint and the spinner. */
  tint: Token;
  press: string;
}

const VARIANTS = {
  /** The one thing to do on the screen. */
  primary: {
    fill: '--accent',
    stroke: '--accent-edge',
    text: 'text-on-accent',
    tint: '--on-accent',
    press: 'active:opacity-80',
  },
  /** A raised key beside it — the other thing you might do. */
  secondary: {
    fill: '--surface-raised',
    stroke: '--line-soft',
    text: 'text-ink',
    tint: '--ink',
    press: 'active:opacity-70',
  },
  /** Present but not lifted, for a control sitting on a card rather than the page. */
  quiet: {
    fill: '--surface',
    stroke: '--line-soft',
    text: 'text-ink-muted',
    tint: '--ink-muted',
    press: 'active:opacity-70',
  },
  /** Accent at a whisper: chosen, or a submit that does not need to shout. */
  soft: {
    fill: '--accent-wash',
    stroke: '--accent-line',
    text: 'text-accent',
    tint: '--accent',
    press: 'active:opacity-70',
  },
  /** No face at all — a back link or an inline action. */
  ghost: {
    fill: 'transparent',
    stroke: 'transparent',
    text: 'text-ink-muted',
    tint: '--ink-muted',
    press: 'active:opacity-60',
  },
  /**
   * `ghost` in accent ink. The one tap in a block of copy that has to look
   * tappable without a face to say so — Cancel, Reset, Resend.
   */
  link: {
    fill: 'transparent',
    stroke: 'transparent',
    text: 'text-accent',
    tint: '--accent',
    press: 'active:opacity-60',
  },
  /** The raised key with rose ink. Nothing in Aurora is a filled red. */
  destructive: {
    fill: '--surface-raised',
    stroke: '--line-soft',
    text: 'text-rose',
    tint: '--rose',
    press: 'active:opacity-70',
  },
} satisfies Record<string, VariantSpec>;

export type Variant = keyof typeof VARIANTS;

/**
 * Disabled overrides the variant rather than dimming it, so a button that
 * cannot be pressed reads as disabled instead of as a faded version of the
 * thing it was — a 45% accent on near-black still half-reads as the CTA.
 */
const DISABLED: VariantSpec = {
  fill: '--surface',
  stroke: '--line-soft',
  text: 'text-ink-faint',
  tint: '--ink-faint',
  press: '',
};

interface SizeSpec {
  /** Height and the padding a label needs either side of it. */
  box: string;
  /** The same height with no padding, locked square, for a button carrying only a glyph. */
  square: string;
  radius: number;
  label: string;
  /** Where the pending spinner sits, matching the box's own padding. */
  spinner: string;
  icon: number;
  soloIcon: number;
}

const SIZES = {
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
const MONO = 'font-mono text-[10.5px] uppercase tracking-[1.5px]';

interface Base {
  variant?: Variant;
  size?: Size;
  text?: 'plain' | 'mono';
  /** An SF Symbol ahead of the label, or the whole of an icon-only button. */
  icon?: SymbolName;
  /** Overrides the size's own rounding; one number, or the corners that differ. */
  radius?: number | Partial<SquircleCorners>;
  /**
   * Width locked to height and the horizontal padding dropped. Defaults to true
   * for a button with no children, which is what an `icon`-only one is.
   */
  square?: boolean;
  disabled?: boolean;
  /** Working. Keeps its face, blocks presses, and shows a spinner beside the label. */
  pending?: boolean;
  /** Grows the tap target past the face, for a button too small to be an easy one. */
  hitSlop?: number;
  /** Layout only — width, flex, margins. The face comes from `variant`. */
  className?: string;
  onPress: () => void;
}

/** A button not carrying a plain string has nothing to read out, so it has to say. */
type Props = Base &
  (
    | { children: string; accessibilityLabel?: string }
    | { children?: ReactNode; accessibilityLabel: string }
  );

export function Button({
  variant = 'primary',
  size = 'md',
  text = 'plain',
  icon,
  radius,
  square,
  disabled = false,
  pending = false,
  hitSlop,
  className = '',
  accessibilityLabel,
  onPress,
  children,
}: Props) {
  const values = useTokens(TOKENS);
  const colour = (name: Paint) =>
    name === 'transparent' ? 'transparent' : (values[TOKENS.indexOf(name)] ?? PALETTE[name]);

  const spec = disabled ? DISABLED : VARIANTS[variant];
  const metrics = SIZES[size];
  const inert = disabled || pending;
  const solo = square ?? children === undefined;
  const tint = colour(spec.tint);

  return (
    <SquirclePressable
      onPress={onPress}
      disabled={inert}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === 'string' ? children : undefined)
      }
      accessibilityState={{ disabled: inert, busy: pending }}
      radius={radius ?? metrics.radius}
      fill={colour(spec.fill)}
      stroke={colour(spec.stroke)}
      strokeWidth={1}
      className={`flex-row items-center justify-center ${solo ? metrics.square : metrics.box} ${
        inert ? '' : spec.press
      } ${className}`}
    >
      {icon ? (
        <SymbolView
          name={icon}
          size={solo ? metrics.soloIcon : metrics.icon}
          weight="semibold"
          tintColor={tint}
        />
      ) : null}

      {typeof children === 'string' ? (
        <Text className={`${text === 'mono' ? MONO : metrics.label} ${spec.text}`}>{children}</Text>
      ) : (
        children
      )}

      {/* Out of the flow, so the label does not shift and the button does not
          change width for the length of the request. */}
      {pending ? (
        <View className={`absolute ${metrics.spinner}`}>
          <ActivityIndicator size="small" color={tint} />
        </View>
      ) : null}
    </SquirclePressable>
  );
}
