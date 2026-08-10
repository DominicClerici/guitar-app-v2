/**
 * Moving the device's rows when the signed-in account changes (BACKEND_PLAN.md §5, §6).
 *
 * Everything local is keyed by `user_id`, and a guest claiming their account is exactly a change of
 * that id. The server does its own reassignment in `onLinkAccount`, but only for rows it has: a
 * preference the guest set while offline exists nowhere but here, so the device has to carry it
 * across or it is lost at the moment of signing in — which is the one moment a user is most likely
 * to notice.
 *
 * The cursor restarts at zero afterwards. Sequence values are per-row facts about an account this
 * device has never pulled, so the only honest cursor for the new account is "nothing seen yet"; the
 * pull that follows re-reads its rows and reconciles them with whatever was carried over.
 */
import { db } from '@/lib/db/client';
import {
  deleteRowsOfOtherUsers,
  readPreferenceRows,
  readSyncState,
  writePreferenceRow,
  writeSyncState,
} from '@/lib/db/rows';

import { acceptsAdopted } from './reconcile';

export interface Owner {
  userId: string;
  isAnonymous: boolean;
}

/**
 * Hands the local database to `owner`. A no-op when the account has not changed, which is every
 * launch but the first after a sign-in.
 *
 * Rows follow the previous owner only if that owner was a **guest**: their data was always this
 * account's data in waiting, which is the promise a guest account makes (§5). A previous owner with
 * a real account is a different person signing in on the same device, and their preferences stay
 * behind — they still exist on the server for whenever that account signs in again.
 */
export function adoptUser(owner: Owner): void {
  const state = readSyncState();
  if (state.userId === owner.userId) return;

  const inherits = state.userId !== null && state.userIsAnonymous;

  db.transaction((tx) => {
    if (inherits && state.userId) {
      const existing = new Map(readPreferenceRows(owner.userId, tx).map((row) => [row.key, row]));

      for (const row of readPreferenceRows(state.userId, tx)) {
        if (!acceptsAdopted(existing.get(row.key), row)) continue;

        // `serverSeq: null` regardless of what the row carried: under the new account this is a
        // write the server has never seen, and it has to be pushed for the account's other devices
        // to ever learn about it.
        writePreferenceRow(owner.userId, { ...row, serverSeq: null }, tx);
      }
    }

    deleteRowsOfOtherUsers(owner.userId, tx);
    writeSyncState(
      {
        userId: owner.userId,
        userIsAnonymous: owner.isAnonymous,
        cursor: 0,
        lastPulledAt: null,
      },
      tx,
    );
  });
}
