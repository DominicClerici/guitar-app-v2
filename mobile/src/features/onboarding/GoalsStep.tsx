import type { LearningGoal } from '@guitar/shared';
import { Text, View } from 'react-native';

import { SelectableChip } from '@/components/SelectableChip';

import { StepError } from './StepError';
import { StepHeading } from './StepHeading';

/**
 * Step five: what they came here to do. Any number of them, or none.
 *
 * Chips rather than cards, and that is the difference between this step and the one before it:
 * skill level is one answer that needs a sentence to recognise yourself in, and these are eight
 * short things you either want or don't. A column of eight cards would also be a scroll, where a
 * wrapped set is one glance.
 *
 * Optional in the same way as the skill step — the flow's button is never disabled, and pressing it
 * with nothing chosen stores an empty set, which is an answer rather than a gap.
 */

const GOALS: { id: LearningGoal; label: string }[] = [
  { id: 'get_started', label: 'Get started with the guitar' },
  { id: 'learn_chords', label: 'Learn chords' },
  { id: 'learn_scales', label: 'Learn scales' },
  { id: 'music_theory', label: 'Understand music theory' },
  { id: 'rhythm', label: 'Practice rhythm and timing' },
  { id: 'ear_training', label: 'Train my ear' },
  { id: 'play_songs', label: 'Play songs I love' },
  { id: 'write_music', label: 'Write my own music' },
];

export function GoalsStep({
  value,
  onChange,
  error,
}: {
  value: readonly LearningGoal[];
  onChange: (goals: readonly LearningGoal[]) => void;
  error: string | null;
}) {
  const toggle = (id: LearningGoal) => {
    onChange(value.includes(id) ? value.filter((goal) => goal !== id) : [...value, id]);
  };

  return (
    <View>
      <StepHeading title="What do you want to do?">
        Pick as many as you like. Nothing here locks you in — it just shapes what we put in front of
        you first.
      </StepHeading>

      <View className="mt-[24px] flex-row flex-wrap gap-[7px]">
        {GOALS.map((goal) => (
          <SelectableChip
            key={goal.id}
            selected={value.includes(goal.id)}
            size="md"
            onPress={() => toggle(goal.id)}
          >
            {goal.label}
          </SelectableChip>
        ))}
      </View>

      <StepError message={error} />

      {/* Only once something is chosen. Before that the count is zero and saying so is noise. */}
      {value.length > 0 ? (
        <Text className="mt-[14px] text-center text-[12.5px] text-ink-faint">
          {value.length} selected
        </Text>
      ) : null}
    </View>
  );
}
