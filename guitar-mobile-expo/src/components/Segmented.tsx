import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useFace } from './CornerFace';

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
  const tray = useFace('tray', 9);

  return (
    <View className={`flex-row gap-[4px] rounded-[9px] p-[3px] ${tray.className}`}>
      {tray.paint}
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
  const face = useFace(selected ? 'accent' : 'bare', 7);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={segment.label}
      className={`h-[32px] min-w-[42px] items-center justify-center rounded-[7px] px-[10px] active:opacity-70 ${face.className}`}
    >
      {face.paint}
      {segment.content}
    </Pressable>
  );
}
