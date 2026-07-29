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

      <View className="mt-[10px] flex-row flex-wrap gap-[5px]">
        {chord.tones.map((tone) => (
          <View
            key={tone.degree}
            className={`h-[24px] flex-row items-center gap-[5px] rounded-[7px] px-[8px] ${
              tone.degree === '1'
                ? 'border border-accent-line bg-accent-wash'
                : 'border border-line-soft bg-surface'
            }`}
          >
            <Text
              className={`text-[11.5px] font-medium ${
                tone.degree === '1' ? 'text-accent' : 'text-ink'
              }`}
            >
              {toAccidentalGlyphs(tone.note)}
            </Text>
            <Text className="font-mono text-[8.5px] tracking-[0.5px] text-ink-faint">
              {toAccidentalGlyphs(tone.degree)}
            </Text>
          </View>
        ))}
      </View>

      {chord.spellingHint ? (
        <Text className="mt-[8px] text-[11.5px] leading-[16px] text-ink-muted">
          More often written {toAccidentalGlyphs(chord.spellingHint)}.
        </Text>
      ) : null}

      <Text className="mt-[10px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
        {shown} of {total} shapes
      </Text>
    </View>
  );
}
