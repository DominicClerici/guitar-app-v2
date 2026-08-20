import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Face } from '@/components/Face';
import { ProgressTrack } from '@/features/learning';
import {
  EAR_SESSIONS,
  EAR_TRACKS,
  nextSession,
  pathwayProgress,
  type EarSessionAt,
} from '@/lib/ear-training';
import type { ProgressBySection } from '@/lib/learning';

// The Ear tab's front card: where the learner is in the pathway and the one
// thing to do about it.
//
// Three states, all of them real — nothing started, partway, and finished — and
// the last one has to look deliberate rather than like a card that ran out of
// things to say. A finished pathway keeps its one action, because the full
// wheel is worth sitting again long after it has been passed.

/** What a finished pathway offers: the last session, the whole twelve. */
const FULL_WHEEL = EAR_SESSIONS[EAR_SESSIONS.length - 1];

export function PathwayHero({
  progress,
  onOpenSession,
  onOpenPathway,
}: {
  progress: ProgressBySection;
  onOpenSession: (sessionId: string) => void;
  onOpenPathway: () => void;
}) {
  const tally = pathwayProgress(progress);
  const next: EarSessionAt | null = nextSession(progress);
  const done = next === null;

  const title = next ? next.session.title : 'Every session passed';
  const strap = next
    ? `${next.track.title} · Session ${next.indexInTrack + 1} of ${next.track.sessions.length}`
    : `${EAR_TRACKS.length} tracks · ${tally.total} sessions`;

  const label = done ? 'Practise again' : tally.passed === 0 ? 'Begin' : 'Continue';
  const target = next ? next.session.id : FULL_WHEEL.id;

  return (
    <View className="p-[18px]">
      <Face name="card" radius={16} />

      <Pressable
        onPress={onOpenPathway}
        accessibilityRole="button"
        accessibilityLabel="Open the ear pathway"
        className="active:opacity-70"
      >
        <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-accent">
          {done ? 'Pathway complete' : 'Ear pathway'}
        </Text>
        <Text className="mt-[9px] text-[26px] leading-[29px] font-semibold tracking-[-0.7px] text-ink">
          {title}
        </Text>
        <Text className="mt-[5px] text-[12.5px] leading-[18px] text-ink-muted">{strap}</Text>

        <View className="mt-[18px] flex-row items-baseline justify-between">
          <Text className="font-mono text-[22px] leading-[22px] font-medium tracking-[0.5px] text-ink">
            {tally.passed}/{tally.total}
          </Text>
          <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
            {tally.pct}% complete
          </Text>
        </View>

        <View className="mt-[12px]">
          <ProgressTrack completed={tally.passed} total={tally.total} />
        </View>
      </Pressable>

      <View className="mt-[18px] flex-row gap-[10px]">
        <Button
          variant="primary"
          size="lg"
          icon={done ? 'arrow.counterclockwise' : 'play.fill'}
          className="flex-1"
          accessibilityLabel={`${label} the ear pathway`}
          onPress={() => onOpenSession(target)}
        >
          {label}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          square
          radius={10}
          icon="list.bullet"
          accessibilityLabel="Open the ear pathway"
          onPress={onOpenPathway}
        />
      </View>
    </View>
  );
}
