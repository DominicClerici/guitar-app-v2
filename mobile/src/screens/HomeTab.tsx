import { useRouter } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InlineChordDetector } from '@/features/chord-detection';
import { LearningHero, LearningHeroEmpty } from '@/features/learning';
import { InlineTunerCard } from '@/features/tuner/InlineTunerCard';
import { nextStep, nextStepHref, pathwayHref, useLearning } from '@/lib/learning';
import { useToken } from '@/lib/tokens';

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
  const router = useRouter();

  // The hero is the pathway touched most recently, which is what `active` is already ordered by.
  const { active, progress } = useLearning();
  const hero = active[0] ?? null;

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
          {hero ? (
            <LearningHero
              meta={hero.meta}
              pathway={hero.pathway}
              progress={progress}
              onContinue={() => {
                const step = hero.pathway ? nextStep(hero.pathway, progress) : null;
                if (step) router.push(nextStepHref(hero.meta.slug, step));
              }}
              onOpen={() => router.push(pathwayHref(hero.meta.slug))}
            />
          ) : (
            <LearningHeroEmpty />
          )}
        </View>

        {/* signature — tuner scale */}
        <View className="mt-[38px]">
          <SectionHeader title="Tuner" />
          <View className="mt-[12px]">
            <InlineTunerCard />
          </View>
        </View>

        {/* chord detection — the neck itself is the control, unenclosed like the hero */}
        <View className="mt-[34px]">
          <SectionHeader title="Chord Detection" />
          <View className="mt-[10px]">
            <InlineChordDetector />
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
