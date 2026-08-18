/**
 * The one reader of the preferences table (BACKEND_PLAN.md §6).
 *
 * Renders nothing of its own and blocks nothing. Everything downstream reads the published
 * snapshot, which starts at `DEFAULT_PREFERENCES` and is replaced as soon as the query answers —
 * so a device whose migrations have not finished, or whose guest session does not exist yet, is
 * in exactly the state an account that has never changed anything is in.
 *
 * What it publishes is each preference *as it applies*, which for `reduceMotion` is not always
 * what is stored — see below.
 */
import { userPreferences } from '@guitar/db/schema.sqlite';
import { foldPreferences } from '@guitar/shared';
import { useEffect, useMemo, type ReactNode } from 'react';

import { useSession } from '@/lib/auth';
import { useDatabaseMigrations } from '@/lib/db';
import { useLiveRows } from '@/lib/db/live';
import { readRows } from '@/lib/db/rows';
import { preferencesSyncTable } from '@/lib/sync/tables';

import { publishPreferences } from './snapshot';
import { useSystemReduceMotion } from './system';

/** No account owns this, so the query matches nothing before a session exists. */
const NOBODY = '';

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { ready } = useDatabaseMigrations();
  const { data: session } = useSession();
  const systemReduceMotion = useSystemReduceMotion();

  const userId = session?.user.id ?? NOBODY;

  // `ready` is a dependency rather than a guard. The query is harmless against a database whose
  // migrations have not run — it answers with nothing — but it has to be asked again once they
  // have, and no change event will do that on its own: nothing writes to a table that was not
  // there to write to.
  const rows = useLiveRows(
    userPreferences,
    () => readRows(preferencesSyncTable, userId),
    `${userId}:${ready}`,
  );

  const preferences = useMemo(() => {
    // Tombstoned rows are deletions this device has not pushed yet; the preference they name is
    // back at its default, which is what leaving them out produces.
    const live = rows.filter((row) => row.deletedAt === null);
    const folded = foldPreferences(live);

    // `reduceMotion` is the one value that is not simply read out of the table. Its stored default
    // is off, because both halves of sync have to agree on what an absent row means — but a phone
    // with Reduce Motion switched on has already answered this question, and making someone answer
    // it again in a settings screen they have to find first is not an accessibility setting, it is
    // a quiz. So while the row is absent, the device's own setting stands in for it.
    //
    // The moment something is chosen here the row exists, and from then on the choice wins on this
    // device and on every other — which is the whole reason nothing is written on the user's
    // behalf. A silent seeding write would carry one phone's system setting onto a second device
    // that has its own, and there would be no way left to tell the two apart.
    if (live.some((row) => row.key === 'reduceMotion')) return folded;

    return { ...folded, reduceMotion: systemReduceMotion ? ('on' as const) : ('off' as const) };
  }, [rows, systemReduceMotion]);

  useEffect(() => {
    publishPreferences(preferences);
  }, [preferences]);

  return children;
}
