import type { SkillLevel } from '@guitar/shared';
import { View } from 'react-native';

import { OptionCard } from './OptionCard';
import { StepError } from './StepError';
import { StepHeading } from './StepHeading';

/**
 * Step four: how much guitar there already is.
 *
 * Optional, and the flow's button says so by never being disabled — pressing Continue with nothing
 * chosen is an answer (`no_answer`), not a way of getting stuck. The alternative, a greyed-out
 * button with a "Skip" link beside it, makes skipping look like the wrong door; here there is one
 * door and the cards are what you may do on the way through it.
 *
 * The descriptions are what someone can recognise themselves in, so they are written as things you
 * can or cannot yet do rather than as years played. Nobody knows whether they are "intermediate";
 * everybody knows whether barre chords are still a fight.
 */

const LEVELS: { id: Exclude<SkillLevel, 'no_answer'>; title: string; description: string }[] = [
  {
    id: 'true_beginner',
    title: 'True Beginner',
    description: 'I’ve never picked one up.',
  },
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'A few open chords, and the changes are still slow.',
  },
  {
    id: 'early_intermediate',
    title: 'Early Intermediate',
    description: 'Comfortable with open chords. Barre chords are a fight.',
  },
  {
    id: 'late_intermediate',
    title: 'Late Intermediate',
    description: 'Barre chords and some scales. Learning songs by ear.',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Fluent across the neck — I improvise and play most things.',
  },
  {
    id: 'expert',
    title: 'Expert',
    description: 'Playing professionally, or close to it.',
  },
];

export function SkillStep({
  value,
  onChange,
  error,
}: {
  /** Null is no answer, which is also what an account that skipped this comes back to. */
  value: SkillLevel | null;
  onChange: (level: SkillLevel | null) => void;
  error: string | null;
}) {
  return (
    <View>
      <StepHeading title="Where are you at?">
        So we can start you somewhere that fits. Skip it if you’d rather just look around.
      </StepHeading>

      {/* One of a set, so the group carries the role and each card is a radio inside it. */}
      <View className="mt-[24px] gap-[9px]" accessibilityRole="radiogroup">
        {LEVELS.map((level) => (
          <OptionCard
            key={level.id}
            title={level.title}
            description={level.description}
            selected={value === level.id}
            mark="one"
            // Pressing the chosen one again clears it, which is the only way back to no answer
            // once something has been picked.
            onPress={() => onChange(value === level.id ? null : level.id)}
          />
        ))}
      </View>

      <StepError message={error} />
    </View>
  );
}
