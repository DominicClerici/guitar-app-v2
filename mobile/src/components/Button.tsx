import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import type { SquircleCorners } from '@modules/expo-squircle-view';

import { DISABLED, MONO, SIZES, useFacePaint, type FaceSpec, type Size } from './buttonFace';
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
 *
 * Selection lives in `SelectableChip`, and a destructive action that asks twice
 * lives in `ArmedButton`. Both paint from the same size scale as this.
 */

type SymbolName = ComponentProps<typeof SymbolView>['name'];

export type { Size } from './buttonFace';

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
} satisfies Record<string, FaceSpec>;

export type Variant = keyof typeof VARIANTS;

interface Base {
  variant?: Variant;
  size?: Size;
  text?: 'plain' | 'mono';
  /** An SF Symbol ahead of the label, or the whole of an icon-only button. */
  icon?: SymbolName;
  /** Overrides the size's own rounding; one number, or the corners that differ. */
  radius?: number | Partial<SquircleCorners>;
  /**
   * Where the icon and label sit in a button wider than they are. `start` is for
   * a full-width row in a menu, where a column of labels has to line up.
   */
  align?: 'center' | 'start';
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
}

/**
 * A button acts on release. The exception is one that repeats while held — a
 * stepper — where the first step has to land on the way down or a quick tap
 * feels late, so those take `onPressIn` instead and nothing else fires.
 */
type Handlers =
  | { onPress: () => void; onPressIn?: () => void; onPressOut?: () => void }
  | { onPress?: () => void; onPressIn: () => void; onPressOut?: () => void };

/** A button not carrying a plain string has nothing to read out, so it has to say. */
type Labelling =
  | { children: string; accessibilityLabel?: string }
  | { children?: ReactNode; accessibilityLabel: string };

type Props = Base & Handlers & Labelling;

export function Button({
  variant = 'primary',
  size = 'md',
  text = 'plain',
  icon,
  radius,
  align = 'center',
  square,
  disabled = false,
  pending = false,
  hitSlop,
  className = '',
  accessibilityLabel,
  onPress,
  onPressIn,
  onPressOut,
  children,
}: Props) {
  const paint = useFacePaint();

  const spec = disabled ? DISABLED : VARIANTS[variant];
  const metrics = SIZES[size];
  const inert = disabled || pending;
  const solo = square ?? children === undefined;
  const tint = paint(spec.tint);

  return (
    <SquirclePressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={inert}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === 'string' ? children : undefined)
      }
      accessibilityState={{ disabled: inert, busy: pending }}
      radius={radius ?? metrics.radius}
      fill={paint(spec.fill)}
      stroke={paint(spec.stroke)}
      strokeWidth={1}
      className={`flex-row items-center ${align === 'start' ? 'justify-start' : 'justify-center'} ${
        solo ? metrics.square : metrics.box
      } ${inert ? '' : spec.press} ${className}`}
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
