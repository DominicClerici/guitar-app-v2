/**
 * The `user_preferences` half of device sync (BACKEND_PLAN.md §6, §7).
 *
 * Everything loop-shaped is generic over the table. This is the part that cannot be: what a
 * preference row looks like in SQLite, what it looks like on the wire, and which of §7's merge
 * rules it converges under — last-write-wins, on a per-key row.
 */
import { userPreferences } from '@guitar/db/schema.sqlite';
import {
  isPreferenceKey,
  preferenceEntry,
  type PreferenceMutation,
  type PreferenceSyncRow,
} from '@guitar/shared';

import { lastWriteWinsAcceptsAdopted, lastWriteWinsAcceptsRemote } from '../reconcile';
import type { DeviceSyncTable, LocalSyncRow } from '../spec';

/** A stored preference as the device holds it, with instants as epoch milliseconds. */
export interface LocalPreferenceRow extends LocalSyncRow {
  key: string;
  value: string;
  clientUpdatedAt: number;
}

/** The row shape Drizzle hands back from a select on this table. */
interface SelectedPreferenceRow {
  key: string;
  value: string;
  clientUpdatedAt: Date;
  deletedAt: Date | null;
  serverSeq: number | null;
}

function fromWire(wire: PreferenceSyncRow): LocalPreferenceRow {
  return {
    key: wire.key,
    value: wire.value,
    clientUpdatedAt: wire.clientUpdatedAt,
    deletedAt: wire.deletedAt,
    serverSeq: wire.serverSeq,
  };
}

export const preferencesSyncTable: DeviceSyncTable<'userPreferences', LocalPreferenceRow> = {
  name: 'userPreferences',
  table: userPreferences,
  userField: 'userId',
  // The identity a client pushes under is (user, key) rather than a generated id: the pair already
  // names the row, which is what makes a replayed push converge.
  conflictFields: ['userId', 'key'],

  identity: (row) => row.key,
  wireIdentity: (wire) => wire.key,

  toLocal(row) {
    const { key, value, clientUpdatedAt, deletedAt, serverSeq } =
      row as unknown as SelectedPreferenceRow;

    return {
      key,
      value,
      clientUpdatedAt: clientUpdatedAt.getTime(),
      deletedAt: deletedAt?.getTime() ?? null,
      serverSeq,
    };
  },

  toValues(userId, row) {
    return {
      userId,
      key: row.key,
      value: row.value,
      clientUpdatedAt: new Date(row.clientUpdatedAt),
      deletedAt: row.deletedAt === null ? null : new Date(row.deletedAt),
      serverSeq: row.serverSeq,
    };
  },

  fromWire,

  /**
   * A row is dropped when its key or value no longer parses, which can only happen after a
   * downgrade below the build that wrote it. Dropping one row is the alternative to the server
   * rejecting the whole batch and no preference on the device ever syncing again.
   */
  toMutation(row): PreferenceMutation | null {
    if (!isPreferenceKey(row.key)) return null;

    // A tombstone carries no value, so it only needs a key the server will recognise.
    if (row.deletedAt !== null) {
      return { op: 'delete', key: row.key, clientUpdatedAt: row.clientUpdatedAt };
    }

    const parsed = preferenceEntry.safeParse({ key: row.key, value: row.value });
    if (!parsed.success) return null;

    return { op: 'upsert', entry: parsed.data, clientUpdatedAt: row.clientUpdatedAt };
  },

  /** The whole row moves or none of it does, which is what last-write-wins means (§7). */
  merge(local, remote) {
    return lastWriteWinsAcceptsRemote(local, remote) ? fromWire(remote) : null;
  },

  mergeAdopted(existing, adopted) {
    if (!lastWriteWinsAcceptsAdopted(existing, adopted)) return null;

    return { ...adopted, serverSeq: null };
  },

  /** The app stamps a fresh `clientUpdatedAt` on every write, so the new row simply wins. */
  mergeLocal(_existing, incoming) {
    return { ...incoming, serverSeq: null };
  },
};
