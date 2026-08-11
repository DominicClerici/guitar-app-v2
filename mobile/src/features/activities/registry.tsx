import type { ComponentType } from 'react';

import { runnableRounds, type ActivityBody, type ActivityDocument } from '@/lib/content';

import { NotePlayRunner } from './note-play/NotePlayRunner';
import { RhythmRunner } from './rhythm/RhythmRunner';

// The activity runner registry — the ONE file to touch when adding a kind of activity (besides
// the runner itself). It is the parallel of `features/articles/registry.tsx`: an activity with no
// runner here renders the "update the app" placeholder rather than crashing the screen.
//
// The empty-activity check lives here rather than in the runners for the same reason the
// placeholder does. Whether a round is runnable is a question about the wire format — a build too
// old to read this content leaves `runnableRounds` empty — and answering it once means both
// runners can open on `rounds[0]` without a branch neither of them would ever see in testing.

interface RunnerProps<A extends ActivityBody> {
  document: ActivityDocument;
  activity: A;
  sectionId: string | null;
  userId: string | null;
  onDone: () => void;
}

export interface ActivityRunnerEntry {
  /**
   * The activity is erased to the union here so one map can hold runners for both kinds. It is
   * safe because the map is keyed on `activity.kind` and nothing else ever reaches in: an entry is
   * only ever handed the activity whose kind selected it.
   */
  Component: ComponentType<RunnerProps<ActivityBody>>;
  /** Whether this build has a round it can actually run. */
  runnable(activity: ActivityBody): boolean;
}

function define<A extends ActivityBody>(
  Component: ComponentType<RunnerProps<A>>,
  runnable: (activity: A) => boolean,
): ActivityRunnerEntry {
  return {
    Component: Component as ComponentType<RunnerProps<ActivityBody>>,
    runnable: runnable as (activity: ActivityBody) => boolean,
  };
}

/**
 * Exhaustive by construction: an arm added to `ActivityBody` and not listed here fails to
 * typecheck, which is the same guard `KNOWN_ACTIVITY_KINDS` gives the parser.
 */
const RUNNERS: Record<ActivityBody['kind'], ActivityRunnerEntry> = {
  'note-play': define(NotePlayRunner, (activity) => runnableRounds(activity.rounds).length > 0),
  rhythm: define(RhythmRunner, (activity) => runnableRounds(activity.rounds).length > 0),
};

/**
 * The runner for an activity, or null when this build has nothing to run.
 *
 * A kind with no runner registered cannot reach here as a missing key — the parser degrades any
 * kind it does not recognise into `unknown`, which the screen turns away before asking. So the
 * only null this returns is the empty-activity one, and the screen treats both the same way: they
 * are the same problem, content newer than the app, with the same answer.
 */
export function runnerFor(activity: ActivityBody): ActivityRunnerEntry | null {
  const entry = RUNNERS[activity.kind];
  return entry.runnable(activity) ? entry : null;
}
