import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCSSVariable } from 'uniwind';

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

const ARTICLES: { icon: SFSymbol; title: string; subtitle: string }[] = [
  { icon: 'text.book.closed', title: 'Reading Tab Notation', subtitle: '5 min read' },
  { icon: 'hand.raised.fingers.spread', title: 'Fretting Hand Posture', subtitle: '8 min read' },
  { icon: 'waveform.path', title: 'How Intervals Work', subtitle: '6 min read' },
];

const PLAY: { icon: SFSymbol; title: string; subtitle: string }[] = [
  { icon: 'timer', title: 'Chord Trainer', subtitle: 'Drill shapes against the clock' },
  { icon: 'ear', title: 'Ear Training', subtitle: 'Name the interval you hear' },
  { icon: 'square.grid.3x3', title: 'Fretboard Quiz', subtitle: 'Find every note, one string up' },
];

function useToken(name: string, fallback: string) {
  const vars = useCSSVariable([name]);
  return (vars[0] as string | undefined) ?? fallback;
}

// Tappable section title. The chevron is the affordance — it is what tells the
// user the whole header row opens a fuller view.
function SectionHeader({ title }: { title: string }) {
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Pressable className="flex-row items-center gap-[6px] self-start py-[6px]" hitSlop={8}>
      <Text className="text-[17px] font-semibold tracking-[-0.3px] text-ink">{title}</Text>
      <SymbolView name="chevron.right" size={12} weight="semibold" tintColor={faint} />
    </Pressable>
  );
}

function ArticleRow({ icon, title, subtitle }: (typeof ARTICLES)[number]) {
  const muted = useToken('--ink-muted', '#9aa0aa');
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Pressable className="flex-row items-center gap-[14px] border-b border-b-line-soft py-[15px]">
      <View className="w-[24px] items-center">
        <SymbolView name={icon} size={18} tintColor={muted} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">{title}</Text>
        <Text className="mt-[3px] font-mono text-[11px] tracking-[0.5px] text-ink-faint">
          {subtitle}
        </Text>
      </View>
      <SymbolView name="chevron.right" size={12} weight="semibold" tintColor={faint} />
    </Pressable>
  );
}

function PlayCard({ icon, title, subtitle }: (typeof PLAY)[number]) {
  const accent = useToken('--accent', '#5ec8c2');

  return (
    <Pressable className="flex-row items-center gap-[16px] rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom p-[16px] bg-surface">
      <View className="flex-1">
        <Text className="text-[15.5px] font-semibold tracking-[-0.2px] text-ink">{title}</Text>
        <Text className="mt-[4px] text-[12.5px] leading-[17px] text-ink-muted">{subtitle}</Text>
      </View>
      <SymbolView name={icon} size={20} tintColor={accent} />
    </Pressable>
  );
}

export function HomeTab() {
  const insets = useSafeAreaInsets();
  const onAccent = useToken('--on-accent', '#04211f');
  const muted = useToken('--ink-muted', '#9aa0aa');

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-[16px] px-[18px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        {/* header */}
        <Text className="text-[32px] leading-[36px] font-semibold tracking-[-0.9px] text-ink">
          Hey <Text className="text-accent">Dominic</Text>
        </Text>

        {/* hero — learning progress, unenclosed and sitting on the background */}
        <View className="mt-[28px]">
          <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-accent">
            Up next
          </Text>
          <Text className="mt-[10px] text-[34px] leading-[37px] font-semibold tracking-[-0.9px] text-ink">
            Major Scale
          </Text>
          <Text className="mt-[6px] text-[13.5px] leading-[20px] text-ink-muted">
            Changing Keys · D → G
          </Text>

          <View className="mt-[24px] flex-row items-baseline justify-between">
            <Text className="font-mono text-[30px] leading-[30px] font-medium tracking-[0.5px] text-ink">
              3/5
            </Text>
            <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              60% complete
            </Text>
          </View>

          <View className="mt-[14px] h-[6px] overflow-hidden rounded-[6px] bg-line">
            <View className="h-[6px] w-[60%] rounded-[6px] bg-accent" />
          </View>

          <View className="mt-[22px] flex-row gap-[12px]">
            <Pressable className="h-[52px] flex-1 flex-row items-center justify-center gap-[9px] rounded-[10px] border border-t-[rgba(255,255,255,0.4)] border-x-transparent border-b-[rgba(0,0,0,0.28)] bg-accent">
              <SymbolView name="play.fill" size={14} tintColor={onAccent} />
              <Text className="text-[15px] font-bold tracking-[0.3px] text-on-accent">Continue</Text>
            </Pressable>
            <Pressable className="h-[52px] w-[52px] items-center justify-center rounded-[10px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface-raised">
              <SymbolView name="metronome" size={18} tintColor={muted} />
            </Pressable>
          </View>
        </View>

        {/* signature — tuner scale */}
        <View className="mt-[38px]">
          <SectionHeader title="Tuner" />
          <View className="mt-[12px] rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom p-[20px] bg-surface">
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

        {/* articles — quiet list, separated by hairlines rather than cards */}
        <View className="mt-[34px]">
          <SectionHeader title="Articles" />
          <View className="mt-[4px]">
            {ARTICLES.map((a) => (
              <ArticleRow key={a.title} {...a} />
            ))}
          </View>
        </View>

        {/* play — enclosed, tappable surfaces */}
        <View className="mt-[34px]">
          <SectionHeader title="Play" />
          <View className="mt-[12px] gap-[10px]">
            {PLAY.map((p) => (
              <PlayCard key={p.title} {...p} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
