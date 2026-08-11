import { requireNativeView } from 'expo';
import { processColor, StyleSheet, type ColorValue } from 'react-native';

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
}

type NativeColor = ReturnType<typeof processColor>;

interface NativeProps {
  style: ReturnType<typeof StyleSheet.flatten>;
  squircleFillColor: NativeColor;
  squircleStrokeColor: NativeColor;
  squircleStrokeWidth: number;
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
}: SquircleShapeProps) {
  return (
    <NativeView
      style={StyleSheet.absoluteFill}
      squircleFillColor={processColor(fill)}
      squircleStrokeColor={processColor(stroke)}
      squircleStrokeWidth={strokeWidth}
      squircleSmoothing={smoothing}
      squircleRadiusTopLeft={radii.topLeft}
      squircleRadiusTopRight={radii.topRight}
      squircleRadiusBottomRight={radii.bottomRight}
      squircleRadiusBottomLeft={radii.bottomLeft}
    />
  );
}
