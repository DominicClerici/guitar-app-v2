/**
 * Which step the flow belongs on, read off the account rather than counted.
 *
 * There is no "onboarding finished" flag anywhere. A step is owed because the thing it collects is
 * missing, so the answer is derived from the session's user every time it is asked. That is what
 * makes the three cases one case: someone who has just created an account is missing everything,
 * someone signing in again is missing nothing and never sees the flow, and someone who quit
 * halfway comes back to the first thing they still owe.
 *
 * Adding a step is therefore a field to check here and a screen to render — nothing has to be
 * migrated, and nothing can disagree about where a half-finished account got to.
 */
import { parseLearningGoals, parseSkillLevel } from '@guitar/shared';

/**
 * `code` is the exception: it is not derivable from the account, because waiting for a code is
 * something the flow is doing rather than something the user is missing. It is set by the flow
 * when a code goes out and left again when one comes back.
 */
export type OnboardingStep = 'account' | 'code' | 'name' | 'skill' | 'goals' | 'terms' | 'done';

/**
 * The steps that come after the account exists, in order — which is also the order the progress
 * dots count. `account` and `code` are deliberately absent: at that point nobody has agreed to a
 * flow yet, and telling them it is six screens long is a reason to leave.
 */
export const PROFILE_STEPS = ['name', 'skill', 'goals', 'terms'] as const;
export type ProfileStep = (typeof PROFILE_STEPS)[number];

export function isProfileStep(step: OnboardingStep): step is ProfileStep {
  return (PROFILE_STEPS as readonly string[]).includes(step);
}

/**
 * The parts of the session user this reads, kept structural so the module stays pure — it must not
 * reach a native import, and it is the only place the flow's shape is pinned down by tests.
 *
 * The three onboarding fields are `unknown` because that is honestly what they are: nullable
 * columns Better Auth hands back as it found them. Narrowing happens below, through the shared
 * parsers, so a value this build does not recognise counts as answered rather than re-asking.
 */
export interface OnboardingUser {
  name?: string | null;
  isAnonymous?: boolean | null;
  /** JSON from the server, so it is whatever the column held; narrowed on the way out. */
  oauthProfile?: unknown;
  skillLevel?: unknown;
  goals?: unknown;
  termsAcceptedAt?: unknown;
}

function filled(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Whether the terms have been accepted. Any instant counts, however it was serialised — the column
 * is a timestamp, but it reaches here as whatever JSON made of it, and the only question being
 * asked is whether something is there.
 */
function accepted(value: unknown): boolean {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === 'string') return filled(value) && !Number.isNaN(Date.parse(value));
  return typeof value === 'number' && Number.isFinite(value);
}

export function nextStep(user: OnboardingUser | null | undefined): OnboardingStep {
  // A guest is signed in but has claimed nothing, which is exactly the state the account step
  // exists for. Absent is treated as a real account: not every response carries the field, and
  // reading absent as "guest" would send a signed-in person back to the start.
  if (!user || user.isAnonymous === true) return 'account';

  if (!filled(user.name)) return 'name';

  // Both of these are optional to *answer*, not optional to *reach*: declining leaves `no_answer`
  // or an empty array behind, so what is being tested here is whether the question was ever put.
  if (parseSkillLevel(user.skillLevel) === null) return 'skill';
  if (parseLearningGoals(user.goals) === null) return 'goals';

  if (!accepted(user.termsAcceptedAt)) return 'terms';

  return 'done';
}

/**
 * What to put in the name field before anyone types. Apple and Google supply a name and the server
 * files it under `oauthProfile` rather than in `user.name` — so the step is still asked for, and
 * the provider's answer is the suggestion rather than the decision.
 */
export function suggestedName(user: OnboardingUser | null | undefined): string {
  const profile = user?.oauthProfile;
  if (typeof profile !== 'object' || profile === null) return '';

  const name = (profile as { name?: unknown }).name;
  return typeof name === 'string' && filled(name) ? name.trim() : '';
}
