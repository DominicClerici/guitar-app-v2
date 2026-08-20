import { Pressable, Text, View } from 'react-native';

import { Face } from '@/components/Face';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { Voicing } from '@/lib/guitar-voicings';

import { ChordDiagram } from './ChordDiagram';

const DIFFICULTY_TONE: Record<Voicing['difficulty'], string> = {
  easy: 'text-accent',
  moderate: 'text-ink-muted',
  hard: 'text-ink-faint',
};

interface Props {
  voicing: Voicing;
  selected: boolean;
  onPress: () => void;
}

/** One shape in the grid. Tapping it opens the detail in place. */
export function VoicingCard({ voicing, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${voicing.slashSymbol ?? 'Shape'} ${voicing.id}, ${voicing.difficulty}`}
      className="items-center px-[6px] pb-[8px] pt-[9px] active:opacity-70"
    >
      <Face name={selected ? 'accent' : 'card'} radius={11} />
      <ChordDiagram voicing={voicing} />

      <Text className="mt-[7px] font-mono text-[9px] tracking-[0.5px] text-ink-muted">
        {voicing.id}
      </Text>
      <Text
        className={`mt-[2px] font-mono text-[8px] uppercase tracking-[1.2px] ${
          DIFFICULTY_TONE[voicing.difficulty]
        }`}
      >
        {voicing.difficulty}
      </Text>
    </Pressable>
  );
}

/**
 * The expanded card: what each string is actually sounding, and what the shape
 * had to leave out to fit. The omission line is the part worth reading — it is
 * why a six-note chord can be played on five strings and still be that chord.
 */
export function VoicingDetail({ voicing }: { voicing: Voicing }) {
  const strings = voicing.frets.map((_, index) => index).reverse();

  return (
    <View className="flex-row gap-[16px] p-[14px]">
      <Face name="accent" radius={13} />
      <ChordDiagram voicing={voicing} size="detail" />

      <View className="flex-1">
        <Text className="font-mono text-[10px] tracking-[0.5px] text-ink">{voicing.id}</Text>

        <View className="mt-[9px] gap-[3px]">
          {strings.map((string) => {
            const fret = voicing.frets[string];
            return (
              <View key={string} className="flex-row items-center gap-[7px]">
                <Text className="w-[26px] font-mono text-[9px] tracking-[0.5px] text-ink-faint">
                  {fret === null ? '×' : fret === 0 ? 'open' : `${fret}fr`}
                </Text>
                <Text
                  className={`w-[30px] text-[11.5px] font-medium ${
                    fret === null ? 'text-ink-faint' : 'text-ink'
                  }`}
                >
                  {voicing.notes[string] ? toAccidentalGlyphs(voicing.notes[string]!) : '—'}
                </Text>
                <Text className="font-mono text-[9px] tracking-[0.5px] text-ink-muted">
                  {voicing.degrees[string] ? toAccidentalGlyphs(voicing.degrees[string]!) : ''}
                </Text>
              </View>
            );
          })}
        </View>

        <Text className="mt-[10px] text-[11px] leading-[15px] text-ink-muted">
          {voicing.omitted.length === 0
            ? 'Every chord tone is here.'
            : `Leaves out the ${toAccidentalGlyphs(voicing.omitted.join(' and '))} — the chord keeps its name without it.`}
        </Text>

        {voicing.barre ? (
          <Text className="mt-[4px] text-[11px] leading-[15px] text-ink-muted">
            Index finger barred across fret {voicing.barre.fret}.
          </Text>
        ) : null}
      </View>
    </View>
  );
}
