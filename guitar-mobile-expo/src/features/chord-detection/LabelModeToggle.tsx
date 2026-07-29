import { Pressable, Text, View } from 'react-native';

export type LabelMode = 'notes' | 'degrees';

const MODES: { id: LabelMode; label: string }[] = [
  { id: 'notes', label: 'Notes' },
  { id: 'degrees', label: 'Degrees' },
];

/**
 * What the dots on the neck say. Notes name the pitches; degrees name their jobs
 * in whichever reading is lit, which is what turns a shape you can play into a
 * shape you can move.
 */
export function LabelModeToggle({
  mode,
  onChange,
}: {
  mode: LabelMode;
  onChange: (mode: LabelMode) => void;
}) {
  return (
    <View className="h-[50px] flex-1 flex-row items-center rounded-[10px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface p-[4px]">
      {MODES.map((entry) => {
        const on = entry.id === mode;
        return (
          <Pressable
            key={entry.id}
            onPress={() => onChange(entry.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`Label the neck with ${entry.label.toLowerCase()}`}
            className={`h-full flex-1 items-center justify-center rounded-[7px] active:opacity-70 ${
              on ? 'bg-surface-raised' : ''
            }`}
          >
            <Text
              className={`font-mono text-[10px] font-semibold uppercase tracking-[1.5px] ${
                on ? 'text-accent' : 'text-ink-faint'
              }`}
            >
              {entry.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
