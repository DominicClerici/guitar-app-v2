import { Text, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { Chord } from '@/lib/chord-library';

interface Props {
  chord: Chord;
  /** How many shapes are on show, and how many exist. */
  shown: number;
  total: number;
}

/**
 * What you asked for, spelled out. The tones sit under the symbol with the root
 * lit, so the diagrams below can be read as placements of these specific notes
 * rather than as anonymous dots.
 */
export function ChordHeading({ chord, shown, total }: Props) {
  return (
    <View className="px-[18px]">
      <View className="flex-row items-baseline gap-[10px]">
        <Text
          className="text-[34px] font-semibold leading-[40px] tracking-[-1px] text-ink"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {toAccidentalGlyphs(chord.symbol)}
        </Text>
        <Text className="flex-1 text-[12.5px] text-ink-muted" numberOfLines={1}>
          {chord.type.name}
        </Text>
      </View>

      <View className="mt-[12px] flex-row flex-wrap items-start gap-x-[17px] gap-y-[10px]">
        {chord.tones.map((tone) => {
          const isRoot = tone.degree === '1';
          return (
            <View key={tone.degree} className="items-center">
              <Text
                className={`text-[16px] leading-[19px] tracking-[-0.3px] ${
                  isRoot ? 'font-semibold text-accent' : 'font-medium text-ink'
                }`}
              >
                {toAccidentalGlyphs(tone.note)}
              </Text>
              <View
                className={`mt-[5px] h-px self-stretch ${isRoot ? 'bg-accent-line' : 'bg-line'}`}
              />
              <Text
                className={`mt-[4px] font-mono text-[8.5px] uppercase tracking-[1px] ${
                  isRoot ? 'text-accent' : 'text-ink-faint'
                }`}
              >
                {toAccidentalGlyphs(tone.degree)}
              </Text>
            </View>
          );
        })}
      </View>

      {chord.spellingHint ? (
        <Text className="mt-[12px] text-[11.5px] leading-[16px] text-ink-muted">
          More often written {toAccidentalGlyphs(chord.spellingHint)}.
        </Text>
      ) : null}

      <Text className="mt-[10px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
        {shown} of {total} shapes
      </Text>
    </View>
  );
}
