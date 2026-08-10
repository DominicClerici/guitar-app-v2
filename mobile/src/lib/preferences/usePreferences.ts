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
  set: (entry: PreferenceEntry) => void;
  reset: (key: PreferenceKey) => void;
}

/**
 * Writers bound to the signed-in account. Both are no-ops before a session exists — a preference
 * written to no account could not be synced or read back, and the guest session that makes one
 * exist is created at launch (§5).
 */
export function usePreferenceWriter(): PreferenceWriter {
  const userId = useUserId();

  const set = useCallback(
    (entry: PreferenceEntry) => {
      if (userId) setPreference(userId, entry);
    },
    [userId],
  );

  const reset = useCallback(
    (key: PreferenceKey) => {
      if (userId) resetPreference(userId, key);
    },
    [userId],
  );

  return useMemo(() => ({ set, reset }), [set, reset]);
}
