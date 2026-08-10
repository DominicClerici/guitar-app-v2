import { Pressable, Text, View } from 'react-native';

import { FadingHScroll } from '@/components/FadingHScroll';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { ChordResult } from '@/lib/chord-analysis';

interface Props {
  readings: ChordResult[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Every name the engine will accept for this shape, ranked. Choosing one is not
 * cosmetic — each reading carries its own intervals and its own warnings, so the
 * panel and the neck below re-letter around whichever is lit.
 */
export function ReadingShelf({ readings, selectedIndex, onSelect }: Props) {
  if (readings.length === 0) return null;

  const strayed = selectedIndex !== 0;

  return (
    <View>
      <Text className="font-mono text-[9.5px] font-semibold uppercase tracking-[2px] text-ink-faint">
        {readings.length === 1 ? 'One reading' : 'Reads also as'}
      </Text>

      <FadingHScroll contentClassName="flex-row gap-[8px] pt-[10px] pr-[4px]" fadeTravel={22}>
        {readings.map((reading, i) => {
          const on = i === selectedIndex;
          return (
            <Pressable
              key={`${reading.name}-${i}`}
              onPress={() => onSelect(i)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`Read as ${reading.name}`}
              className={`h-[32px] flex-row items-center gap-[6px] rounded-full border px-[13px] active:opacity-70 ${
                on ? 'border-accent-line bg-accent-wash' : 'border-line-soft bg-surface'
              }`}
            >
              {/* Once you have strayed from the engine's own answer, it keeps a
                  mark so you can find your way back to it. */}
              {reading.primary && strayed ? (
                <View className="h-[4px] w-[4px] rounded-full bg-ink-faint" />
              ) : null}
              <Text
                className={`text-[13px] font-medium tracking-[-0.1px] ${
                  on ? 'text-accent' : 'text-ink-muted'
                }`}
              >
                {toAccidentalGlyphs(reading.name)}
              </Text>
            </Pressable>
          );
        })}
      </FadingHScroll>
    </View>
  );
}
