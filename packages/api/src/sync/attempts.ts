/**
 * The `quiz_attempts` half of sync (BACKEND_PLAN.md §7).
 *
 * Append-only: an attempt is an event, immutable once written, so the row already on the server
 * always wins and a replayed push is a no-op. That is what lets attempt counts and history be
 * *derived* from these rows rather than kept as a mutable counter somewhere — a counter would have
 * to be summed, and summing is the one merge that is neither commutative nor idempotent.
 *
 * The id is a client-generated UUIDv7 (§7). Unlike a preference, whose `(user_id, key)` already
 * names the row, an event has nothing else to identify it — and without the client naming it, a
 * push replayed after a dropped connection would record the same attempt twice.
 */
import { pgSchema } from '@guitar/db';
import type { QuizAttemptMutation, QuizAttemptSyncRow } from '@guitar/shared';
import { and, eq, inArray } from 'drizzle-orm';

import type { ServerSyncTable } from './spec';

const { quizAttempts } = pgSchema;

interface AttemptSelection {
  attemptId: string;
  sectionId: string;
  scorePct: number;
  passed: boolean;
  answeredAt: Date;
  deletedAt: Date | null;
  serverSeq: number;
}

/** First writing of an id wins, which is the same answer `ON CONFLICT DO NOTHING` gives. */
function firstPerAttempt(mutations: QuizAttemptMutation[]): QuizAttemptMutation[] {
  const seen = new Map<string, QuizAttemptMutation>();

  for (const mutation of mutations) {
    if (!seen.has(mutation.attemptId)) seen.set(mutation.attemptId, mutation);
  }

  return [...seen.values()];
}

export const attemptsSyncTable: ServerSyncTable<'quizAttempts'> = {
  name: 'quizAttempts',
  table: quizAttempts,
  userId: quizAttempts.userId,
  serverSeq: quizAttempts.serverSeq,

  selection: {
    attemptId: quizAttempts.attemptId,
    sectionId: quizAttempts.sectionId,
    scorePct: quizAttempts.scorePct,
    passed: quizAttempts.passed,
    answeredAt: quizAttempts.answeredAt,
    deletedAt: quizAttempts.deletedAt,
    serverSeq: quizAttempts.serverSeq,
  },

  toWire(row): QuizAttemptSyncRow {
    const selected = row as unknown as AttemptSelection;

    return {
      attemptId: selected.attemptId,
      sectionId: selected.sectionId,
      scorePct: selected.scorePct,
      passed: selected.passed,
      answeredAt: selected.answeredAt.getTime(),
      deletedAt: selected.deletedAt?.getTime() ?? null,
      serverSeq: selected.serverSeq,
    };
  },

  dedupe: firstPerAttempt,

  toValues(userId, mutation) {
    return {
      attempt_id: mutation.attemptId,
      user_id: userId,
      section_id: mutation.sectionId,
      score_pct: mutation.scorePct,
      passed: mutation.passed,
      answered_at: new Date(mutation.answeredAt).toISOString(),
      deleted_at: null,
    };
  },

  /**
   * Matched by id rather than by section: the read-back has to answer for the exact rows the batch
   * named, and an attempt that lost to one already stored is precisely what the device needs told.
   */
  settledWhere(userId, mutations) {
    return and(
      eq(quizAttempts.userId, userId),
      inArray(
        quizAttempts.attemptId,
        mutations.map((mutation) => mutation.attemptId),
      ),
    );
  },
};
