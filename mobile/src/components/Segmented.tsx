import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Face } from './Face';

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
    <View className="flex-row gap-[4px] p-[3px]">
      <Face name="tray" radius={9} />
      {segments.map((segment) => (
        <SegmentButton
          key={segment.id}
          segment={segment}
          selected={segment.id === value}
          onPress={() => onChange(segment.id)}
        />
      ))}
    </View>
  );
}

function SegmentButton({
  segment,
  selected,
  onPress,
}: {
  segment: Segment;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={segment.label}
      className="h-[32px] min-w-[42px] items-center justify-center px-[10px] active:opacity-70"
    >
      <Face name={selected ? 'accent' : 'bare'} radius={7} />
      {segment.content}
    </Pressable>
  );
}
