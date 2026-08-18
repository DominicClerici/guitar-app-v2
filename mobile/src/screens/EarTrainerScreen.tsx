import { useRef } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Easing,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import { TransportButton } from '@/components/TransportButton';
import {
  DegreeCircle,
  TRAINER_FALLBACK,
  TrainerConfigSheet,
  useTrainer,
  type DegreeMark,
  type TrainerConfigSheetRef,
  type UseTrainerResult,
} from '@/features/ear-trainer';
import { chromaticName, toAccidentalGlyphs } from '@/lib/accidentals';
import { useAccidentalSide } from '@/lib/preferences';

/** One half of the aura's breath. Slow enough to be felt rather than watched. */
const BREATH_MS = 2800;
const EASE = { duration: BREATH_MS, easing: Easing.inOut(Easing.quad) };

/**
 * Free Play: a drone, a tone, and your ear. One surface, two states — with the
 * drone running the circle is an open instrument, and training is something
 * you switch on over it. The question loop never leaves this screen: answers,
 * verdicts and comparisons all happen on the same ring of twelve degrees.
 */
export function EarTrainerScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const trainer = useTrainer();
  const sheet = useRef<TrainerConfigSheetRef>(null);

  const circleSize = Math.min(width - 44, 352);
  const inQuestion = trainer.training && trainer.phase === 'question';
  const wrongHold =
    trainer.phase === 'reveal' && trainer.verdict !== null && !trainer.verdict.correct;

  const marks: Partial<Record<number, DegreeMark>> | undefined =
    trainer.phase === 'reveal' && trainer.verdict
      ? trainer.verdict.correct
        ? { [trainer.verdict.degree]: 'correct' }
        : { [trainer.verdict.pick]: 'wrong', [trainer.verdict.degree]: 'correct' }
      : undefined;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[44px] flex-row items-center px-[18px]">
        <BackLink title="Free Play" />

        <Button
          variant="ghost"
          size="inline"
          square
          icon="slider.horizontal.3"
          hitSlop={10}
          className="ml-auto"
          accessibilityLabel="Training settings"
          onPress={() => sheet.current?.present()}
        />
      </View>

      <View className="px-[18px] pt-[2px]">
        <TrainerReadout trainer={trainer} />
      </View>

      <View className="flex-1 items-center justify-center">
        <DegreeCircle
          size={circleSize}
          activeDegrees={trainer.config.degrees}
          dimInactive={trainer.training}
          lockInactive={inQuestion}
          sounding={trainer.sounding}
          marks={marks}
          onPress={trainer.tapDegree}
        >
          {trainer.training ? <ReplayKey onPress={trainer.replay} /> : null}
        </DegreeCircle>

        {/* Fixed height, so the circle never shifts as guidance comes and goes. */}
        <View className="mt-[10px] h-[52px] items-center justify-center px-[18px]">
          {wrongHold ? (
            <ContinuePill onPress={trainer.continueNext} />
          ) : (
            <Text className="text-center font-mono text-[9.5px] uppercase tracking-[1.8px] text-ink-faint">
              {hintFor(trainer)}
            </Text>
          )}
        </View>
      </View>

      <View
        className="flex-row items-center justify-center gap-[16px] border-t border-t-line-soft bg-bg pt-[12px]"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TransportButton running={trainer.running} what="drone" onPress={trainer.toggleDrone} />
        <TrainPill
          training={trainer.training}
          disabled={!trainer.running}
          onPress={trainer.training ? trainer.endTraining : trainer.startTraining}
        />
      </View>

      <TrainerConfigSheet
        ref={sheet}
        config={trainer.config}
        onDegrees={trainer.setDegrees}
        onKeyPolicy={trainer.setKeyPolicy}
      />
    </View>
  );
}

function hintFor(trainer: UseTrainerResult): string {
  if (!trainer.running) return 'Start the drone to begin';
  if (!trainer.training) return 'Tap a degree to hear it against the drone';
  if (trainer.phase === 'question') return 'Which degree was that?';
  return 'Got it';
}

/**
 * The ground everything is heard against: the key, and whether it is sounding.
 * The aura breathes while the drone runs — the same signal the drone screen
 * gives, because it is the same kind of fact.
 */
function TrainerReadout({ trainer }: { trainer: UseTrainerResult }) {
  const { running, tonicPc, training, stats } = trainer;
  // The drone's home is any of the twelve, with nothing to spell it against — a free choice.
  const side = useAccidentalSide(TRAINER_FALLBACK);

  const aura = useAnimatedStyle(
    () => ({
      opacity: running
        ? withSequence(
            withTiming(0.45, { duration: 700 }),
            withRepeat(withTiming(1, EASE), -1, true),
          )
        : withTiming(0, { duration: 700 }),
      transform: [
        {
          scale: running
            ? withSequence(
                withTiming(0.95, { duration: 700 }),
                withRepeat(withTiming(1.14, EASE), -1, true),
              )
            : withTiming(0.9, { duration: 700 }),
        },
      ],
    }),
    [running],
  );

  const figures =
    training && stats && stats.asked > 0
      ? ` · ${stats.streak} streak · ${Math.round(stats.accuracy * 100)}%`
      : '';

  return (
    <View className="items-center justify-center py-[4px]">
      <View className="pointer-events-none absolute inset-0 items-center justify-center">
        <AnimatedView className="h-[130px] w-[130px] rounded-full bg-accent-wash" style={aura} />
      </View>

      <Text
        className={`text-[42px] font-semibold leading-[48px] tracking-[-1.2px] ${
          running ? 'text-ink' : 'text-ink-faint'
        }`}
      >
        {toAccidentalGlyphs(chromaticName(tonicPc, side))}
      </Text>

      <Text className="mt-[7px] font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
        <Text className={running ? 'text-accent' : undefined}>
          {running ? 'Sounding' : 'Silent'}
        </Text>
        {' · drone'}
        {figures}
      </Text>
    </View>
  );
}

/** Re-hear the question, from the one place your eye already is. */
function ReplayKey({ onPress }: { onPress: () => void }) {
  return (
    <Button
      variant="secondary"
      size="lg"
      square
      radius={999}
      icon="arrow.counterclockwise"
      hitSlop={6}
      accessibilityLabel="Replay the question tone"
      onPress={onPress}
    />
  );
}

function TrainPill({
  training,
  disabled,
  onPress,
}: {
  training: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      variant={training ? 'soft' : 'secondary'}
      size="lg"
      radius={999}
      disabled={disabled}
      accessibilityLabel={training ? 'End training' : 'Start training'}
      onPress={onPress}
    >
      {training ? 'End training' : 'Start training'}
    </Button>
  );
}

function ContinuePill({ onPress }: { onPress: () => void }) {
  return (
    <Button
      variant="soft"
      size="md"
      radius={999}
      accessibilityLabel="Next question"
      onPress={onPress}
    >
      Continue
    </Button>
  );
}
