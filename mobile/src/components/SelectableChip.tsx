import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import type { SquircleCorners } from '@modules/expo-squircle-view';

import { DISABLED, MONO, SIZES, useFacePaint, type FaceSpec, type Size } from './buttonFace';
import { FadingHScroll } from './FadingHScroll';
import { SquirclePressable } from './Squircle';

/**
 * One of a set you pick from: a root, a chord quality, a scale, a key.
 *
 * A chip is not a button — it carries selection rather than an action, and the
 * face says which of the two it is, so there is no `variant` to choose. What it
 * does share is the size scale, since a rail of chips and the buttons under it
 * are read as one page.
 *
 * ```tsx
 * <SelectableChip selected={id === scaleId} onPress={() => onChange(id)}>
 *   {name}
 * </SelectableChip>
 * ```
 *
 * Reach for `SelectableChips` below when the set is a plain list of labels; it
 * owns the row or the grid as well as the chips in it. This primitive is for the
 * sets that are not plain — where a label is a node, or the ink has something of
 * its own to say.
 */

/** Chosen: accent at a whisper, the way every selected thing in Aurora reads. */
const SELECTED: FaceSpec = {
  fill: '--accent-wash',
  stroke: '--accent-line',
  text: 'text-accent',
  tint: '--accent',
  press: 'active:opacity-70',
};

/** Not chosen, but still a face — a chip is a key you can see before you press it. */
const RESTING: FaceSpec = {
  fill: '--surface',
  stroke: '--line-soft',
  text: 'text-ink',
  tint: '--ink',
  press: 'active:opacity-70',
};

/**
 * The same chip with its label a step back, for a member of the set that is a
 * lesser answer than the rest — an enharmonic spelling among the naturals.
 */
const MUTED = 'text-ink-muted';

interface ChipProps {
  selected: boolean;
  size?: Size;
  text?: 'plain' | 'mono';
  /** Sits the label back a step while unselected. */
  muted?: boolean;
  disabled?: boolean;
  radius?: number | Partial<SquircleCorners>;
  hitSlop?: number;
  /** Layout only — width, flex, margins. */
  className?: string;
  accessibilityLabel?: string;
  /** A string takes the size's label typography; anything else renders as-is. */
  children: ReactNode;
  onPress: () => void;
}

export function SelectableChip({
  selected,
  size = 'sm',
  text = 'plain',
  muted = false,
  disabled = false,
  radius,
  hitSlop,
  className = '',
  accessibilityLabel,
  children,
  onPress,
}: ChipProps) {
  const paint = useFacePaint();

  const spec = disabled ? DISABLED : selected ? SELECTED : RESTING;
  const metrics = SIZES[size];
  const ink = !disabled && !selected && muted ? MUTED : spec.text;

  return (
    <SquirclePressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={
        accessibilityLabel ?? (typeof children === 'string' ? children : undefined)
      }
      radius={radius ?? metrics.radius}
      fill={paint(spec.fill)}
      stroke={paint(spec.stroke)}
      strokeWidth={1}
      className={`flex-row items-center justify-center ${metrics.box} ${
        disabled ? '' : spec.press
      } ${className}`}
    >
      {typeof children === 'string' ? (
        <Text className={`${text === 'mono' ? MONO : metrics.label} ${ink}`}>{children}</Text>
      ) : (
        children
      )}
    </SquirclePressable>
  );
}

export interface ChipItem {
  id: string;
  /** A string takes the chip's own typography; anything else renders as-is. */
  label: ReactNode;
  /** What the chip is, where the label is a symbol rather than a name. */
  accessibilityLabel?: string;
  muted?: boolean;
  disabled?: boolean;
}

interface GroupProps {
  items: readonly ChipItem[];
  /** The `id` of the chosen chip. */
  value: string;
  onChange: (id: string) => void;
  size?: Size;
  text?: 'plain' | 'mono';
  /**
   * Lay the set out as a rail that scrolls sideways rather than a grid that
   * wraps. For a set long enough that wrapping it would take the page over —
   * seventeen roots, twelve keys.
   */
  scroll?: boolean;
  /** Classes on the row or grid — padding, and a gap other than the default. */
  className?: string;
  /** Classes on every chip in it — a minimum width, usually. */
  chipClassName?: string;
}

/** A set of chips and the row or grid they sit in. */
export function SelectableChips({
  items,
  value,
  onChange,
  size = 'sm',
  text = 'plain',
  scroll = false,
  className = '',
  chipClassName,
}: GroupProps) {
  const chips = items.map((item) => (
    <SelectableChip
      key={item.id}
      selected={item.id === value}
      size={size}
      text={text}
      muted={item.muted}
      disabled={item.disabled}
      className={chipClassName}
      accessibilityLabel={item.accessibilityLabel}
      onPress={() => onChange(item.id)}
    >
      {item.label}
    </SelectableChip>
  ));

  if (scroll) {
    return (
      <FadingHScroll contentClassName={`flex-row gap-[6px] ${className}`}>{chips}</FadingHScroll>
    );
  }

  return <View className={`flex-row flex-wrap gap-[6px] ${className}`}>{chips}</View>;
}
