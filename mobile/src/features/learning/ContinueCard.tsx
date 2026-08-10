import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import type { CurriculumPathway, PathwayMeta } from '@/lib/content';
import { nextStep, pathwayProgress, type ProgressBySection } from '@/lib/learning';
import { useToken } from '@/lib/tokens';

import { ProgressTrack } from './ProgressTrack';

// A pathway on the go. The card opens the pathway; the button inside it skips the map and opens
// the next thing to do, which is what the learner wants nine times out of ten.

export function ContinueCard({
  meta,
  pathway,
  progress,
  onOpen,
  onContinue,
}: {
  meta: PathwayMeta;
  /** Null until the tree has been read; the card still names the pathway in the meantime. */
  pathway: CurriculumPathway | null;
  progress: ProgressBySection;
  onOpen: () => void;
  onContinue: () => void;
}) {
  const onAccent = useToken('--on-accent', '#04211f');

  const tally = pathway ? pathwayProgress(pathway, progress) : null;
  const step = pathway ? nextStep(pathway, progress) : null;
  const upNext =
    step === null
      ? null
      : step.kind === 'section'
        ? step.section.title
        : `Chapter ${step.index + 1} checkpoint`;

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${meta.title}`}
      className="rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface p-[16px] active:opacity-70"
    >
      <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
        {meta.tags.join(' · ')}
      </Text>
      <Text className="mt-[6px] text-[19px] font-semibold tracking-[-0.4px] text-ink">
        {meta.title}
      </Text>

      {tally ? (
        <View className="mt-[16px]">
          <View className="flex-row items-baseline justify-between">
            <Text className="font-mono text-[16px] font-medium tracking-[0.5px] text-ink">
              {tally.completed}/{tally.total}
            </Text>
            <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
              {tally.pct}% complete
            </Text>
          </View>
          <View className="mt-[10px]">
            <ProgressTrack completed={tally.completed} total={tally.total} />
          </View>
        </View>
      ) : null}

      {upNext ? (
        <View className="mt-[16px] flex-row items-center gap-[12px]">
          <View className="flex-1">
            <Text className="font-mono text-[9px] uppercase tracking-[2px] text-accent">
              Up next
            </Text>
            <Text
              numberOfLines={1}
              className="mt-[3px] text-[13.5px] font-medium tracking-[-0.2px] text-ink"
            >
              {upNext}
            </Text>
          </View>
          <Pressable
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel={`Continue ${meta.title}`}
            className="h-[40px] flex-row items-center gap-[8px] rounded-[10px] border border-x-transparent border-t-[rgba(255,255,255,0.4)] border-b-[rgba(0,0,0,0.28)] bg-accent px-[16px] active:opacity-80"
          >
            <SymbolView name="play.fill" size={12} tintColor={onAccent} />
            <Text className="text-[13px] font-bold tracking-[0.3px] text-on-accent">Continue</Text>
          </Pressable>
        </View>
      ) : pathway ? (
        <Text className="mt-[16px] font-mono text-[9.5px] uppercase tracking-[2px] text-accent">
          Pathway complete
        </Text>
      ) : null}
    </Pressable>
  );
}
