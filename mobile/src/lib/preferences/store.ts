/**
 * Writing preferences (BACKEND_PLAN.md §6, §7).
 *
 * A write lands in the local database and returns — there is no request to await and no failure
 * state for a screen to render. Sync is asked for afterwards and is free to take as long as it
 * takes, including forever, because the value the user chose is already saved.
 *
 * `Date.now()` is the merge input, so it is stamped once, here, at the moment of the write.
 */
import type { PreferenceEntry, PreferenceKey } from '@guitar/shared';

import { writePreferenceRow } from '@/lib/db/rows';
import { requestSync } from '@/lib/sync/engine';

/** Sets one preference for `userId`, and nudges sync. */
export function setPreference(userId: string, entry: PreferenceEntry): void {
  writePreferenceRow(userId, {
    key: entry.key,
    value: entry.value,
    clientUpdatedAt: Date.now(),
    deletedAt: null,
    // Null marks it as unsent — this is the flag the push path reads.
    serverSeq: null,
  });

  requestSync();
}

/**
 * Returns a preference to its default, everywhere.
 *
 * Stored as a tombstone rather than removed, because a removal is indistinguishable from "this
 * device never had it" and would be undone by the next pull (§7). The row keeps no value: a
 * tombstone's value is never read, on either side.
 */
export function resetPreference(userId: string, key: PreferenceKey): void {
  const now = Date.now();

  writePreferenceRow(userId, {
    key,
    value: '',
    clientUpdatedAt: now,
    deletedAt: now,
    serverSeq: null,
  });

  requestSync();
}
