import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { RootName } from '@/lib/chord-library';
import type { Related, RelatedScale } from '@/lib/scale-library';
import { useToken } from '@/lib/tokens';

interface Props {
  related: Related;
  onPick: (root: RootName, scaleId: string) => void;
}

/**
 * The scales next door. Two questions, both worth a row each: which scales are
 * these same notes read from somewhere else, and which are one note away.
 *
 * The second is the one that earns its place — it is how you find the sound you
 * were reaching for by moving one step at a time, rather than by guessing which
 * name in the catalogue means it.
 */
export function RelatedScales({ related, onPick }: Props) {
  return (
    <View className="gap-[26px]">
      {related.sameNotes.length ? (
        <Group
          label="Same notes"
          caption="The same set, read from a different root"
          entries={related.sameNotes}
          onPick={onPick}
        />
      ) : null}

      {related.oneAway.length ? (
        <Group
          label="One note away"
          caption="Move a single note and this is what you get"
          entries={related.oneAway}
          onPick={onPick}
        />
      ) : null}
    </View>
  );
}

interface GroupProps {
  label: string;
  caption: string;
  entries: RelatedScale[];
  onPick: (root: RootName, scaleId: string) => void;
}

function Group({ label, caption, entries, onPick }: GroupProps) {
  return (
    <View className="px-[18px]">
      {/* The rule running off the label is what ties the rows beneath it into a set. */}
      <View className="flex-row items-center gap-[12px]">
        <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
          {label}
        </Text>
        <View className="h-px flex-1 bg-line-soft" />
      </View>
      <Text className="mt-[6px] text-[11.5px] leading-[16px] text-ink-muted">{caption}</Text>

      <View className="mt-[4px]">
        {entries.map((entry, index) => (
          <Row
            key={`${entry.root}-${entry.type.id}`}
            entry={entry}
            last={index === entries.length - 1}
            onPress={() => onPick(entry.root, entry.type.id)}
          />
        ))}
      </View>
    </View>
  );
}

function Row({
  entry,
  last,
  onPress,
}: {
  entry: RelatedScale;
  last: boolean;
  onPress: () => void;
}) {
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Show ${entry.root} ${entry.type.name}`}
      className={`flex-row items-center gap-[10px] py-[13px] active:opacity-55 ${
        last ? '' : 'border-b border-b-line-soft'
      }`}
    >
      <Text className="flex-1 text-[14px] font-medium tracking-[-0.2px] text-ink">
        {toAccidentalGlyphs(entry.root)} {entry.type.name}
      </Text>

      {entry.swap ? (
        <Text className="font-mono text-[10px] tracking-[0.6px] text-ink-faint">
          {toAccidentalGlyphs(entry.swap.added)} for {toAccidentalGlyphs(entry.swap.removed)}
        </Text>
      ) : null}

      <SymbolView name="chevron.right" size={11} weight="semibold" tintColor={faint} />
    </Pressable>
  );
}
