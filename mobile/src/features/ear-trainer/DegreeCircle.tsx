import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useFacePaint, type FaceSpec } from '@/components/buttonFace';
import { SquirclePressable } from '@/components/Squircle';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { degreeLabel, FIFTHS_ORDER } from '@/lib/ear-training';

/** Key diameter as a share of the circle's width. Twelve of these fit the ring. */
const KEY_SHARE = 0.16;

/** How a degree is marked during a verdict. */
export type DegreeMark = 'correct' | 'wrong';

interface Props {
  /** Width and height of the circle, in points. */
  size: number;
  /** Degrees currently in play, as semitones above the tonic. */
  activeDegrees: readonly number[];
  /** Fade the degrees outside the active set — training, and the picker. */
  dimInactive: boolean;
  /** Light the active set as chosen — the picker's reading of the same circle. */
  emphasizeActive?: boolean;
  /** Refuse taps outside the active set — a question wants an answer, not a stray. */
  lockInactive?: boolean;
  /** Degree currently sounding from an audition tap. */
  sounding?: number | null;
  /** Verdict colours, keyed by degree. */
  marks?: Partial<Record<number, DegreeMark>>;
  onPress: (degree: number) => void;
  /** Whatever belongs in the middle — the replay key, usually. */
  children?: ReactNode;
}

/**
 * The trainer's one surface: all twelve degrees on a ring, ordered in fifths so
 * degrees that feel alike sit near each other and the two that feel least alike
 * face each other across the middle. The same circle answers questions, plays
 * as an instrument, and shows verdicts — which is the point: the map you answer
 * on is the map you explore on.
 */
export function DegreeCircle({
  size,
  activeDegrees,
  dimInactive,
  emphasizeActive = false,
  lockInactive = false,
  sounding = null,
  marks,
  onPress,
  children,
}: Props) {
  const key = Math.round(size * KEY_SHARE);
  const radius = (size - key) / 2;

  return (
    <View style={{ width: size, height: size }}>
      {FIFTHS_ORDER.map((degree, index) => {
        // Clockwise from 12 o'clock, one seat per half hour.
        const angle = (index / 12) * 2 * Math.PI - Math.PI / 2;
        const left = size / 2 + radius * Math.cos(angle) - key / 2;
        const top = size / 2 + radius * Math.sin(angle) - key / 2;
        const active = activeDegrees.includes(degree);

        return (
          <View key={degree} className="absolute" style={{ left, top, width: key, height: key }}>
            <DegreeKey
              degree={degree}
              diameter={key}
              active={active}
              dim={dimInactive && !active}
              emphasize={emphasizeActive && active}
              locked={lockInactive && !active}
              sounding={sounding === degree}
              mark={marks?.[degree]}
              onPress={onPress}
            />
          </View>
        );
      })}

      <View className="absolute inset-0 items-center justify-center" pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

/**
 * A key's four readings, in the order they win: lit — sounding, correct, or
 * chosen in the picker — then wrong, then out of play, then simply a key.
 */
const FACES = {
  lit: {
    fill: '--accent-wash',
    stroke: '--accent-line',
    text: 'text-accent',
    tint: '--accent',
    press: 'active:opacity-70',
  },
  wrong: {
    fill: '--rose-wash',
    stroke: '--rose',
    text: 'text-rose',
    tint: '--rose',
    press: 'active:opacity-70',
  },
  dim: {
    fill: '--surface',
    stroke: '--line-soft',
    text: 'text-ink-faint',
    tint: '--ink-faint',
    press: 'active:opacity-70',
  },
  key: {
    fill: '--surface-raised',
    stroke: '--line-soft',
    text: 'text-ink',
    tint: '--ink',
    press: 'active:opacity-70',
  },
} satisfies Record<string, FaceSpec>;

function DegreeKey({
  degree,
  diameter,
  active,
  dim,
  emphasize,
  locked,
  sounding,
  mark,
  onPress,
}: {
  degree: number;
  diameter: number;
  active: boolean;
  dim: boolean;
  emphasize: boolean;
  locked: boolean;
  sounding: boolean;
  mark: DegreeMark | undefined;
  onPress: (degree: number) => void;
}) {
  const label = toAccidentalGlyphs(degreeLabel(degree));
  const paint = useFacePaint();

  const lit = mark === 'correct' || sounding || emphasize;
  const spec = lit ? FACES.lit : mark === 'wrong' ? FACES.wrong : dim ? FACES.dim : FACES.key;

  return (
    <SquirclePressable
      onPress={() => onPress(degree)}
      disabled={locked}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked, selected: active }}
      accessibilityLabel={`Degree ${degreeLabel(degree)}`}
      // Half the key is a circle, so the face follows the ring however the
      // screen sizes it.
      radius={diameter / 2}
      fill={paint(spec.fill)}
      stroke={paint(spec.stroke)}
      strokeWidth={1}
      className="h-full w-full items-center justify-center active:opacity-70"
    >
      {sounding ? (
        <View className="pointer-events-none absolute -inset-[7px] rounded-full bg-accent-wash" />
      ) : null}
      <Text className={`font-mono text-[14px] font-semibold tracking-[0.3px] ${spec.text}`}>
        {label}
      </Text>
    </SquirclePressable>
  );
}
