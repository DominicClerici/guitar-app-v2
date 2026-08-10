import { Fragment } from 'react';
import { Text, View } from 'react-native';

import { REGION_LABELS, type VoicingGroup } from '@/lib/guitar-voicings';

import { VoicingCard, VoicingDetail } from './VoicingCard';

/** Three across is what fits at page width without the boxes getting cramped. */
const COLUMNS = 3;

interface Props {
  group: VoicingGroup;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * One neck region and its shapes. The selected card expands into a full-width
 * detail directly beneath its own row, so the thing you tapped never scrolls
 * away from what it opened.
 */
export function RegionSection({ group, selectedId, onSelect }: Props) {
  const rows: VoicingGroup['voicings'][] = [];
  for (let i = 0; i < group.voicings.length; i += COLUMNS) {
    rows.push(group.voicings.slice(i, i + COLUMNS));
  }

  return (
    <View className="mt-[22px]">
      <View className="flex-row items-center gap-[12px] px-[18px]">
        <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
          {REGION_LABELS[group.region]}
        </Text>
        <View className="h-px flex-1 bg-line-soft" />
      </View>

      <View className="mt-[12px] gap-[10px] px-[18px]">
        {rows.map((row, index) => {
          const expanded = row.find((voicing) => voicing.id === selectedId);
          return (
            <Fragment key={index}>
              <View className="flex-row gap-[10px]">
                {row.map((voicing) => (
                  <View key={voicing.id} className="flex-1">
                    <VoicingCard
                      voicing={voicing}
                      selected={voicing.id === selectedId}
                      onPress={() => onSelect(voicing.id)}
                    />
                  </View>
                ))}
                {/* Keeps a short last row's cards the same width as a full one. */}
                {Array.from({ length: COLUMNS - row.length }, (_, i) => (
                  <View key={`pad-${i}`} className="flex-1" />
                ))}
              </View>

              {expanded ? <VoicingDetail voicing={expanded} /> : null}
            </Fragment>
          );
        })}
      </View>
    </View>
  );
}
