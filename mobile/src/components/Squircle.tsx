import type { ReactNode } from 'react';
import {
  Pressable,
  View,
  type ColorValue,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { withUniwind } from 'uniwind';

import { SquircleBox, SquircleShape, type SquircleCorners } from '@modules/expo-squircle-view';

import { APPLE_SMOOTHING } from '@/lib/squircle';

/**
 * The two ways app code puts a squircle on the screen: as the face of a control
 * you press, and as the face of a box you do not.
 *
 * Both paint on a native layer sized to the view, so — unlike an SVG, which has
 * to measure itself in JavaScript before it can draw — they are right on the
 * first frame and stay right through a resize. Everything else composes as
 * normal: layout, padding and press feedback stay on the element as utilities,
 * and only the fill and the border move to props, since a native layer takes
 * colours rather than classes.
 *
 * Where a surface wears one of the app's named faces — a card, a tray, a
 * chosen chip — reach for `Face` instead; these two are for the colours that
 * table does not have a name for.
 *
 * One radius per corner is allowed, which a `rounded-full` cannot be talked
 * into: a squircle corner reaches back along its edge, so each has to be drawn
 * knowing its own. Anything past half the shorter side is clamped, which is how
 * a corner asks to be a semicircle.
 */
interface Paint {
  /** One number for all four corners, or the corners that differ. */
  radius: number | Partial<SquircleCorners>;
  /** How much of each corner is given over to easing curvature in and out. */
  smoothing?: number;
  fill?: ColorValue;
  stroke?: ColorValue;
  strokeWidth?: number;
}

/**
 * ```tsx
 * const accent = useToken('--accent', '#5ec8c2');
 *
 * <SquirclePressable
 *   onPress={onPress}
 *   radius={10}
 *   fill={accent}
 *   className="h-[50px] flex-row items-center justify-center active:opacity-80"
 * >
 *   <Text className="text-on-accent">Continue</Text>
 * </SquirclePressable>
 * ```
 */
export interface Props extends Omit<PressableProps, 'style' | 'children'>, Paint {
  children?: PressableProps['children'];
}

export function SquirclePressable({
  radius,
  smoothing = APPLE_SMOOTHING,
  fill,
  stroke,
  strokeWidth,
  children,
  ...pressable
}: Props) {
  return (
    <Pressable {...pressable}>
      {(state) => (
        <>
          <SquircleShape
            radii={corners(radius)}
            smoothing={smoothing}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          {typeof children === 'function' ? children(state) : children}
        </>
      )}
    </Pressable>
  );
}

export interface ViewProps extends Paint {
  /**
   * Masks children to the corner — what `overflow-hidden` used to do, for a
   * scroller or an image that runs to the edge. Off by default: it costs an
   * offscreen layer, and a surface that only needs a background does not.
   */
  clip?: boolean;
  /** Layout only — the fill and the hairline come from the paint props. */
  className?: string;
  /** For the one or two lengths that have to be computed rather than written. */
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const ClippingBox = withUniwind(SquircleBox);

/**
 * ```tsx
 * <SquircleView radius={13} fill={tray} clip className="h-[64px] flex-row">
 *   {ticks}
 * </SquircleView>
 * ```
 */
export function SquircleView({
  radius,
  smoothing = APPLE_SMOOTHING,
  fill,
  stroke,
  strokeWidth,
  clip = false,
  className,
  style,
  children,
}: ViewProps) {
  const shape = { radii: corners(radius), smoothing, fill, stroke, strokeWidth };

  if (clip) {
    return (
      <ClippingBox className={className} style={style} {...shape}>
        {children}
      </ClippingBox>
    );
  }

  return (
    <View className={className} style={style}>
      <SquircleShape {...shape} />
      {children}
    </View>
  );
}

export function corners(radius: number | Partial<SquircleCorners>): SquircleCorners {
  if (typeof radius === 'number') {
    return { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius };
  }

  return {
    topLeft: radius.topLeft ?? 0,
    topRight: radius.topRight ?? 0,
    bottomRight: radius.bottomRight ?? 0,
    bottomLeft: radius.bottomLeft ?? 0,
  };
}
