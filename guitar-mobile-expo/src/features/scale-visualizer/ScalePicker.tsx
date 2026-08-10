import { Pressable, Text, View } from 'react-native';

import { FadingHScroll } from '@/components/FadingHScroll';
import {
  FAMILY_LABELS,
  FAMILY_ORDER,
  scaleTypeById,
  scaleTypesByFamily,
  type ScaleFamily,
} from '@/lib/scale-library';

interface Props {
  scaleId: string;
  onChange: (id: string) => void;
}

/**
 * The catalogue, two taps deep: a family, then a scale within it. Twenty-six
 * scales in one list is a wall — grouped, the one you want is where you would
 * have looked for it.
 */
export function ScalePicker({ scaleId, onChange }: Props) {
  // Derived rather than held: the open family is always the one the current scale
  // belongs to, so arriving from a related-scale row shows the right shelf.
  const family = scaleTypeById(scaleId)?.family ?? 'major-modes';

  const openFamily = (next: ScaleFamily) => {
    const first = scaleTypesByFamily(next)[0];
    if (first) onChange(first.id);
  };

  return (
    <View>
      <FadingHScroll contentClassName="flex-row gap-[14px] px-[18px]">
        {FAMILY_ORDER.map((id) => {
          const selected = id === family;
          return (
            <Pressable
              key={id}
              onPress={() => openFamily(id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className="h-[30px] justify-center px-[2px] active:opacity-60"
            >
              <Text
                className={`font-mono text-[10px] font-semibold uppercase tracking-[1.6px] ${
                  selected ? 'text-accent' : 'text-ink-faint'
                }`}
              >
                {FAMILY_LABELS[id]}
              </Text>
            </Pressable>
          );
        })}
      </FadingHScroll>

      <View className="mt-[10px] flex-row flex-wrap gap-[6px] px-[18px]">
        {scaleTypesByFamily(family).map((type) => {
          const selected = type.id === scaleId;
          return (
            <Pressable
              key={type.id}
              onPress={() => onChange(type.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={type.name}
              className={`h-[42px] items-center justify-center rounded-[11px] border px-[13px] active:opacity-70 ${
                selected
                  ? 'border-accent-line bg-accent-wash'
                  : 'border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface'
              }`}
            >
              <Text
                className={`text-[13.5px] font-medium tracking-[-0.2px] ${
                  selected ? 'text-accent' : 'text-ink'
                }`}
              >
                {type.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
