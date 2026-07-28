import { useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AnimatedView } from '@/components/AnimatedView';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { useToken } from '@/lib/tokens';

import { FRET_COUNT, STRING_COUNT, pitchClassAt } from './tuning';
import type { PlacedNote } from './useChordDetection';

// Board geometry. Tailwind classes have to be static strings, so these numbers are
// also written literally in the classes below and the two must move together:
//   open column w-[38px] · fretted column w-[50px] · string row h-[32px]
//   board w-[788px] (= 38 + 15 × 50) · scroll padding px-[18px] · veil w-[30px]
// The scroll padding matches the home screen's page padding, so fret 0 sits on the
// page margin at rest. Only the widths are needed as numbers, to know how far the
// board can scroll.
const OPEN_W = 38;
const FRET_W = 50;
const SCROLL_PAD = 18;
const BOARD_W = OPEN_W + FRET_COUNT * FRET_W;
const CONTENT_W = BOARD_W + SCROLL_PAD * 2;

const FADE_TRAVEL = 40; // scroll distance over which a veil fades in

const FRETS = Array.from({ length: FRET_COUNT + 1 }, (_, f) => f);
const STRINGS = Array.from({ length: STRING_COUNT }, (_, s) => s);

const SINGLE_INLAYS = [3, 5, 7, 9, 15];
const DOUBLE_INLAY = 12;
const MARKED_FRETS = new Set([...SINGLE_INLAYS, DOUBLE_INLAY]);

// Wound strings are visibly thicker than the plain trebles; string 0 is the high e.
const STRING_CLASS = [
  'h-px',
  'h-px',
  'h-[1.25px]',
  'h-[1.5px]',
  'h-[1.75px]',
  'h-[2px]',
] as const;

const colClass = (fret: number) => (fret === 0 ? 'w-[38px]' : 'w-[50px]');

type Props = {
  placed: PlacedNote[];
  rootPitchClass: number | null;
  nameForPitchClass: (pc: number) => string;
  onToggle: (string: number, fret: number) => void;
};

/**
 * Horizontally scrollable fretboard drawn as three stacked layers: inlays, then the
 * strings, then a tappable cell per position. Full-bleed — it runs to both screen
 * edges under a soft veil that lifts as you reach either end of the neck.
 */
export function Fretboard({ placed, rootPitchClass, nameForPitchClass, onToggle }: Props) {
  const [containerW, setContainerW] = useState(0);
  const scrollX = useSharedValue(0);

  const maxScroll = Math.max(0, CONTENT_W - containerW);
  const placedKeys = new Set(placed.map((n) => `${n.string}-${n.fret}`));

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const leftFade = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, [0, FADE_TRAVEL], [0, 1], Extrapolation.CLAMP),
  }));

  const rightFade = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [maxScroll - FADE_TRAVEL, maxScroll],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View onLayout={(e: LayoutChangeEvent) => setContainerW(e.nativeEvent.layout.width)}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
      >
        <View className="px-[18px] py-[8px]">
          <View className="w-[788px]">
            {/* Neck. Inlays go in first so the strings and dots paint over them,
                and the block's height is exactly the six string rows — which is
                what the inlays' `top-1/2` centres on. */}
            <View>
              <InlayRow frets={SINGLE_INLAYS} offsetClass="-mt-[4px]" />
              <InlayRow frets={[DOUBLE_INLAY]} offsetClass="-mt-[36px]" />
              <InlayRow frets={[DOUBLE_INLAY]} offsetClass="mt-[28px]" />

              {STRINGS.map((string) => (
                <View key={string} className="h-[32px] flex-row">
                  <View className="pointer-events-none absolute inset-0 justify-center">
                    <View className={`${STRING_CLASS[string]} bg-ink-faint`} />
                  </View>

                  {FRETS.map((fret) => {
                    const pc = pitchClassAt(string, fret);
                    return (
                      <Cell
                        key={fret}
                        fret={fret}
                        label={toAccidentalGlyphs(nameForPitchClass(pc))}
                        isPlaced={placedKeys.has(`${string}-${fret}`)}
                        isRoot={rootPitchClass !== null && pc === rootPitchClass}
                        onPress={() => onToggle(string, fret)}
                      />
                    );
                  })}
                </View>
              ))}
            </View>

            <View className="mt-[7px] flex-row">
              {FRETS.map((fret) => (
                <View key={fret} className={`${colClass(fret)} items-center`}>
                  <Text
                    className={`font-mono text-[9px] tracking-[0.5px] ${
                      MARKED_FRETS.has(fret) ? 'text-ink-muted' : 'text-ink-faint'
                    }`}
                  >
                    {fret}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      <AnimatedView
        className="pointer-events-none absolute bottom-0 left-0 top-0 w-[30px]"
        style={leftFade}
      >
        <EdgeVeil side="left" />
      </AnimatedView>
      <AnimatedView
        className="pointer-events-none absolute bottom-0 right-0 top-0 w-[30px]"
        style={rightFade}
      >
        <EdgeVeil side="right" />
      </AnimatedView>
    </View>
  );
}

type CellProps = {
  fret: number;
  label: string;
  isPlaced: boolean;
  isRoot: boolean;
  onPress: () => void;
};

/**
 * One position on the neck. Every cell is tappable; an empty one shows nothing until
 * touched. The cell's right border doubles as the fret wire — thick and pale at fret 0,
 * where it is the nut.
 */
function Cell({ fret, label, isPlaced, isRoot, onPress }: CellProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`${colClass(fret)} h-full items-center justify-center ${
        fret === 0 ? 'border-r-[3px] border-r-ink-muted' : 'border-r border-r-line-soft'
      }`}
    >
      {({ pressed }) =>
        isPlaced ? (
          <View className={`items-center justify-center ${pressed ? 'scale-110' : ''}`}>
            {/* The root reads as lit: a filled disc sitting in its own aura. */}
            {isRoot ? (
              <View className="absolute h-[30px] w-[30px] rounded-full bg-accent-wash" />
            ) : null}
            <View
              className={`h-[24px] w-[24px] items-center justify-center rounded-full ${
                isRoot ? 'bg-accent' : 'border border-accent-line bg-surface-raised'
              }`}
            >
              <Text
                className={`text-[10.5px] font-bold ${isRoot ? 'text-on-accent' : 'text-accent'}`}
              >
                {label}
              </Text>
            </View>
          </View>
        ) : (
          <View className={pressed ? 'h-[9px] w-[9px] rounded-full bg-line' : undefined} />
        )
      }
    </Pressable>
  );
}

/** Inlay dots, laid out on the same column grid so they centre in their fret. */
function InlayRow({ frets, offsetClass }: { frets: number[]; offsetClass: string }) {
  return (
    <View className={`pointer-events-none absolute inset-x-0 top-1/2 flex-row ${offsetClass}`}>
      {FRETS.map((fret) => (
        <View key={fret} className={`${colClass(fret)} items-center`}>
          {frets.includes(fret) ? <View className="h-[8px] w-[8px] rounded-full bg-line" /> : null}
        </View>
      ))}
    </View>
  );
}

/** Background-to-transparent veil marking that the neck continues past the screen edge. */
function EdgeVeil({ side }: { side: 'left' | 'right' }) {
  const bg = useToken('--bg', '#0c0d10');
  const [from, to] = side === 'left' ? ['1', '0'] : ['0', '1'];

  return (
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id={`veil-${side}`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={bg} stopOpacity={from} />
          <Stop offset="1" stopColor={bg} stopOpacity={to} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#veil-${side})`} />
    </Svg>
  );
}
