/**
 * Recording that a section has been finished (BACKEND_PLAN.md §7).
 *
 * The same shape of write as an enrollment — local, unawaited, sync nudged afterwards — but into
 * the one monotonic table, which is why it goes through `writeLocalRow` rather than `writeRow`.
 * That fold is what makes writing the same completion twice, or on two devices at once, converge on
 * the earliest `completedAt` without anything here having to check first. A raw write would instead
 * move the completion later and, because this row carries no score, null out a `bestScorePct` the
 * section's quiz had already earned.
 */
import { writeLocalRow } from '@/lib/db/rows';
import { requestSync } from '@/lib/sync/engine';
import { progressSyncTable } from '@/lib/sync/tables';

/** Marks a read section done. Quizzes write their own row, with a score. */
export function recordSectionComplete(userId: string, sectionId: string): void {
  writeLocalRow(progressSyncTable, userId, {
    sectionId,
    completedAt: Date.now(),
    // Reading is pass/fail-less. `bestScorePct` belongs to the quiz that graded something, and a
    // checkpoint is read back through exactly that field.
    bestScorePct: null,
    deletedAt: null,
    serverSeq: null,
  });

  requestSync();
}
