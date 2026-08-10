/**
 * The one table-specific part of sync: turning preference rows into the wire shape and back
 * (BACKEND_PLAN.md §7).
 *
 * Everything else in `src/sync` is generic over the table — paging, and the merge statement — so
 * a second synced table is a second module like this one plus a key in the contracts, not new
 * protocol code.
 */
import { pgSchema } from '@guitar/db';
import { mutationKey, type PreferenceMutation, type PreferenceSyncRow } from '@guitar/shared';

const { userPreferences } = pgSchema;

/**
 * What a tombstone stores in a column that cannot be null.
 *
 * A delete says "this preference is back to its default", so the value it displaces is not worth
 * carrying — and under last-write-wins the whole row is replaced, so there is nowhere to keep it.
 * Clients drop the row on seeing `deleted_at`, and never read this.
 */
const TOMBSTONE_VALUE = '';

/** The columns both `pull` and `push` return. Selected explicitly: `user_id` is never sent back — the device asked as that user. */
export const preferenceSelection = {
  key: userPreferences.key,
  value: userPreferences.value,
  clientUpdatedAt: userPreferences.clientUpdatedAt,
  deletedAt: userPreferences.deletedAt,
  serverSeq: userPreferences.serverSeq,
};

export type PreferenceSelection = {
  key: string;
  value: string;
  clientUpdatedAt: Date;
  deletedAt: Date | null;
  serverSeq: number;
};

/** Instants are `timestamptz` here and epoch milliseconds on the wire (§8). */
export function toSyncRow(row: PreferenceSelection): PreferenceSyncRow {
  return {
    key: row.key,
    value: row.value,
    clientUpdatedAt: row.clientUpdatedAt.getTime(),
    deletedAt: row.deletedAt?.getTime() ?? null,
    serverSeq: row.serverSeq,
  };
}

/**
 * One mutation as a row for `mergeValuesSql`, keyed by database column name.
 *
 * `client_updated_at` doubles as a delete's `deleted_at`: one timestamp decides both whether the
 * row wins its merge and when it was tombstoned, so there is no second clock to disagree with.
 * Instants become ISO strings rather than `Date` objects — the driver would serialise them anyway,
 * and a string is what the parameter is inferred as.
 */
export function preferenceValues(
  userId: string,
  mutation: PreferenceMutation,
): Record<string, unknown> {
  const stamped = new Date(mutation.clientUpdatedAt).toISOString();

  return {
    user_id: userId,
    key: mutationKey(mutation),
    value: mutation.op === 'upsert' ? mutation.entry.value : TOMBSTONE_VALUE,
    client_updated_at: stamped,
    deleted_at: mutation.op === 'delete' ? stamped : null,
  };
}

/**
 * Reduces a batch to one mutation per key, keeping the latest.
 *
 * A device that changed the theme three times offline pushes three writes for one row, and
 * `INSERT ... ON CONFLICT` cannot touch the same row twice in a single statement — Postgres errors
 * rather than merging them. Ties keep the later of the two in the batch, which is the order the
 * device wrote them in.
 */
export function latestPerKey(mutations: readonly PreferenceMutation[]): PreferenceMutation[] {
  const latest = new Map<string, PreferenceMutation>();

  for (const mutation of mutations) {
    const previous = latest.get(mutationKey(mutation));

    if (!previous || mutation.clientUpdatedAt >= previous.clientUpdatedAt) {
      latest.set(mutationKey(mutation), mutation);
    }
  }

  return [...latest.values()];
}
