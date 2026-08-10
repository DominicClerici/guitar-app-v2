import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import type { ScalePlan } from '@/lib/scale-analysis';
import { useToken } from '@/lib/tokens';

import { scaleLabel } from './scaleLabel';

interface Props {
  plan: ScalePlan;
  onPress: () => void;
}

/**
 * The one-line scale verdict under the key readout: which scale to reach for,
 * and whether it holds everywhere. The full story — the neck, the deltas, the
 * lenses — lives one push away in the scale explorer.
 */
export function WhatToPlayRow({ plan, onPress }: Props) {
  const muted = useToken('--ink-muted', '#9aa0aa');

  const spots = plan.exceptions.length;
  // The pentatonic outranks the full scale when it survives everything: fewer
  // notes, fewer problems, and the name a guitarist reaches for first.
  const headline = plan.pentatonic.survives ? plan.pentatonic.scale : plan.global;
  const detail = plan.pentatonic.survives
    ? 'works over the whole thing'
    : spots === 1
      ? '1 spot to watch'
      : `${spots} spots to watch`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`What to play: ${scaleLabel(headline)}, ${detail}. Opens the scale explorer.`}
      className="mt-[8px] flex-row items-center justify-between rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface px-[16px] py-[12px] active:opacity-70"
    >
      <View className="min-w-0 flex-1 pr-[10px]">
        <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
          What to play
        </Text>
        <Text className="mt-[5px] text-[15px] tracking-[-0.2px] text-ink-muted" numberOfLines={1}>
          <Text className="font-semibold text-ink">{scaleLabel(headline)}</Text>
          {` — ${detail}`}
        </Text>
      </View>
      <SymbolView name="chevron.right" size={13} weight="semibold" tintColor={muted} />
    </Pressable>
  );
}
