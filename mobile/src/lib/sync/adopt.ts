/**
 * Moving the device's rows when the signed-in account changes (BACKEND_PLAN.md §5, §6).
 *
 * Everything local is keyed by `user_id`, and a guest claiming their account is exactly a change of
 * that id. The server does its own reassignment in `onLinkAccount`, but only for rows it has: a
 * row the guest wrote while offline exists nowhere but here, so the device has to carry it across
 * or it is lost at the moment of signing in — which is the one moment a user is most likely to
 * notice.
 *
 * Every synced table is carried, by walking the registry. A table left out would lose exactly the
 * offline work this function exists to protect, and would do it silently.
 *
 * The cursor restarts at zero afterwards. Sequence values are per-row facts about an account this
 * device has never pulled, so the only honest cursor for the new account is "nothing seen yet"; the
 * pull that follows re-reads its rows and reconciles them with whatever was carried over.
 */
import { db } from '@/lib/db/client';
import {
  deleteRowsOfOtherUsers,
  readRows,
  readSyncState,
  writeRow,
  writeSyncState,
} from '@/lib/db/rows';

import { DEVICE_SYNC_TABLE_LIST } from './tables';

export interface Owner {
  userId: string;
  isAnonymous: boolean;
}

/**
 * Hands the local database to `owner`. A no-op when the account has not changed, which is every
 * launch after the first.
 *
 * Rows are inherited only from a guest, because a guest account is the previous account's data in
 * waiting, which is the promise a guest account makes (§5). A previous owner with a real account is
 * a different person signing in on the same device, and their rows stay behind — they still exist
 * on the server for whenever that account signs in again.
 */
export function adoptUser(owner: Owner): void {
  const state = readSyncState();
  if (state.userId === owner.userId) return;

  const previous = state.userId;
  const inherits = previous !== null && state.userIsAnonymous;

  db.transaction((tx) => {
    if (inherits) {
      for (const spec of DEVICE_SYNC_TABLE_LIST) {
        const existing = new Map(
          readRows(spec, owner.userId, tx).map((row) => [spec.identity(row), row] as const),
        );

        for (const row of readRows(spec, previous, tx)) {
          // Whatever comes back is unpushed by construction: under the new account this is a write
          // the server has never seen, and it has to be pushed for the account's other devices to
          // ever learn about it.
          const carried = spec.mergeAdopted(existing.get(spec.identity(row)), row);
          if (!carried) continue;

          writeRow(spec, owner.userId, carried, tx);
        }
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
