import { z } from 'zod';

/**
 * What onboarding asks for beyond a name, as the vocabulary both sides agree on.
 *
 * These live on the `user` table rather than in `user_preferences` for one reason: onboarding's
 * next step is derived from the session's account (`mobile/src/features/onboarding/steps.ts`), and
 * the session carries the account the instant a sign-in returns. A preference row does not — it
 * arrives by sync, so a returning user on a new device would fold to defaults and be asked all of
 * this again before the first pull landed.
 *
 * Null is the answer to "has this been asked?", and it is the only thing that means not yet. Both
 * of the optional questions have a way of saying nothing that is still an answer — `no_answer` and
 * the empty array — so declining to pick leaves a value behind rather than a gap that would send
 * someone back to the step forever.
 */

/**
 * How much guitar someone has already played, in their own estimate.
 *
 * `no_answer` is a member of the enum rather than a null: skipping the question is a thing the
 * screen lets you do, and the record of having skipped it is what stops the step being owed again.
 */
export const skillLevel = z.enum([
  'no_answer',
  'true_beginner',
  'beginner',
  'early_intermediate',
  'late_intermediate',
  'advanced',
  'expert',
]);
export type SkillLevel = z.infer<typeof skillLevel>;

/** What someone came here to do. Several at once, or none. */
export const learningGoal = z.enum([
  'get_started',
  'learn_chords',
  'learn_scales',
  'music_theory',
  'rhythm',
  'ear_training',
  'play_songs',
  'write_music',
]);
export type LearningGoal = z.infer<typeof learningGoal>;

/**
 * The set of goals as stored. Unknown members are dropped rather than thrown on, under the same
 * forward-compatibility rule as `foldPreferences`: a goal added by a newer build must not break an
 * older one reading the same account back.
 */
export const learningGoals = z
  .array(z.string())
  .transform((values) =>
    values.filter((value): value is LearningGoal => learningGoal.safeParse(value).success),
  );

export function isLearningGoal(value: string): value is LearningGoal {
  return learningGoal.safeParse(value).success;
}

/**
 * Narrows what the server sent for `skillLevel` — which is a nullable text column, so it is
 * whatever was written to it. An unrecognised value reads as `no_answer`: the question has been
 * answered, and this build has no idea with what, which is not a reason to ask it again.
 */
export function parseSkillLevel(value: unknown): SkillLevel | null {
  if (value === null || value === undefined) return null;

  const parsed = skillLevel.safeParse(value);
  return parsed.success ? parsed.data : 'no_answer';
}

/** The counterpart for `goals`. Absent stays absent; anything else folds to the goals it knows. */
export function parseLearningGoals(value: unknown): LearningGoal[] | null {
  if (value === null || value === undefined) return null;

  const parsed = learningGoals.safeParse(value);
  return parsed.success ? parsed.data : [];
}
