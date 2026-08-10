import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// The ear tab: functional ear training against a drone. One mode for now —
// Free Play — laid out as a list so the curated paths, stats and the rest of
// the progression system land here as further cards without rework.

/**
 * The ground and what moves over it: a held drone bar, then scattered tones.
 * Same primitive as the tool-card emblems — bars carrying the feature's shape.
 */
function Emblem() {
  return (
    <View className="h-[24px] flex-row items-end gap-[5px]">
      <View className="mr-[6px] h-[5px] w-[30px] self-end rounded-full bg-accent" />
      {['h-[12px]', 'h-[19px]', 'h-[8px]', 'h-[24px]', 'h-[15px]'].map((height, index) => (
        <View key={index} className={`w-[3px] rounded-full bg-ink-faint ${height}`} />
      ))}
    </View>
  );
}

export function EarTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-[20px] px-[18px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        <View className="flex-row items-center gap-[12px]">
          <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
            Train
          </Text>
          <View className="h-px flex-1 bg-line-soft" />
        </View>

        <Pressable
          onPress={() => router.push('/ear-trainer')}
          accessibilityRole="button"
          accessibilityLabel="Open Free Play"
          className="mt-[14px] rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface p-[16px] active:opacity-70"
        >
          <Emblem />
          <Text className="mt-[18px] text-[16px] font-semibold tracking-[-0.2px] text-ink">
            Free Play
          </Text>
          <Text className="mt-[5px] text-[12.5px] leading-[17px] text-ink-muted">
            A drone, a tone, and your ear. Explore the twelve degrees over a held tonic, then
            switch on questions and name what you hear.
          </Text>
          <Text className="mt-[10px] font-mono text-[9.5px] tracking-[1.5px] text-ink-faint">
            DRONE · DEGREES
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
