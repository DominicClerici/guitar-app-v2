import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import type { PathwayDifficulty, PathwayMeta } from '@/lib/content';
import { useToken } from '@/lib/tokens';

// One pathway in the catalogue. The row itself opens the pathway to be read about; enrolling is a
// separate, deliberate tap, because the three-active cap makes starting one a decision.

const DIFFICULTY: Record<PathwayDifficulty, string> = {
  intro: 'Intro',
  core: 'Core',
  advanced: 'Advanced',
};

/** What the trailing control offers, which is the whole state of the row. */
export type CatalogueState = 'available' | 'enrolled' | 'capped';

export function CatalogueRow({
  meta,
  state,
  last,
  onOpen,
  onStart,
}: {
  meta: PathwayMeta;
  state: CatalogueState;
  last: boolean;
  onOpen: () => void;
  onStart: () => void;
}) {
  const faint = useToken('--ink-faint', '#62666e');
  const strap = [DIFFICULTY[meta.difficulty], `${meta.estimatedMin} min`].join(' · ');

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${meta.title}`}
      className={`py-[16px] active:opacity-55 ${last ? '' : 'border-b border-b-line-soft'}`}
    >
      <View className="flex-row items-center gap-[14px]">
        <View className="flex-1">
          <Text className="font-mono text-[9px] uppercase tracking-[2px] text-ink-faint">
            {strap}
          </Text>
          <Text className="mt-[5px] text-[15px] font-medium tracking-[-0.2px] text-ink">
            {meta.title}
          </Text>
          <Text className="mt-[3px] text-[12.5px] leading-[17px] text-ink-muted">
            {meta.summary}
          </Text>
        </View>
        <SymbolView name="chevron.right" size={12} weight="semibold" tintColor={faint} />
      </View>

      {state === 'available' ? (
        <Pressable
          onPress={onStart}
          accessibilityRole="button"
          accessibilityLabel={`Start ${meta.title}`}
          className="mt-[12px] self-start rounded-full border border-accent-line bg-accent-wash px-[16px] py-[7px] active:opacity-70"
        >
          <Text className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-accent">
            Start
          </Text>
        </Pressable>
      ) : state === 'enrolled' ? (
        <Text className="mt-[12px] font-mono text-[9.5px] uppercase tracking-[2px] text-accent">
          In progress
        </Text>
      ) : (
        // The cap is a rule the learner can act on, so it says what to do rather than just
        // disabling the control and leaving them to work it out.
        <Text className="mt-[12px] text-[12px] leading-[17px] text-ink-faint">
          You have three pathways on the go. Drop one from its page to make room for this.
        </Text>
      )}
    </Pressable>
  );
}
