import { Pressable, Text, View } from 'react-native';

import { FadingHScroll } from '@/components/FadingHScroll';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { useTuning } from '@/lib/preferences';
import { DOUBLE_INLAY_FRET, SINGLE_INLAY_FRETS, STRING_GAUGE_CLASS } from '@/lib/theory';
import { soundingPitchClass } from '@/lib/tuning';

import { FRET_COUNT, STRING_COUNT } from './tuning';
import type { PlacedNote } from './useChordDetection';

// Board geometry. Tailwind classes have to be static strings, so the numbers live
// only in the classes below and have to move together:
//   open column w-[38px] · fretted column w-[50px] · string row h-[32px]
//   board w-[788px] (= 38 + 15 × 50) · scroll padding px-[18px]
// The scroll padding matches the home screen's page padding, so fret 0 sits on the
// page margin at rest.

const FRETS = Array.from({ length: FRET_COUNT + 1 }, (_, f) => f);
const STRINGS = Array.from({ length: STRING_COUNT }, (_, s) => s);

// The inlays and the string gauges come from `@/lib/theory/neck`, shared with the app's other
// boards; its arrays are indexed 0 = high e, the same way this one is. The dots past FRET_COUNT
// are simply never reached on a 15-fret neck.
const MARKED_FRETS = new Set([...SINGLE_INLAY_FRETS, DOUBLE_INLAY_FRET]);

const colClass = (fret: number) => (fret === 0 ? 'w-[38px]' : 'w-[50px]');

type Props = {
  placed: PlacedNote[];
  rootPitchClass: number | null;
  nameForPitchClass: (pc: number) => string;
  onToggle: (string: number, fret: number) => void;
  /** Colour token the board is sitting on, so its edge veils match. */
  veilToken?: string;
};

/**
 * Horizontally scrollable fretboard drawn as three stacked layers: inlays, then the
 * strings, then a tappable cell per position. Full-bleed — it runs to both screen
 * edges under a soft veil that lifts as you reach either end of the neck.
 */
export function Fretboard({
  placed,
  rootPitchClass,
  nameForPitchClass,
  onToggle,
  veilToken,
}: Props) {
  // Read here rather than taken as a prop: four screens mount this board, and none of them has any
  // other use for the tuning. The hook wakes it only when a string actually moves — the object is
  // the same one until then — so the 96 cells below cost what they always did.
  const tuning = useTuning();
  const placedKeys = new Set(placed.map((n) => `${n.string}-${n.fret}`));

  return (
    <FadingHScroll contentClassName="px-[18px] py-[8px]" veilToken={veilToken}>
      <View className="w-[788px]">
        {/* Neck. Inlays go in first so the strings and dots paint over them,
            and the block's height is exactly the six string rows — which is
            what the inlays' `top-1/2` centres on. */}
        <View>
          <InlayRow frets={SINGLE_INLAY_FRETS} offsetClass="-mt-[4px]" />
          <InlayRow frets={[DOUBLE_INLAY_FRET]} offsetClass="-mt-[36px]" />
          <InlayRow frets={[DOUBLE_INLAY_FRET]} offsetClass="mt-[28px]" />

          {STRINGS.map((string) => (
            <View key={string} className="h-[32px] flex-row">
              <View className="pointer-events-none absolute inset-0 justify-center">
                <View className={`${STRING_GAUGE_CLASS[string]} bg-ink-faint`} />
              </View>

              {FRETS.map((fret) => {
                const pc = soundingPitchClass(tuning, string, fret);
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
    </FadingHScroll>
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
function InlayRow({ frets, offsetClass }: { frets: readonly number[]; offsetClass: string }) {
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
