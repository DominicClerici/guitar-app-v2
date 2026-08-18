import { useMemo } from 'react';
import { View } from 'react-native';

import { SelectableChip } from '@/components/SelectableChip';
import { chromaticName, toAccidentalGlyphs, type AccidentalSide } from '@/lib/accidentals';
import type { RootName } from '@/lib/chord-library';

/**
 * Twelve pitches, one spelling each. The library carries both spellings of every
 * accidental and the rail on the chord-shapes screen offers both, because there
 * the spelling changes what the chord is called. A drone only sounds the pitch,
 * so a second chip for the same key is a second way to press the same button —
 * one side stands for the pair, and which side is the user's to say, because
 * nothing here is in a key that would decide it for them.
 *
 * Both sides of every pair are `RootName`s the library can spell, so the cast holds either way.
 */
function rootsOn(side: AccidentalSide): RootName[] {
  return Array.from({ length: 12 }, (_, pc) => chromaticName(pc, side) as RootName);
}

interface Props {
  root: RootName;
  side: AccidentalSide;
  onChange: (root: RootName) => void;
}

/**
 * The chromatic run as two rows of six rather than a rail that scrolls. Every
 * key is on screen at once and none of them moves, which is what a set this
 * small should be — you reach for A without finding it first.
 */
export function RootGrid({ root, side, onChange }: Props) {
  const rows = useMemo(() => {
    const roots = rootsOn(side);
    return [roots.slice(0, 6), roots.slice(6)];
  }, [side]);

  return (
    <View className="gap-[6px]">
      {rows.map((row, index) => (
        <View key={index} className="flex-row gap-[6px]">
          {row.map((name) => (
            <SelectableChip
              key={name}
              size="md"
              selected={name === root}
              accessibilityLabel={`Root ${name}`}
              className="flex-1"
              onPress={() => onChange(name)}
            >
              {toAccidentalGlyphs(name)}
            </SelectableChip>
          ))}
        </View>
      ))}
    </View>
  );
}
