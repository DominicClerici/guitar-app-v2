import { Pressable, Text, View } from 'react-native';

import { FadingHScroll } from '@/components/FadingHScroll';
import type { Position } from '@/lib/guitar-positions';
import { positionKey } from '@/lib/guitar-positions';
import type { JewelHue } from '@/lib/scale-library';
import { FRET_COUNT, pitchClassAt, STRING_COUNT } from '@/lib/theory';

import { ScaleDot } from './ScaleDot';
import type { Cell } from './useScaleVisualizer';

// Board geometry, the same neck the chord detector draws. Tailwind classes have to
// be static strings, so the numbers live in the classes below AND in the fret-x
// maths at the bottom of this file — they have to move together:
//   open column w-[38px] · fretted column w-[50px] · string row h-[32px]
//   board w-[788px] (= 38 + 15 × 50) · scroll padding px-[18px]

const OPEN_WIDTH = 38;
const FRET_WIDTH = 50;
const PAD = 18;

const FRETS = Array.from({ length: FRET_COUNT + 1 }, (_, fret) => fret);
const STRINGS = Array.from({ length: STRING_COUNT }, (_, string) => string);

const SINGLE_INLAYS = [3, 5, 7, 9, 15];
const DOUBLE_INLAY = 12;
const MARKED_FRETS = new Set([...SINGLE_INLAYS, DOUBLE_INLAY]);

// Wound strings are visibly thicker than the plain trebles; string 0 is the high e.
const STRING_CLASS = ['h-px', 'h-px', 'h-[1.25px]', 'h-[1.5px]', 'h-[1.75px]', 'h-[2px]'] as const;

const colClass = (fret: number) => (fret === 0 ? 'w-[38px]' : 'w-[50px]');

const fretLeft = (fret: number) => PAD + (fret === 0 ? 0 : OPEN_WIDTH + (fret - 1) * FRET_WIDTH);
const fretRight = (fret: number) => fretLeft(fret) + (fret === 0 ? OPEN_WIDTH : FRET_WIDTH);

interface Props {
  /** One entry per pitch class in the scale — what the dot says and how it reads. */
  cells: Map<number, Cell>;
  hue: JewelHue | null;
  /** The box on show, or null for the whole neck. */
  position: Position | null;
  soundingKey: string | null;
  onPressNote: (string: number, fret: number) => void;
  /** Colour token the board is sitting on, so its edge veils match. */
  veilToken?: string;
}

/**
 * The scale on the neck: every tone of it, everywhere it falls, drawn as three
 * stacked layers — inlays, then the strings, then a cell per position. Full-bleed
 * and horizontally scrollable, and when a box is showing it scrolls itself to it.
 */
export function ScaleNeck({ cells, hue, position, soundingKey, onPressNote, veilToken }: Props) {
  const centerOnX = position ? (fretLeft(position.from) + fretRight(position.to)) / 2 : null;

  return (
    <FadingHScroll
      contentClassName="px-[18px] py-[8px]"
      veilToken={veilToken}
      centerOnX={centerOnX}
    >
      <View className="w-[788px]">
        {/* Inlays go in first so the strings and dots paint over them, and the
            block's height is exactly the six string rows — which is what the
            inlays' `top-1/2` centres on. */}
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
                const key = positionKey(string, fret);
                const cell = cells.get(pitchClassAt(string, fret));

                return (
                  <NeckCell
                    key={fret}
                    fret={fret}
                    cell={cell}
                    hue={hue}
                    inPosition={!position || position.keys.has(key)}
                    sounding={soundingKey === key}
                    onPress={cell ? () => onPressNote(string, fret) : undefined}
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
    </FadingHScroll>
  );
}

interface CellProps {
  fret: number;
  cell: Cell | undefined;
  hue: JewelHue | null;
  inPosition: boolean;
  sounding: boolean;
  onPress?: () => void;
}

/**
 * One position on the neck. The cell's right border doubles as the fret wire —
 * thick and pale at fret 0, where it is the nut.
 *
 * A position the scale doesn't use isn't pressable at all: the map shouldn't
 * offer you a note it doesn't mean, and an inert cell says that by not responding.
 */
function NeckCell({ fret, cell, hue, inPosition, sounding, onPress }: CellProps) {
  const frame = `${colClass(fret)} h-full items-center justify-center ${
    fret === 0 ? 'border-r-[3px] border-r-ink-muted' : 'border-r border-r-line-soft'
  }`;

  if (!cell || !onPress) return <View className={frame} />;

  return (
    <Pressable onPress={onPress} className={frame}>
      {({ pressed }) => (
        <ScaleDot
          cell={cell}
          hue={hue}
          inPosition={inPosition}
          sounding={sounding}
          pressed={pressed}
        />
      )}
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
