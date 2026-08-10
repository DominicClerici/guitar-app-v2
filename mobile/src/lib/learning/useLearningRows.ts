/**
 * Reading the learner's synced rows from the device database (BACKEND_PLAN.md §6).
 *
 * `useLiveQuery` re-runs on any write to the underlying table, so a completion pulled from another
 * device redraws the pathway screen without anything having to invalidate a cache. Reads never
 * suspend and never fail: no session, or a database whose migrations have not run, is simply a
 * learner with no rows.
 */
import { pathwayEnrollments, sectionProgress } from '@guitar/db/schema.sqlite';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useMemo } from 'react';

import { useSession } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  enrollmentsSyncTable,
  progressSyncTable,
  type LocalEnrollmentRow,
} from '@/lib/sync/tables';

import { dropEvictedPathways } from './enrollment';
import { activeEnrollments, progressBySection, type ProgressBySection } from './progress';

/** No account owns this, so the queries match nothing before a session exists. */
const NOBODY = '';

export function useLearnerId(): string {
  const { data: session } = useSession();

  return session?.user.id ?? NOBODY;
}

/**
 * The pathways on the go, most recently active first, with the cap applied.
 *
 * Applying it is a write, which is why this is a hook and not a selector: `activeEnrollments`
 * decides which rows survive, but somebody has to tombstone the rest or every device would keep
 * re-deciding it forever (§7). The write settles in one pass — the next query result has nothing
 * left to evict.
 */
export function useActiveEnrollments(userId: string): LocalEnrollmentRow[] {
  const { data } = useLiveQuery(
    db.select().from(pathwayEnrollments).where(eq(pathwayEnrollments.userId, userId)),
    [userId],
  );

  const split = useMemo(
    () =>
      activeEnrollments(
        data.map((row) => enrollmentsSyncTable.toLocal(row as unknown as Record<string, unknown>)),
      ),
    [data],
  );

  useEffect(() => {
    if (userId) dropEvictedPathways(userId, split.evicted);
  }, [userId, split]);

  return split.active;
}

/** Every section this learner has touched, indexed the way the progress module wants it. */
export function useProgress(userId: string): ProgressBySection {
  const { data } = useLiveQuery(
    db.select().from(sectionProgress).where(eq(sectionProgress.userId, userId)),
    [userId],
  );

  return useMemo(
    () =>
      progressBySection(
        data.map((row) => progressSyncTable.toLocal(row as unknown as Record<string, unknown>)),
      ),
    [data],
  );
}
