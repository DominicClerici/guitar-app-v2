import { Pressable, Text, View } from 'react-native';

import { useFace } from '@/components/CornerFace';

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
  const housing = useFace('card', 10);

  return (
    <View
      className={`h-[50px] flex-1 flex-row items-center rounded-[10px] p-[4px] ${housing.className}`}
    >
      {housing.paint}
      {MODES.map((entry) => (
        <ModeButton
          key={entry.id}
          label={entry.label}
          on={entry.id === mode}
          onPress={() => onChange(entry.id)}
        />
      ))}
    </View>
  );
}

function ModeButton({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const face = useFace(on ? 'slab' : 'bare', 7);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`Label the neck with ${label.toLowerCase()}`}
      className={`h-full flex-1 items-center justify-center rounded-[7px] active:opacity-70 ${face.className}`}
    >
      {face.paint}
      <Text
        className={`font-mono text-[10px] font-semibold uppercase tracking-[1.5px] ${
          on ? 'text-accent' : 'text-ink-faint'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
