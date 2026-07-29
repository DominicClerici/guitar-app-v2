import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

export interface Segment {
  id: string;
  /** What a screen reader announces. The face of the control is `content`. */
  label: string;
  content: ReactNode;
}

interface Props {
  segments: Segment[];
  value: string;
  onChange: (id: string) => void;
}

/** Row of exclusive choices in a recessed tray — the selected one lifts out of it. */
export function Segmented({ segments, value, onChange }: Props) {
  return (
    <View className="flex-row gap-[4px] rounded-[9px] border border-line-soft bg-tray p-[3px]">
      {segments.map((segment) => {
        const selected = segment.id === value;
        return (
          <Pressable
            key={segment.id}
            onPress={() => onChange(segment.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={segment.label}
            className={`h-[32px] min-w-[42px] items-center justify-center rounded-[7px] px-[10px] active:opacity-70 ${
              selected ? 'border border-accent-line bg-accent-wash' : ''
            }`}
          >
            {segment.content}
          </Pressable>
        );
      })}
    </View>
  );
}
