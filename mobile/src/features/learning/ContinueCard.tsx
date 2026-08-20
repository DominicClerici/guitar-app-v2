import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Face } from '@/components/Face';
import type { CurriculumPathway, PathwayMeta } from '@/lib/content';
import { nextStep, pathwayProgress, stepTitle, type ProgressBySection } from '@/lib/learning';

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
  const tally = pathway ? pathwayProgress(pathway, progress) : null;
  const step = pathway ? nextStep(pathway, progress) : null;
  const upNext = step === null ? null : stepTitle(step);

  return (
    <Pressable
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Open ${meta.title}`}
      className="p-[16px] active:opacity-70"
    >
      <Face name="card" radius={13} />
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
          <Button
            variant="primary"
            size="sm"
            icon="play.fill"
            accessibilityLabel={`Continue ${meta.title}`}
            onPress={onContinue}
          >
            Continue
          </Button>
        </View>
      ) : pathway ? (
        <Text className="mt-[16px] font-mono text-[9.5px] uppercase tracking-[2px] text-accent">
          Pathway complete
        </Text>
      ) : null}
    </Pressable>
  );
}
