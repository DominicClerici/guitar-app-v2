import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToken } from '@/lib/tokens';

// The end of a run. A phase of the runner rather than a route, so Back from here lands on the
// chapter the learner came from instead of replaying what they just finished.
//
// There is no score and no pass mark: an activity is practice, so the only verdict it offers is
// that it is over. What the run actually measured — targets found, hits landed — is the runner's
// to describe, which is why the middle of this card is a slot.

export function ActivitySummary({
  title,
  subtitle,
  children,
  onPlayAgain,
  onDone,
}: {
  title: string;
  subtitle?: string;
  /** Type-specific stats. Anything the runner counted that is worth showing back. */
  children?: ReactNode;
  onPlayAgain: () => void;
  onDone: () => void;
}) {
  const insets = useSafeAreaInsets();
  const accent = useToken('--accent', '#5ec8c2');
  const onAccent = useToken('--on-accent', '#04211f');

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-[28px]"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="items-center">
          <View className="h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-accent bg-accent-wash">
            <SymbolView name="checkmark" size={28} weight="bold" tintColor={accent} />
          </View>

          <Text className="mt-[18px] text-center text-[19px] font-semibold tracking-[-0.4px] text-ink">
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-[7px] text-center text-[13px] leading-[19px] text-ink-muted">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {children ? <View className="mt-[26px]">{children}</View> : null}
      </ScrollView>

      <View
        className="border-t border-t-line-soft px-[18px] pt-[12px]"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="flex-row gap-[10px]">
          <Pressable
            onPress={onPlayAgain}
            accessibilityRole="button"
            accessibilityLabel="Play again"
            className="h-[50px] flex-1 items-center justify-center rounded-[13px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface-raised active:opacity-70"
          >
            <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink-muted">
              Play again
            </Text>
          </Pressable>

          <Pressable
            onPress={onDone}
            accessibilityRole="button"
            accessibilityLabel="Done"
            className="h-[50px] flex-1 flex-row items-center justify-center gap-[9px] rounded-[13px] bg-accent active:opacity-80"
          >
            <SymbolView name="checkmark" size={13} weight="bold" tintColor={onAccent} />
            <Text className="text-[15px] font-semibold tracking-[-0.2px] text-on-accent">Done</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
