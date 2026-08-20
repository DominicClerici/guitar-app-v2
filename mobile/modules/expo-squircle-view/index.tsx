import { requireNativeView } from 'expo';
import type { ReactNode } from 'react';
import {
  processColor,
  StyleSheet,
  type ColorValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/**
 * The bare native squircle: a fill and a stroke on a shape layer, and nothing
 * else. It stretches over whatever it is put inside, so it is meant to be the
 * first child of the box it is the background of rather than a wrapper of its
 * own. `@/components/Squircle` is the version app code should reach for.
 *
 * Lengths are in points/dp and `smoothing` runs 0…1, matching `@/lib/squircle`.
 */
export interface SquircleCorners {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export interface SquircleShapeProps {
  radii: SquircleCorners;
  smoothing: number;
  fill?: ColorValue;
  /** Drawn inside the frame, the way a CSS border sits inside the box. */
  stroke?: ColorValue;
  strokeWidth?: number;
  /** Lengths of the drawn and undrawn runs, or nothing at all for a solid line. */
  strokeDash?: number[];
}

type NativeColor = ReturnType<typeof processColor>;

interface NativeProps {
  style: StyleProp<ViewStyle>;
  pointerEvents?: 'auto' | 'none';
  children?: ReactNode;
  squircleFillColor: NativeColor;
  squircleStrokeColor: NativeColor;
  squircleStrokeWidth: number;
  squircleStrokeDash: number[];
  squircleClip: boolean;
  squircleSmoothing: number;
  squircleRadiusTopLeft: number;
  squircleRadiusTopRight: number;
  squircleRadiusBottomRight: number;
  squircleRadiusBottomLeft: number;
}

const NativeView = requireNativeView<NativeProps>('ExpoSquircleView');

export function SquircleShape({
  radii,
  smoothing,
  fill = 'transparent',
  stroke = 'transparent',
  strokeWidth = 0,
  strokeDash = EMPTY,
}: SquircleShapeProps) {
  return (
    <NativeView
      style={StyleSheet.absoluteFill}
      // A background is not a target: a press belongs to whatever the shape is
      // drawn behind, and the shape has nothing of its own to hit.
      pointerEvents="none"
      squircleClip={false}
      {...paint({ radii, smoothing, fill, stroke, strokeWidth, strokeDash })}
    />
  );
}

export interface SquircleBoxProps extends SquircleShapeProps {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * The same shape as a container: children lay out inside it and are masked to
 * the corner, and the hairline is drawn over them rather than under.
 *
 * This is the one to reach for where `overflow: hidden` and a `border-radius`
 * would otherwise be — a scroller, an image, a row of ticks that runs to the
 * edge. It costs an offscreen layer per box on Android, so it is not the
 * default: a surface that only needs a background wants `SquircleShape`.
 */
export function SquircleBox({
  radii,
  smoothing,
  fill = 'transparent',
  stroke = 'transparent',
  strokeWidth = 0,
  strokeDash = EMPTY,
  style,
  children,
}: SquircleBoxProps) {
  return (
    <NativeView
      style={style}
      squircleClip
      {...paint({ radii, smoothing, fill, stroke, strokeWidth, strokeDash })}
    >
      {children}
    </NativeView>
  );
}

/** Stable, so a solid-stroked shape does not re-render on a new array every time. */
const EMPTY: number[] = [];

function paint({
  radii,
  smoothing,
  fill,
  stroke,
  strokeWidth,
  strokeDash,
}: Required<SquircleShapeProps>) {
  return {
    squircleFillColor: processColor(fill),
    squircleStrokeColor: processColor(stroke),
    squircleStrokeWidth: strokeWidth,
    squircleStrokeDash: strokeDash,
    squircleSmoothing: smoothing,
    squircleRadiusTopLeft: radii.topLeft,
    squircleRadiusTopRight: radii.topRight,
    squircleRadiusBottomRight: radii.bottomRight,
    squircleRadiusBottomLeft: radii.bottomLeft,
  };
}
