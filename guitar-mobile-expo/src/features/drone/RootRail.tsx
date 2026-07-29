import { Pressable, Text } from 'react-native';

import { FadingHScroll } from '@/components/FadingHScroll';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { ROOTS, type RootName } from '@/lib/chord-library';

interface Props {
  root: RootName;
  onChange: (root: RootName) => void;
}

/**
 * All seventeen root spellings, chromatic with the enharmonic pairs adjacent.
 * F♯ and G♭ are both here because they are both real answers — the drone sounds
 * the same either way, and the chord it names does not.
 */
export function RootRail({ root, onChange }: Props) {
  return (
    <FadingHScroll contentClassName="flex-row gap-[6px] px-[18px]">
      {ROOTS.map((name) => {
        const selected = name === root;
        const natural = name.length === 1;

        return (
          <Pressable
            key={name}
            onPress={() => onChange(name)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Root ${name}`}
            className={`h-[40px] min-w-[40px] items-center justify-center rounded-[10px] border px-[10px] active:opacity-70 ${
              selected
                ? 'border-accent-line bg-accent-wash'
                : 'border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface'
            }`}
          >
            <Text
              className={`text-[15px] font-semibold tracking-[-0.2px] ${
                selected ? 'text-accent' : natural ? 'text-ink' : 'text-ink-muted'
              }`}
            >
              {toAccidentalGlyphs(name)}
            </Text>
          </Pressable>
        );
      })}
    </FadingHScroll>
  );
}
