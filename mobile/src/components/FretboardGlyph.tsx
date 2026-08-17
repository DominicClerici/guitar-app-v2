import Svg, { Circle, Line } from 'react-native-svg';

interface Props {
  /** Width in points. The glyph is three quarters as tall as it is wide. */
  size?: number;
  color: string;
}

/**
 * A neck drawn the way the app's own board draws one — nut at the left, strings
 * running across it, one note stopped. SF Symbols has a guitar but no fretboard,
 * and the control this sits on is about the board rather than the instrument.
 */
export function FretboardGlyph({ size = 22, color }: Props) {
  return (
    <Svg width={size} height={(size * 18) / 24} viewBox="0 0 24 18">
      <Line
        x1={2.6}
        y1={1.6}
        x2={2.6}
        y2={16.4}
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
      />

      {[9, 15.5, 22].map((x) => (
        <Line
          key={x}
          x1={x}
          y1={2.6}
          x2={x}
          y2={15.4}
          stroke={color}
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.5}
        />
      ))}

      {[4.5, 9, 13.5].map((y) => (
        <Line
          key={y}
          x1={2.6}
          y1={y}
          x2={22}
          y2={y}
          stroke={color}
          strokeWidth={1.1}
          strokeLinecap="round"
          opacity={0.8}
        />
      ))}

      <Circle cx={12.2} cy={9} r={2.7} fill={color} />
    </Svg>
  );
}
