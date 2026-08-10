import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { mixColors, splitAlpha } from '@/lib/color';
import { APPLE_SMOOTHING, squirclePath } from '@/lib/squircle';
import { useTokens } from '@/lib/tokens';

/**
 * How a surface's corners are drawn. `circular` is the ordinary `border-radius`
 * quarter circle; `continuous` is the squircle Apple draws, painted from the
 * same nominal radius so the two are directly comparable.
 */
export type CornerStyle = 'circular' | 'continuous';

/** Matching the 1px `border` every Aurora face uses. */
const HAIRLINE = 1;

/**
 * How far down the face the highlight takes to resolve into the side colour,
 * and the shadow to gather out of it. A quarter each leaves the middle half of
 * the edge flat, so the bevel still reads as lit above and shadowed below.
 */
const BEVEL_RAMP = 0.25;

/** Samples across one ramp — enough that the eased curve reads as a curve. */
const RAMP_STEPS = 6;

/** Fallbacks mirror `global.css`, for the moment before uniwind has resolved. */
const PALETTE = {
  '--surface': '#181a1f',
  '--surface-raised': '#20232a',
  '--tray': '#131418',
  '--accent-wash': 'rgba(94, 200, 194, 0.12)',
  '--accent-line': 'rgba(94, 200, 194, 0.5)',
  '--line-soft': '#23262d',
  '--edge-top': 'rgba(255, 255, 255, 0.06)',
  '--edge-bottom': 'rgba(0, 0, 0, 0.52)',
} as const;

type Token = keyof typeof PALETTE;

const TOKENS = Object.keys(PALETTE) as Token[];

interface FaceSpec {
  /** The face as utilities: one 1px border and a background. */
  circular: string;
  fill?: Token;
  /** A single-colour hairline. */
  stroke?: Token;
  /** Or a bevel, read top → sides → bottom down the edge. */
  bevel?: [Token, Token, Token];
}

/**
 * Every rounded face the app wears. Keeping them in one table is what lets a
 * surface be painted either way from a single declaration.
 */
const FACES = {
  /** A lifted card or chip: lit along the top, shadowed under the bottom. */
  card: {
    circular: 'border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface',
    fill: '--surface',
    bevel: ['--edge-top', '--line-soft', '--edge-bottom'],
  },
  /** The same bevel a step brighter — a key that sits on a tray rather than in it. */
  key: {
    circular: 'border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface-raised',
    fill: '--surface-raised',
    bevel: ['--edge-top', '--line-soft', '--edge-bottom'],
  },
  /** The lit half of a toggle: raised out of its housing, with no hairline of its own. */
  slab: {
    circular: 'bg-surface-raised',
    fill: '--surface-raised',
  },
  /** A recessed tray that other things sit in. */
  tray: {
    circular: 'border border-line-soft bg-tray',
    fill: '--tray',
    stroke: '--line-soft',
  },
  /** Chosen. */
  accent: {
    circular: 'border border-accent-line bg-accent-wash',
    fill: '--accent-wash',
    stroke: '--accent-line',
  },
  /** Present but not lifted — no bevel to catch the light. */
  quiet: {
    circular: 'border border-line-soft bg-surface',
    fill: '--surface',
    stroke: '--line-soft',
  },
  /** Nothing at all, for the unselected half of a toggle. */
  bare: {
    circular: '',
  },
} satisfies Record<string, FaceSpec>;

export type FaceName = keyof typeof FACES;

const CornerStyleContext = createContext<CornerStyle>('circular');

/** Screens that offer the choice wrap their tree in this; the rest stay circular. */
export function CornerStyleProvider({
  value,
  children,
}: {
  value: CornerStyle;
  children: ReactNode;
}) {
  return <CornerStyleContext.Provider value={value}>{children}</CornerStyleContext.Provider>;
}

export function useCornerStyle(): CornerStyle {
  return useContext(CornerStyleContext);
}

/**
 * The border and background of one surface, drawn whichever way the screen has
 * asked for. Put `className` on the box and render `paint` as its first child:
 *
 * ```tsx
 * const face = useFace('card', 13);
 * <View className={`rounded-[13px] px-[16px] ${face.className}`}>
 *   {face.paint}
 *   …
 * </View>
 * ```
 *
 * Under `continuous` the box's own border goes transparent — it is kept, rather
 * than dropped, so the box measures the same in both styles and the A/B compares
 * nothing but the corners.
 */
