import { useId, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { mixColors, splitAlpha } from '@/lib/color';
import { APPLE_SMOOTHING, squirclePath } from '@/lib/squircle';
import { useTokens } from '@/lib/tokens';

/** Matching the 1px hairline every Aurora face wears. */
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
  /** The background, or nothing at all for a face that paints only when chosen. */
  fill?: Token;
  /** A single-colour hairline. */
  stroke?: Token;
  /** Or a bevel, read top → sides → bottom down the edge. */
  bevel?: [Token, Token, Token];
}

/**
 * Every rounded face the app wears, as the colours it is made of. Keeping them
 * in one table is what stops a card on one screen drifting from a card on
 * another — a surface names the face it wants rather than restating it.
 */
const FACES = {
  /** A lifted card or chip: lit along the top, shadowed under the bottom. */
  card: {
    fill: '--surface',
    bevel: ['--edge-top', '--line-soft', '--edge-bottom'],
  },
  /** The same bevel a step brighter — a key that sits on a tray rather than in it. */
  key: {
    fill: '--surface-raised',
    bevel: ['--edge-top', '--line-soft', '--edge-bottom'],
  },
  /** The lit half of a toggle: raised out of its housing, with no hairline of its own. */
  slab: {
    fill: '--surface-raised',
  },
  /** A recessed tray that other things sit in. */
  tray: {
    fill: '--tray',
    stroke: '--line-soft',
  },
  /** Chosen. */
  accent: {
    fill: '--accent-wash',
    stroke: '--accent-line',
  },
  /** Present but not lifted — no bevel to catch the light. */
  quiet: {
    fill: '--surface',
    stroke: '--line-soft',
  },
  /** Nothing at all, for the unselected half of a toggle. */
  bare: {},
} satisfies Record<string, FaceSpec>;

export type FaceName = keyof typeof FACES;

interface Size {
  width: number;
  height: number;
}

interface GradientStop {
  offset: number;
  colour: string;
}

/**
 * The background and hairline of one surface, drawn as Apple's continuous
 * corner rather than a `border-radius` quarter circle. Render it as the first
 * child of the box it is the face of, and leave the box itself unpainted:
 *
 * ```tsx
 * <View className="px-[16px]">
 *   <Face name="card" radius={13} />
 *   …
 * </View>
 * ```
 *
 * The shape is sized from its own layout, so a surface keeps whatever intrinsic
 * width its content gives it — which also means it draws one frame late. On
 * anything that appears, animates or reflows, reach for `SquirclePressable`
 * instead: its native layer is right on the first frame, at the cost of the
 * bevel, since a shape layer strokes one colour.
 */
export function Face({ name, radius }: { name: FaceName; radius: number }) {
  const [size, setSize] = useState<Size | null>(null);
  const values = useTokens(TOKENS);
  const gradient = useId();

  const spec: FaceSpec = FACES[name];
  const hairline = Boolean(spec.bevel ?? spec.stroke);

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

  // A `bare` face still measures, so the box it sits in can be given a real one
  // — the selected half of a toggle — without waiting a frame to draw it.
  return (
    <View className="pointer-events-none absolute inset-0" onLayout={measure} accessible={false}>
      {size && spec.fill ? (
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

          {/* Background first, out to the box's own edge, then the hairline
              inset by half its width so it lands just inside it, the way a CSS
              border sits inside the box. */}
          <Path
            d={squirclePath({ ...size, radius, smoothing: APPLE_SMOOTHING })}
            fill={colour(spec.fill)}
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
              stroke={bevel ? `url(#${gradient})` : colour(spec.stroke ?? '--line-soft')}
              strokeWidth={HAIRLINE}
            />
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
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
