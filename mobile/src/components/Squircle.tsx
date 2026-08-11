import { Pressable, type ColorValue, type PressableProps } from 'react-native';

import { SquircleShape, type SquircleCorners } from '@modules/expo-squircle-view';

import { APPLE_SMOOTHING } from '@/lib/squircle';

/**
 * A pressable whose background is a squircle rather than a `border-radius`.
 *
 * The shape is painted by a native layer sized to the button, so — unlike
 * `CornerFace`, which has to measure itself in JavaScript before it can draw —
 * it is right on the first frame and stays right through a resize. That is the
 * whole reason to reach for it: on anything that appears, animates, or reflows,
 * the SVG face blinks and this does not.
 *
 * Everything else composes as normal. Layout, padding and press feedback stay on
 * the Pressable as utilities; only the fill and the border move to props, since
 * a native layer takes colours rather than classes — resolve them from tokens at
 * the call site with `useToken`, the way a `tintColor` already is.
 *
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
 *
 * One radius per corner is allowed, which a `rounded-full` cannot be talked into:
 * a squircle corner reaches back along its edge, so each has to be drawn knowing
 * its own. Anything past half the shorter side is clamped, which is how a corner
 * asks to be a semicircle.
 */
export interface Props extends Omit<PressableProps, 'style' | 'children'> {
  /** One number for all four corners, or the corners that differ. */
  radius: number | Partial<SquircleCorners>;
  /** How much of each corner is given over to easing curvature in and out. */
  smoothing?: number;
  fill?: ColorValue;
  stroke?: ColorValue;
  strokeWidth?: number;
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
  const radii = corners(radius);

  return (
    <Pressable {...pressable}>
      {(state) => (
        <>
          <SquircleShape
            radii={radii}
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

function corners(radius: number | Partial<SquircleCorners>): SquircleCorners {
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