export function useFace(name: FaceName, radius: number): { className: string; paint: ReactNode } {
  const spec: FaceSpec = FACES[name];
  const style = useCornerStyle();

  if (style === 'circular' || !spec.fill) {
    return { className: spec.circular, paint: null };
  }

  // A face with a hairline has a border to stand in for, so it keeps a
  // transparent one and paints out over where it sat. A face without one has
  // nothing to reserve and stays flush with the padding edge.
  const hairline = Boolean(spec.bevel ?? spec.stroke);

  return {
    className: hairline ? 'border border-transparent' : '',
    paint: <SquircleFace radius={radius} spec={spec} hairline={hairline} />,
  };
}

interface Size {
  width: number;
  height: number;
}

interface GradientStop {
  offset: number;
  colour: string;
}

/**
 * Stops carrying one colour into another across a span of the gradient.
 *
 * Sampled rather than left as a single linear leg because two stops put a
 * corner in the ramp at each end — the colour arrives at full rate and stops
 * dead — and the eye reads those corners as the edge of a band. Smoothstep is
 * flat at both ends, so the highlight leaves the top edge and settles into the
 * side colour without a seam at either turn.
 */
function ramp(from: number, to: number, start: string, end: string): GradientStop[] {
  return Array.from({ length: RAMP_STEPS + 1 }, (_, index) => {
    const t = index / RAMP_STEPS;
    return {
      offset: Math.round((from + (to - from) * t) * 1e4) / 1e4,
      colour: mixColors(start, end, t * t * (3 - 2 * t)),
    };
  });
}

/**
 * The squircle itself, sized from its own layout so a surface keeps whatever
 * intrinsic width its content gives it. It sits one hairline outside the box's
 * padding edge, which is where the border it stands in for would have been.
 */
function SquircleFace({
  radius,
  spec,
  hairline,
}: {
  radius: number;
  spec: FaceSpec;
  hairline: boolean;
}) {
  const [size, setSize] = useState<Size | null>(null);
  const values = useTokens(TOKENS);
  const gradient = useId();

  const measure = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((current) =>
      current?.width === width && current?.height === height ? current : { width, height },
    );
  };

  const colour = (token: Token) => values[TOKENS.indexOf(token)] ?? PALETTE[token];

  // The lit top and the shadowed bottom each ease into the side colour, and the
  // flat middle is what the two ramps leave between them.
  const bevel = spec.bevel;
  const stops: GradientStop[] = bevel
    ? [
        ...ramp(0, BEVEL_RAMP, colour(bevel[0]), colour(bevel[1])),
        ...ramp(1 - BEVEL_RAMP, 1, colour(bevel[1]), colour(bevel[2])),
      ]
    : [];

  return (
    <View
      className={`pointer-events-none absolute ${hairline ? '-inset-px' : 'inset-0'}`}
      onLayout={measure}
      accessible={false}
    >
      {size ? (
        <Svg width={size.width} height={size.height}>
          {bevel ? (
            <Defs>
              <LinearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                {stops.map((entry) => {
                  // A stop takes its alpha from `stopOpacity` only —
                  // react-native-svg masks off whatever the colour carried — so
                  // a translucent one has to arrive split, or the edge paints
                  // as opaque white over black.
                  const { color, opacity } = splitAlpha(entry.colour);
                  return (
                    <Stop
                      key={entry.offset}
                      offset={entry.offset}
                      stopColor={color}
                      stopOpacity={opacity}
                    />
                  );
                })}
              </LinearGradient>
            </Defs>
          ) : null}

          {/* Background first, out to the box's true edge, then the hairline
              inset by half its width so it lands exactly where a border would. */}
          <Path
            d={squirclePath({ ...size, radius, smoothing: APPLE_SMOOTHING })}
            fill={spec.fill ? colour(spec.fill) : 'none'}
          />
          {hairline ? (
            <Path
              d={squirclePath({
                width: size.width - HAIRLINE,
                height: size.height - HAIRLINE,
                radius: radius - HAIRLINE / 2,
                smoothing: APPLE_SMOOTHING,
                x: HAIRLINE / 2,
                y: HAIRLINE / 2,
              })}
              fill="none"
              stroke={spec.bevel ? `url(#${gradient})` : colour(spec.stroke ?? '--line-soft')}
              strokeWidth={HAIRLINE}
            />
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}
