import { Pressable, Text, View } from 'react-native';

import { FadingHScroll } from '@/components/FadingHScroll';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import {
  chordTypeById,
  chordTypesByFamily,
  FAMILY_LABELS,
  FAMILY_ORDER,
  type ChordFamily,
} from '@/lib/chord-library';

import { SINGLE_NOTE } from './useDrone';

/** The bare root sits where a family sits, because that is how you reach for it. */
type Group = ChordFamily | typeof SINGLE_NOTE;

const GROUPS: Group[] = [SINGLE_NOTE, ...FAMILY_ORDER];

const GROUP_LABELS: Record<Group, string> = {
  [SINGLE_NOTE]: 'Note',
  ...FAMILY_LABELS,
};

interface Props {
  quality: string;
  onChange: (id: string) => void;
}

/**
 * The catalogue, two taps deep: a family, then a quality within it. Thirty
 * qualities in one list is a wall — grouped, the one you want is where you
 * would have looked for it.
 */
export function QualityPicker({ quality, onChange }: Props) {
  // Derived rather than held: the open family is always the one the current
  // quality belongs to, so arriving from anywhere shows the right shelf.
  const group: Group =
    quality === SINGLE_NOTE ? SINGLE_NOTE : (chordTypeById(quality)?.family ?? 'triad');

  const openGroup = (next: Group) => {
    if (next === SINGLE_NOTE) {
      onChange(SINGLE_NOTE);
      return;
    }
    const first = chordTypesByFamily(next)[0];
    if (first) onChange(first.id);
  };

  return (
    <View>
      <FadingHScroll contentClassName="flex-row gap-[6px] px-[18px]">
        {GROUPS.map((id) => {
          const selected = id === group;
          return (
            <Pressable
              key={id}
              onPress={() => openGroup(id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className="h-[30px] justify-center px-[2px] active:opacity-60"
            >
              <Text
                className={`font-mono text-[10px] font-semibold uppercase tracking-[1.6px] ${
                  selected ? 'text-accent' : 'text-ink-faint'
                }`}
              >
                {GROUP_LABELS[id]}
              </Text>
            </Pressable>
          );
        })}
      </FadingHScroll>

      <View className="mt-[10px] px-[18px]">
        {group === SINGLE_NOTE ? (
          <View className="h-[42px] justify-center rounded-[11px] border border-line-soft bg-surface px-[14px]">
            <Text className="text-[12.5px] leading-[17px] text-ink-muted">
              The root on its own — the steadiest thing to play against.
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-[6px]">
            {chordTypesByFamily(group).map((type) => {
              const selected = type.id === quality;
              return (
                <Pressable
                  key={type.id}
                  onPress={() => onChange(type.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={type.name}
                  className={`h-[42px] min-w-[52px] items-center justify-center rounded-[11px] border px-[12px] active:opacity-70 ${
                    selected
                      ? 'border-accent-line bg-accent-wash'
                      : 'border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface'
                  }`}
                >
                  <Text
                    className={`text-[14px] font-medium tracking-[-0.2px] ${
                      selected ? 'text-accent' : 'text-ink'
                    }`}
                  >
                    {/* A major triad's suffix is empty, and a blank chip is unreadable. */}
                    {type.symbol === '' ? 'maj' : toAccidentalGlyphs(type.symbol)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
