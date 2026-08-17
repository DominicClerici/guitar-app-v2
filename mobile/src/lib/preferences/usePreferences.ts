/**
 * Reading preferences from the device database (BACKEND_PLAN.md §6).
 *
 * `useLiveQuery` re-runs on any write to the underlying table, so a value pulled from another
 * device appears on screen without anything having to invalidate a cache. Reads never suspend and
 * never fail: an account with nothing stored — or a database whose migrations did not run — folds
 * to `DEFAULT_PREFERENCES`.
 */
import { userPreferences } from '@guitar/db/schema.sqlite';
import {
  foldPreferences,
  type PreferenceEntry,
  type PreferenceKey,
  type Preferences,
} from '@guitar/shared';
import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useCallback, useMemo } from 'react';

import { db } from '@/lib/db';
import { useSession } from '@/lib/auth';

import { resetPreference, setPreference } from './store';

/** No account owns this, so the query matches nothing before a session exists. */
const NOBODY = '';

function useUserId(): string {
  const { data: session } = useSession();

  return session?.user.id ?? NOBODY;
}

export function usePreferences(): Preferences {
  const userId = useUserId();

  const { data } = useLiveQuery(
    db.select().from(userPreferences).where(eq(userPreferences.userId, userId)),
    [userId],
  );

  return useMemo(
    // Tombstoned rows are deletions this device has not pushed yet; the preference they name is
    // back at its default, which is what leaving them out produces.
    () => foldPreferences(data.filter((row) => row.deletedAt === null)),
    [data],
  );
}

export interface PreferenceWriter {
  /** True once the value is stored on the device. False means nothing was written at all. */
  set: (entry: PreferenceEntry) => boolean;
  reset: (key: PreferenceKey) => boolean;
}

/**
 * Reports whether the write landed, swallowing what stopped it.
 *
 * A caller gets one answer rather than two — false, or an exception — because there is only one
 * thing to do about either: put the control back where it was and say so. The local database
 * failing is not a case any screen can recover from, so the detail is for the log, not the user.
 *
 * Only the write is guarded. `setPreference` asks for a sync afterwards, and that call cannot fail
 * here: it sets a timer, and the run it schedules keeps its own failures to itself (§6).
 */
function attempt(write: () => void): boolean {
  try {
    write();
    return true;
  } catch (error) {
    if (__DEV__) console.warn('[preferences] write failed', error);
    return false;
  }
}

/**
 * Writers bound to the signed-in account. Both refuse before a session exists — a preference
 * written to no account could not be synced or read back — and refusing is not the same as
 * quietly doing nothing: the caller is told, so a control that moved can move back. The guest
 * session that makes an account exist is created at launch (§5), so this is a narrow window.
 */
export function usePreferenceWriter(): PreferenceWriter {
  const userId = useUserId();

  const set = useCallback(
    (entry: PreferenceEntry) => (userId ? attempt(() => setPreference(userId, entry)) : false),
    [userId],
  );

  const reset = useCallback(
    (key: PreferenceKey) => (userId ? attempt(() => resetPreference(userId, key)) : false),
    [userId],
  );

  return useMemo(() => ({ set, reset }), [set, reset]);
}
