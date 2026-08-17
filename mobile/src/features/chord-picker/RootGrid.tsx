import { View } from 'react-native';

import { SelectableChip } from '@/components/SelectableChip';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { RootName } from '@/lib/chord-library';

/**
 * Twelve pitches, one spelling each. The library carries both spellings of every
 * accidental and the rail on the chord-shapes screen offers both, because there
 * the spelling changes what the chord is called. A drone only sounds the pitch,
 * so a second chip for the same key is a second way to press the same button —
 * sharps stand for the pair.
 */
const ROOTS: readonly RootName[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

const ROWS = [ROOTS.slice(0, 6), ROOTS.slice(6)];

interface Props {
  root: RootName;
  onChange: (root: RootName) => void;
}

/**
 * The chromatic run as two rows of six rather than a rail that scrolls. Every
 * key is on screen at once and none of them moves, which is what a set this
 * small should be — you reach for A without finding it first.
 */
export function RootGrid({ root, onChange }: Props) {
  return (
    <View className="gap-[6px]">
      {ROWS.map((row, index) => (
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
