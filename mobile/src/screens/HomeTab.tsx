import { useRouter } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { initials } from '@/features/account';
import { InlineChordDetector, type InlineChordDetectorRef } from '@/features/chord-detection';
import { LearningHero, LearningHeroEmpty } from '@/features/learning';
import { startOnboarding } from '@/features/onboarding';
import { TunerSheet, type TunerSheetRef } from '@/features/tuner';
import { InlineTunerCard, type InlineTunerCardRef } from '@/features/tuner/InlineTunerCard';
import { useSession } from '@/lib/auth';
import { nextStep, nextStepHref, pathwayHref, useLearning } from '@/lib/learning';
import { useToken } from '@/lib/tokens';
import { encodeVoicing } from '@/lib/voicing-param';

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
function SectionHeader({ title, onPress }: { title: string; onPress?: () => void }) {
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      className="flex-row items-center gap-[6px] self-start py-[6px] active:opacity-55"
      hitSlop={8}
    >
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

  // A guest is not someone to greet by name: the server made theirs up, and the account is the
  // thing they have yet to make. So a guest and a session still loading read the same here.
  const { data: session } = useSession();
  const account = session && !session.user.isAnonymous ? session.user : null;
  const firstName = account?.name.trim().split(/\s+/)[0] || null;

  const tunerSheet = useRef<TunerSheetRef>(null);
  const inlineTuner = useRef<InlineTunerCardRef>(null);
  const chordDetector = useRef<InlineChordDetectorRef>(null);

  // Order is the whole trick: the sheet takes a mic lease inside `present()`, so the
  // card's lease is the second of two rather than the last one. The count never reaches
  // zero, the native session is never torn down, and the sheet opens already listening.
  const openTuner = () => {
    tunerSheet.current?.present();
    inlineTuner.current?.stop();
  };

  // The neck carries over, so the full screen picks up the shape mid-build instead of
  // asking for it again. `root` pins the reading the card was showing, which is what
  // stops an Am7 reopening as a C6.
  const openChordDetector = () => {
    const board = chordDetector.current?.board();
    router.push({
      pathname: '/chord-detector',
      params:
        board && board.placed.length > 0
          ? {
              voicing: encodeVoicing(board.placed),
              ...(board.rootPitchClass === null ? {} : { root: String(board.rootPitchClass) }),
            }
          : {},
    });
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-[16px] px-[18px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        {/* header */}
        <View className="flex-row items-center justify-between gap-[12px]">
          <Text
            numberOfLines={1}
            className="flex-1 text-[32px] leading-[36px] font-semibold tracking-[-0.9px] text-ink"
          >
            {firstName ? (
              <>
                Hey <Text className="text-accent">{firstName}</Text>
              </>
            ) : (
              'Hey there'
            )}
          </Text>

          {/* Signed in there is nowhere better to go than the tab already holding the profile, so
              the avatar is an indicator. Signed out it is the way in. */}
          <Avatar
            initials={account ? initials(account) : null}
            accessibilityLabel={account ? 'Your account' : 'Create an account'}
            onPress={account ? undefined : () => startOnboarding(router)}
          />
        </View>

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
          <SectionHeader title="Tuner" onPress={openTuner} />
          <View className="mt-[12px]">
            <InlineTunerCard ref={inlineTuner} />
          </View>
        </View>

        {/* chord detection — the neck itself is the control, unenclosed like the hero */}
        <View className="mt-[34px]">
          <SectionHeader title="Chord Detection" onPress={openChordDetector} />
          <View className="mt-[10px]">
            <InlineChordDetector ref={chordDetector} />
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

      <TunerSheet ref={tunerSheet} />
    </View>
  );
}
