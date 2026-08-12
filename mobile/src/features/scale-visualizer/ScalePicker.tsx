import { View } from 'react-native';

import { Button } from '@/components/Button';
import { FadingHScroll } from '@/components/FadingHScroll';
import { SelectableChips } from '@/components/SelectableChip';
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
        {FAMILY_ORDER.map((id) => (
          <Button
            key={id}
            variant={id === family ? 'link' : 'ghost'}
            size="inline"
            text="mono"
            hitSlop={6}
            className="h-[30px]"
            onPress={() => openFamily(id)}
          >
            {FAMILY_LABELS[id]}
          </Button>
        ))}
      </FadingHScroll>

      <SelectableChips
        items={scaleTypesByFamily(family).map((type) => ({ id: type.id, label: type.name }))}
        value={scaleId}
        onChange={onChange}
        className="mt-[10px] px-[18px]"
      />
    </View>
  );
}
