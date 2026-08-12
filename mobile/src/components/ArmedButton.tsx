import { SymbolView } from 'expo-symbols';
import {
  useImperativeHandle,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
} from 'react';
import { Text } from 'react-native';

import type { SquircleCorners } from '@modules/expo-squircle-view';

import { MONO, SIZES, useFacePaint, type FaceSpec, type Size } from './buttonFace';
import { SquirclePressable } from './Squircle';

/**
 * A destructive action that asks once before it happens.
 *
 * The first press arms it: the label becomes `armedLabel` and the face fills
 * with rose, so the button that is now one tap from doing something you cannot
 * undo does not look like the button you just pressed. The second press
 * confirms. There is no variant — a control that asks twice is always the same
 * kind of control — only the size scale every other button uses.
 *
 * ```tsx
 * <ArmedButton
 *   size="lg"
 *   icon="trash"
 *   armedIcon="exclamationmark.triangle.fill"
 *   label="Drop Pathway"
 *   armedLabel="Tap again to drop"
 *   onConfirm={drop}
 * />
 * ```
 *
 * The armed state is held here rather than by the caller, since nothing outside
 * needs to know a button has been pressed once. What a caller does sometimes
 * need is to take it back — a sheet closing, a row scrolling away — which is
 * what `disarm` on the ref is for.
 */

type SymbolName = ComponentProps<typeof SymbolView>['name'];

export interface ArmedButtonRef {
  /** Put it back to rest without confirming. */
  disarm: () => void;
}

/** Waiting for the second press: filled rose, and the ink goes to the page colour. */
const ARMED: FaceSpec = {
  fill: '--rose',
  stroke: 'transparent',
  text: 'text-bg',
  tint: '--bg',
  press: 'active:opacity-80',
};

/** At rest it is the raised key with rose ink, as every destructive button is. */
const RESTING: FaceSpec = {
  fill: '--surface-raised',
  stroke: '--line-soft',
  text: 'text-rose',
  tint: '--rose',
  press: 'active:opacity-70',
};

interface Props {
  ref?: Ref<ArmedButtonRef>;
  size?: Size;
  text?: 'plain' | 'mono';
  /** What it does, at rest. A string takes the size's label typography. */
  label: ReactNode;
  /** What it is about to do, armed. */
  armedLabel: ReactNode;
  icon?: SymbolName;
  /** The icon while armed, if the warning wants a different glyph. */
  armedIcon?: SymbolName;
  radius?: number | Partial<SquircleCorners>;
  align?: 'center' | 'start';
  hitSlop?: number;
  /** Layout only — width, flex, margins. */
  className?: string;
  /** Fired by the first press, for a caller that has to react to the asking. */
  onArm?: () => void;
  /** Fired by the second. */
  onConfirm: () => void;
}

export function ArmedButton({
  ref,
  size = 'lg',
  text = 'plain',
  label,
  armedLabel,
  icon,
  armedIcon,
  radius,
  align = 'center',
  hitSlop,
  className = '',
  onArm,
  onConfirm,
}: Props) {
  const [armed, setArmed] = useState(false);
  const paint = useFacePaint();

  useImperativeHandle(ref, () => ({ disarm: () => setArmed(false) }), []);

  const spec = armed ? ARMED : RESTING;
  const metrics = SIZES[size];
  const showing = armed ? armedLabel : label;
  const glyph = armed ? (armedIcon ?? icon) : icon;

  const press = () => {
    if (!armed) {
      setArmed(true);
      onArm?.();
      return;
    }
    onConfirm();
  };

  return (
    <SquirclePressable
      onPress={press}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={typeof showing === 'string' ? showing : undefined}
      // Announced rather than left to the label: a button that changed under
      // you is the whole mechanism, and it has to survive not being looked at.
      accessibilityHint={armed ? undefined : 'Asks once more before it happens'}
      radius={radius ?? metrics.radius}
      fill={paint(spec.fill)}
      stroke={paint(spec.stroke)}
      strokeWidth={1}
      className={`flex-row items-center ${align === 'start' ? 'justify-start' : 'justify-center'} ${
        metrics.box
      } ${spec.press} ${className}`}
    >
      {glyph ? (
        <SymbolView
          name={glyph}
          size={metrics.icon}
          weight="semibold"
          tintColor={paint(spec.tint)}
        />
      ) : null}

      {typeof showing === 'string' ? (
        <Text className={`${text === 'mono' ? MONO : metrics.label} ${spec.text}`}>{showing}</Text>
      ) : (
        showing
      )}
    </SquirclePressable>
  );
}
