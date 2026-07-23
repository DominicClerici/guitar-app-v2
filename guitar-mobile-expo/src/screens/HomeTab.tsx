import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ON_ACCENT = '#04211f';
const GHOST_ICON = '#9aa0aa';

// Precision tuner scale — 25 graduations. The centre reads in tune (aqua),
// every fifth tick is a major graduation, the rest are fine.
const TICKS = Array.from({ length: 25 }, (_, i) => i);
const CENTER = 12;
function tickClass(i: number) {
  if (i === CENTER)
    return 'w-[2px] h-[34px] bg-accent shadow-[0px_0px_8px_rgba(94,200,194,0.65)]';
  if (i % 5 === 0) return 'w-px h-[22px] bg-ink-faint';
  return 'w-px h-[12px] bg-line';
}

// Colour carries information here: each stat gets its own key-coded hue.
const TILES = [
  { num: '14', label: 'Streak', hue: 'text-aqua' },
  { num: '92%', label: 'Accuracy', hue: 'text-rose' },
  { num: '3.2h', label: 'This week', hue: 'text-violet' },
];

export function HomeTab() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-[16px] px-[22px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        {/* header */}
        <Text className="text-[32px] leading-[36px] font-semibold tracking-[-0.9px] text-ink">
          Hey <Text className="text-accent">Dominic</Text>
        </Text>

        {/* machined hero — learning progress */}
        <View className="mt-[24px] rounded-[18px] border border-t-edge-top border-x-line-soft border-b-edge-bottom p-[6px] bg-tray shadow-[0px_24px_48px_rgba(0,0,0,0.55)]">
          <View className="rounded-[13px] border border-t-edge-top border-x-transparent border-b-transparent p-[24px] bg-surface">
            <View className="flex-row items-start justify-between">
              <Text className="shrink text-[32px] leading-[35px] font-semibold tracking-[-0.8px] text-ink">
                Major Scale
              </Text>
              <Text className="shrink-0 mt-[4px] pl-[12px] font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-accent">
                Up next
              </Text>
            </View>
            <Text className="mt-[7px] text-[13.5px] leading-[20px] text-ink-muted">
              Changing Keys · D → G
            </Text>
            <View className="mt-[22px] flex-row items-end justify-between">
              <Text className="font-mono text-[34px] leading-[34px] font-medium tracking-[0.5px] text-ink">
                3/5
              </Text>
            </View>

            <View className="mt-[18px] h-[6px] overflow-hidden rounded-[6px] bg-line">
              <View className="h-[6px] w-[60%] rounded-[6px] bg-accent" />
            </View>

            <View className="mt-[22px] flex-row gap-[12px]">
              <Pressable className="h-[52px] flex-1 flex-row items-center justify-center gap-[9px] rounded-[10px] border border-t-[rgba(255,255,255,0.4)] border-x-transparent border-b-[rgba(0,0,0,0.28)] bg-accent">
                <SymbolView name="play.fill" size={14} tintColor={ON_ACCENT} />
                <Text className="text-[15px] font-bold tracking-[0.3px] text-on-accent">Continue</Text>
              </Pressable>
              <Pressable className="h-[52px] w-[52px] items-center justify-center rounded-[10px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface-raised">
                <SymbolView name="metronome" size={18} tintColor={GHOST_ICON} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* signature — tuner scale */}
        <View className="mt-[34px]">
          <View className="mt-[14px] rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom p-[22px] bg-surface">
            <View className="flex-row items-baseline justify-between">
              <Text className="text-[30px] font-semibold tracking-[-0.5px] text-ink">
                A<Text className="font-mono text-[13px] text-accent"> · 110.0 Hz</Text>
              </Text>
              <Text className="font-mono text-[13px] tracking-[0.5px] text-ink-muted">−0.4 ¢</Text>
            </View>
            <View className="mt-[20px] h-[40px] flex-row items-end justify-between">
              {TICKS.map((i) => (
                <View key={i} className={tickClass(i)} />
              ))}
            </View>
            <View className="mt-[12px] h-px bg-line" />
            <View className="mt-[8px] flex-row justify-between">
              <Text className="font-mono text-[9.5px] tracking-[1px] text-ink-faint">−50</Text>
              <Text className="font-mono text-[9.5px] tracking-[1px] text-ink-faint">IN TUNE</Text>
              <Text className="font-mono text-[9.5px] tracking-[1px] text-ink-faint">+50</Text>
            </View>
          </View>
        </View>

        {/* machined stat tiles */}
        <View className="mt-[14px] flex-row gap-[12px]">
          {TILES.map((t) => (
            <View
              key={t.label}
              className="flex-1 rounded-[11px] border border-t-edge-top border-x-line-soft border-b-edge-bottom p-[16px] bg-surface"
            >
              <Text className={`font-mono text-[26px] font-medium tracking-[-0.5px] ${t.hue}`}>
                {t.num}
              </Text>
              <Text className="mt-[8px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
                {t.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
