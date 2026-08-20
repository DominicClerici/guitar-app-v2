import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Face } from '@/components/Face';
import { PathwayHero } from '@/features/ear-trainer';
import { useLearnerId, useProgress } from '@/lib/learning';

// The ear tab: functional ear training against a drone, as a route through it
// and a room to wander in.
//
// The pathway comes first because it is the one thing a learner who does not
// already know functional ear training can act on — seventeen graded sessions,
// each adding a degree to the last. Free Play sits below it, unchanged and
// fully open: the sandbox stays useful to the people most able to use it, and
// coupling it to pathway progress would only take that away.

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

function Rule({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-[12px]">
      <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
        {label}
      </Text>
      <View className="h-px flex-1 bg-line-soft" />
    </View>
  );
}

export function EarTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const userId = useLearnerId();
  const progress = useProgress(userId);

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-[20px] px-[18px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        <Rule label="Train" />

        <View className="mt-[14px]">
          <PathwayHero
            progress={progress}
            onOpenSession={(id) => router.push({ pathname: '/ear-session/[id]', params: { id } })}
            onOpenPathway={() => router.push('/ear-pathway')}
          />
        </View>

        <View className="mt-[26px]">
          <Rule label="Explore" />
        </View>

        <Pressable
          onPress={() => router.push('/ear-trainer')}
          accessibilityRole="button"
          accessibilityLabel="Open Free Play"
          className="mt-[14px] p-[16px] active:opacity-70"
        >
          <Face name="card" radius={13} />
          <Emblem />
          <Text className="mt-[18px] text-[16px] font-semibold tracking-[-0.2px] text-ink">
            Free Play
          </Text>
          <Text className="mt-[5px] text-[12.5px] leading-[17px] text-ink-muted">
            A drone, a tone, and your ear. Explore the twelve degrees over a held tonic, then switch
            on questions and name what you hear.
          </Text>
          <Text className="mt-[10px] font-mono text-[9.5px] tracking-[1.5px] text-ink-faint">
            DRONE · DEGREES
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
