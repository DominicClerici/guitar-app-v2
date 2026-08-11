import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { QualityPicker, RootRail } from '@/features/chord-picker';
import { ChordHeading, RegionSection, useChordShapes } from '@/features/chord-shapes';
import { useToken } from '@/lib/tokens';

/**
 * Every way to hold one chord. The page reads top-down the way the question is
 * asked — which chord, then where on the neck — and each region shows its best
 * two shapes until you ask for the rest.
 */
export function ChordShapesScreen() {
  const insets = useSafeAreaInsets();

  const shapes = useChordShapes();

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[42px] flex-row items-center px-[18px]">
        <BackLink title="Chord Shapes" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <View className="pt-[6px]">
          <ChordHeading chord={shapes.chord} shown={shapes.shown} total={shapes.total} />
        </View>

        <View className="mt-[18px] gap-[12px]">
          <RootRail root={shapes.root} onChange={shapes.setRoot} />
          <QualityPicker quality={shapes.quality} onChange={shapes.setQuality} />
        </View>

        {shapes.groups.map((group) => (
          <RegionSection
            key={group.region}
            group={group}
            selectedId={shapes.selectedId}
            onSelect={shapes.select}
          />
        ))}

        <View className="mt-[20px] gap-[10px] px-[18px]">
          <Disclosure
            label={shapes.showAll ? 'Show the best few' : `See all ${shapes.total} shapes`}
            open={shapes.showAll}
            onPress={shapes.toggleAll}
          />

          {shapes.inversionCount > 0 ? (
            <Disclosure
              label={`Inversions (${shapes.inversionCount})`}
              caption="The same chord with another of its tones in the bass — written as a slash chord."
              open={shapes.showInversions}
              onPress={shapes.toggleInversions}
            />
          ) : null}
        </View>

        {shapes.inversionGroups.map((group) => (
          <RegionSection
            key={`inv-${group.region}`}
            group={group}
            selectedId={shapes.selectedId}
            onSelect={shapes.select}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface DisclosureProps {
  label: string;
  caption?: string;
  open: boolean;
  onPress: () => void;
}

function Disclosure({ label, caption, open, onPress }: DisclosureProps) {
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      className="flex-row items-center gap-[10px] rounded-[11px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface px-[14px] py-[12px] active:opacity-70"
    >
      <View className="flex-1">
        <Text className="text-[13px] font-medium tracking-[-0.1px] text-ink">{label}</Text>
        {caption ? (
          <Text className="mt-[3px] text-[11.5px] leading-[16px] text-ink-muted">{caption}</Text>
        ) : null}
      </View>
      <SymbolView
        name={open ? 'chevron.up' : 'chevron.down'}
        size={12}
        weight="semibold"
        tintColor={faint}
      />
    </Pressable>
  );
}
