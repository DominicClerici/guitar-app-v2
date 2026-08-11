import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import type { CurriculumPathway, PathwayMeta } from '@/lib/content';
import { nextStep, pathwayProgress, stepTitle, type ProgressBySection } from '@/lib/learning';

import { ProgressTrack } from './ProgressTrack';

// The home screen's hero: the one pathway the learner touched last, unenclosed and sitting on the
// background rather than in a card. Deliberately not a `ContinueCard` — that one is a list item
// competing with two others, this one is the first thing on the screen and is allowed to be loud.
//
// Every state here is a real one, because a home screen is what a lapsed learner opens: nothing
// started, a tree not read yet, and a finished pathway all have to look deliberate.

export function LearningHero({
  meta,
  pathway,
  progress,
  onContinue,
  onOpen,
}: {
  meta: PathwayMeta;
  /** Null until the tree has been read; the hero still names the pathway in the meantime. */
  pathway: CurriculumPathway | null;
  progress: ProgressBySection;
  onContinue: () => void;
  onOpen: () => void;
}) {
  const tally = pathway ? pathwayProgress(pathway, progress) : null;
  const step = pathway ? nextStep(pathway, progress) : null;

  const title = step ? stepTitle(step) : meta.title;

  // The strap names where the learner is; when the pathway is the title itself there is nothing
  // left to qualify it with.
  const strap = step ? `${meta.title} · ${step.chapter.title}` : meta.summary;

  return (
    <View>
      <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-accent">
        {step ? 'Up next' : 'Pathway complete'}
      </Text>
      <Text className="mt-[10px] text-[34px] leading-[37px] font-semibold tracking-[-0.9px] text-ink">
        {title}
      </Text>
      <Text numberOfLines={2} className="mt-[6px] text-[13.5px] leading-[20px] text-ink-muted">
        {strap}
      </Text>

      {tally ? (
        <>
          <View className="mt-[24px] flex-row items-baseline justify-between">
            <Text className="font-mono text-[30px] leading-[30px] font-medium tracking-[0.5px] text-ink">
              {tally.completed}/{tally.total}
            </Text>
            <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              {tally.pct}% complete
            </Text>
          </View>

          <View className="mt-[14px]">
            <ProgressTrack completed={tally.completed} total={tally.total} />
          </View>
        </>
      ) : null}

      <View className="mt-[22px] flex-row gap-[12px]">
        <Button
          variant="primary"
          size="lg"
          icon={step ? 'play.fill' : 'checkmark'}
          className="flex-1"
          accessibilityLabel={step ? `Continue ${meta.title}` : `Open ${meta.title}`}
          onPress={step ? onContinue : onOpen}
        >
          {step ? 'Continue' : 'Review'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          square
          radius={10}
          icon="list.bullet"
          accessibilityLabel={`Open ${meta.title}`}
          onPress={onOpen}
        />
      </View>
    </View>
  );
}

/**
 * Nothing started yet.
 *
 * No button, deliberately. The tabs are a pager with its own local state rather than routes, so
 * there is nothing for a "Browse" control here to navigate to — and a button that scrolls a pager
 * it cannot reach is worse than a sentence pointing at the tab. Give this one a control when tab
 * selection is liftable, not before.
 */
export function LearningHeroEmpty() {
  return (
    <View>
      <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-accent">
        Start here
      </Text>
      <Text className="mt-[10px] text-[34px] leading-[37px] font-semibold tracking-[-0.9px] text-ink">
        Pick a pathway
      </Text>
      <Text className="mt-[6px] text-[13.5px] leading-[20px] text-ink-muted">
        Short lessons that build on each other, with a quiz at the end of every chapter. Open Learn
        to choose one.
      </Text>
    </View>
  );
}
