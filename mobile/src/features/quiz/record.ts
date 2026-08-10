/**
 * What finishing a quiz leaves behind (BACKEND_PLAN.md §6, §7).
 *
 * Two rows land in the local database and the function returns; sync is asked for afterwards and
 * is free to take as long as it takes, including forever, because the result is already saved.
 * Same posture as `lib/preferences/store.ts` — nothing is awaited and no screen renders a spinner
 * or an error for it.
 *
 * `Date.now()` is stamped once, here, and used for both rows so the attempt and the completion it
 * produced agree about when the learner finished.
 */
import { writeLocalRow } from '@/lib/db/rows';
import type { QuizScore } from '@/lib/quiz';
import { requestSync } from '@/lib/sync';
import { attemptsSyncTable, progressSyncTable } from '@/lib/sync/tables';
import { uuidv7 } from '@/lib/uuid';

/**
 * Records one finished attempt against `sectionId`.
 *
 * `sectionId` is whatever the caller opened the quiz with, not the quiz slug. For a checkpoint
 * that is `checkpointSectionId(chapter)` — the derived id `lib/learning` reads the gate from — so
 * a result written under any other id would leave the chapter locked forever.
 *
 * The progress row carries *this* attempt's own values rather than a maximum worked out here. The
 * table's merge folds `completedAt` to the earliest and `bestScorePct` to the greatest on both
 * sides (sync/tables/progress.ts), so computing a high-water mark on this side would be a second,
 * disagreeing implementation of the same rule.
 */
export function recordAttempt(userId: string, sectionId: string, score: QuizScore): void {
  // A quiz with nothing gradable in it is not a result. It scores 100 so the learner is not shown a
  // zero for questions this build could not render (see `scoreQuiz`), but writing that would be
  // worse than the lockout it avoids: `best_score_pct` merges upwards, so a build too old to read
  // the questions would mark the checkpoint passed on every one of the account's devices —
  // including the up-to-date one that can render them — and nothing can lower it again.
  if (score.total === 0) return;

  const answeredAt = Date.now();

  writeLocalRow(attemptsSyncTable, userId, {
    // Minted on the device so a replayed push lands on the same row instead of a second attempt.
    attemptId: uuidv7(),
    sectionId,
    scorePct: score.scorePct,
    passed: score.passed,
    answeredAt,
    deletedAt: null,
    // Null marks the row unsent — this is the flag the push path reads.
    serverSeq: null,
  });

  writeLocalRow(progressSyncTable, userId, {
    sectionId,
    completedAt: answeredAt,
    bestScorePct: score.scorePct,
    deletedAt: null,
    serverSeq: null,
  });

  requestSync();
}
