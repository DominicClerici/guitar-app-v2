import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { ProgressionChord, RomanLabel } from '@/lib/key-analysis';
import { useToken } from '@/lib/tokens';

interface Props {
  chords: ProgressionChord[];
  labels: RomanLabel[];
  /** The chord whose voicing is currently loaded on the neck, if any. */
  activeId: string | null;
  onSelect: (chord: ProgressionChord) => void;
  onRemove: (id: string) => void;
}

/**
 * The progression, in order. Each chip carries its roman numeral in the
 * displayed key — amber when the chord is borrowed from outside it. Tapping a
 * chip puts its voicing back on the neck.
 */
export function ProgressionChips({ chords, labels, activeId, onSelect, onRemove }: Props) {
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <View className="flex-row flex-wrap gap-[8px]">
      {chords.map((chord, i) => {
        const label = labels[i];
        const borrowed = label ? !label.isDiatonic : false;
        const active = chord.id === activeId;

        return (
          <Pressable
            key={chord.id}
            onPress={() => onSelect(chord)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${chord.name}, show on fretboard`}
            className={`flex-row items-center gap-[9px] rounded-[11px] border border-t-edge-top border-x-line-soft border-b-edge-bottom py-[8px] pl-[12px] pr-[9px] active:opacity-70 ${
              active ? 'bg-surface-raised' : 'bg-surface'
            }`}
          >
            <View>
              <Text className="text-[15px] font-semibold tracking-[-0.2px] text-ink">
                {toAccidentalGlyphs(chord.name)}
              </Text>
              {label ? (
                <Text
                  className={`mt-[3px] font-mono text-[9.5px] tracking-[1.2px] ${
                    borrowed ? 'text-amber' : 'text-ink-muted'
                  }`}
                >
                  {label.roman}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={() => onRemove(chord.id)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${chord.name}`}
              className="h-[20px] w-[20px] items-center justify-center rounded-full active:opacity-50"
            >
              <SymbolView name="xmark" size={9} weight="bold" tintColor={faint} />
            </Pressable>
          </Pressable>
        );
      })}
    </View>
  );
}
