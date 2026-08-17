import { View } from 'react-native';

import { Button } from '@/components/Button';
import { FadingHScroll } from '@/components/FadingHScroll';
import { SelectableChips, type ChipItem } from '@/components/SelectableChip';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import {
  chordTypeById,
  chordTypesByFamily,
  FAMILY_LABELS,
  FAMILY_ORDER,
  type ChordFamily,
} from '@/lib/chord-library';

/**
 * A group the picker can offer that is not a chord family. The drone has one —
 * a bare root, which sits where a family sits because that is how you reach for
 * it — and the picker itself knows nothing about what it means.
 */
export interface ExtraGroup {
  id: string;
  label: string;
}

interface Props {
  quality: string;
  onChange: (id: string) => void;
  extraGroup?: ExtraGroup;
}

/**
 * The catalogue, two taps deep: a family, then a quality within it. Thirty
 * qualities in one list is a wall — grouped, the one you want is where you
 * would have looked for it.
 */
export function QualityPicker({ quality, onChange, extraGroup }: Props) {
  const groups: string[] = extraGroup ? [extraGroup.id, ...FAMILY_ORDER] : [...FAMILY_ORDER];

  const labelFor = (id: string) =>
    extraGroup && id === extraGroup.id ? extraGroup.label : FAMILY_LABELS[id as ChordFamily];

  // Derived rather than held: the open family is always the one the current
  // quality belongs to, so arriving from anywhere shows the right shelf.
  const group =
    extraGroup && quality === extraGroup.id
      ? extraGroup.id
      : (chordTypeById(quality)?.family ?? 'triad');

  const openGroup = (next: string) => {
    if (extraGroup && next === extraGroup.id) {
      onChange(extraGroup.id);
      return;
    }
    const first = chordTypesByFamily(next as ChordFamily)[0];
    if (first) onChange(first.id);
  };

  return (
    <View>
      <FadingHScroll contentClassName="flex-row gap-[6px] px-[18px]">
        {groups.map((id) => (
          <Button
            key={id}
            variant={id === group ? 'link' : 'ghost'}
            size="inline"
            text="mono"
            hitSlop={6}
            className="h-[30px]"
            onPress={() => openGroup(id)}
          >
            {labelFor(id)}
          </Button>
        ))}
      </FadingHScroll>

      {/* A group with no qualities under it — a bare root — opens onto nothing.
          It is chosen the moment it is tapped, and there is nothing left to say
          about it that the chips would have said. */}
      {extraGroup && group === extraGroup.id ? null : (
        <View className="mt-[10px] px-[18px]">
          <SelectableChips
            items={qualityChips(group as ChordFamily)}
            value={quality}
            onChange={onChange}
            chipClassName="min-w-[52px]"
          />
        </View>
      )}
    </View>
  );
}

/** The chips a family opens onto — the suffix on the face, the name read out. */
function qualityChips(family: ChordFamily): ChipItem[] {
  return chordTypesByFamily(family).map((type) => ({
    id: type.id,
    /* A major triad's suffix is empty, and a blank chip is unreadable. */
    label: type.symbol === '' ? 'maj' : toAccidentalGlyphs(type.symbol),
    accessibilityLabel: type.name,
  }));
}
