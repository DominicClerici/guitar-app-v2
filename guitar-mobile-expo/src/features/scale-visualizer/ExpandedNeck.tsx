import { useKeepAwake } from 'expo-keep-awake';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { Position } from '@/lib/guitar-positions';
import type { JewelHue, Scale } from '@/lib/scale-library';
import { useToken } from '@/lib/tokens';

import { ScaleNeck } from './ScaleNeck';
import type { Cell } from './useScaleVisualizer';

interface Props {
  scale: Scale;
  cells: Map<number, Cell>;
  hue: JewelHue | null;
  position: Position | null;
  soundingKey: string | null;
  onPressNote: (string: number, fret: number) => void;
  onClose: () => void;
}

/**
 * The whole neck at once. The phone stays locked to portrait — the neck turns
 * instead — so this costs no orientation handling and leaves every other screen
 * alone. Turn the phone clockwise and it reads the right way up; flip the sign on
 * `-rotate-90` if that ever feels backwards.
 *
 * Rotated the long edge of the screen becomes the neck's width, which is enough
 * for all fifteen frets on most phones. The board keeps its scroller so a smaller
 * screen degrades to a short scroll rather than clipping the top of the neck.
 */
export function ExpandedNeck({
  scale,
  cells,
  hue,
  position,
  soundingKey,
  onPressNote,
  onClose,
}: Props) {
  // You will be holding a guitar rather than touching the screen.
  useKeepAwake();

  const { width, height } = useWindowDimensions();
  const muted = useToken('--ink-muted', '#9aa0aa');

  return (
    <View className="absolute inset-0 items-center justify-center bg-bg">
      {/* Swapped window dimensions are the one thing on this screen that cannot be
          a utility class — they are only known at runtime. */}
      <View className="-rotate-90 justify-center" style={{ width: height, height: width }}>
        <View className="flex-row items-center gap-[12px] px-[18px] pb-[16px]">
          <Text className="text-[15px] font-semibold tracking-[-0.3px] text-ink">
            {toAccidentalGlyphs(scale.root)} {scale.type.name}
          </Text>
          <Text className="flex-1 font-mono text-[9.5px] uppercase tracking-[1.4px] text-ink-faint">
            {position ? `${position.label} · frets ${position.from}–${position.to}` : 'All positions'}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close the full-screen neck"
            className="h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-line-soft bg-surface active:opacity-70"
          >
            <SymbolView name="xmark" size={13} weight="semibold" tintColor={muted} />
          </Pressable>
        </View>

        <ScaleNeck
          cells={cells}
          hue={hue}
          position={position}
          soundingKey={soundingKey}
          onPressNote={onPressNote}
        />
      </View>
    </View>
  );
}
