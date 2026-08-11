/**
 * What finishing an activity leaves behind (BACKEND_PLAN.md §6, §7).
 *
 * One row, written locally and not awaited, with sync nudged afterwards — the same posture as
 * `lib/learning/completion.ts` and `features/quiz/record.ts`, and for the same reason: the result
 * is already saved by the time this returns, so no screen renders a spinner or an error for it.
 *
 * What makes writing it safe is that it can never move a number. An activity section is always
 * `optional: true` — the publisher enforces it — and `countedSections` drops optional sections
 * before any tally is taken, so neither `chapterProgress` nor `pathwayProgress` can see this row.
 * It buys exactly one thing: the tick on the section's own row, on every device the account
 * reaches.
 *
 * `bestScorePct` is null because activities are not graded. That is safe rather than merely
 * empty: the progress table folds the field with `greatest` (sync/tables/progress.ts), and a null
 * is not greater than anything, so this write cannot disturb a score a quiz earned — not on this
 * section, and not on any other, since the row is keyed by section id.
 */
import { writeLocalRow } from '@/lib/db/rows';
import { requestSync } from '@/lib/sync';
import { progressSyncTable } from '@/lib/sync/tables';

/**
 * Marks an activity section done.
 *
 * Both arguments are nullable because both are genuinely optional at the call site: an activity
 * opened from the library rather than from a pathway has no section to record against, and a
 * device with no session yet has no account to record under. Either way the run itself still
 * happened and still counted for the learner — there is simply nowhere to put it.
 */
export function recordActivityCompletion(userId: string | null, sectionId: string | null): void {
  if (!userId || !sectionId) return;

  writeLocalRow(progressSyncTable, userId, {
    sectionId,
    completedAt: Date.now(),
    bestScorePct: null,
    deletedAt: null,
    // Null marks the row unsent — this is the flag the push path reads.
    serverSeq: null,
  });

  requestSync();
}
