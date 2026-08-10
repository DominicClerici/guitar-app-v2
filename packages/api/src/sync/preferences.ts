/**
 * The `user_preferences` half of sync (BACKEND_PLAN.md §7).
 *
 * Everything protocol-shaped — paging, the merge statement, the read-back — is generic over the
 * table. This is the part that cannot be: what a preference row looks like on the wire, and how a
 * batch of preference writes collapses to one row per key under last-write-wins.
 */
import { pgSchema } from '@guitar/db';
import { mutationKey, type PreferenceMutation, type PreferenceSyncRow } from '@guitar/shared';
import { and, eq, inArray } from 'drizzle-orm';

import type { ServerSyncTable } from './spec';

const { userPreferences } = pgSchema;

/**
 * What a tombstone stores in a column that cannot be null.
 *
 * A delete says "this preference is back to its default", so the value it displaces is not worth
 * carrying — and under last-write-wins the whole row is replaced, so there is nowhere to keep it.
 * Clients drop the row on seeing `deleted_at`, and never read this.
 */
const TOMBSTONE_VALUE = '';

interface PreferenceSelection {
  key: string;
  value: string;
  clientUpdatedAt: Date;
  deletedAt: Date | null;
  serverSeq: number;
}

/**
 * Reduces a batch to one mutation per key, keeping the latest.
 *
 * Ties keep the later of the two in the batch, which is the order the device wrote them in.
 */
function latestPerKey(mutations: PreferenceMutation[]): PreferenceMutation[] {
  const latest = new Map<string, PreferenceMutation>();

  for (const mutation of mutations) {
    const previous = latest.get(mutationKey(mutation));

    if (!previous || mutation.clientUpdatedAt >= previous.clientUpdatedAt) {
      latest.set(mutationKey(mutation), mutation);
    }
  }

  return [...latest.values()];
}

export const preferencesSyncTable: ServerSyncTable<'userPreferences'> = {
  name: 'userPreferences',
  table: userPreferences,
  userId: userPreferences.userId,
  serverSeq: userPreferences.serverSeq,

  selection: {
    key: userPreferences.key,
    value: userPreferences.value,
    clientUpdatedAt: userPreferences.clientUpdatedAt,
    deletedAt: userPreferences.deletedAt,
    serverSeq: userPreferences.serverSeq,
  },

  toWire(row): PreferenceSyncRow {
    const { key, value, clientUpdatedAt, deletedAt, serverSeq } =
      row as unknown as PreferenceSelection;

    return {
      key,
      value,
      clientUpdatedAt: clientUpdatedAt.getTime(),
      deletedAt: deletedAt?.getTime() ?? null,
      serverSeq,
    };
  },

  dedupe: latestPerKey,

  /**
   * `client_updated_at` doubles as a delete's `deleted_at`: one timestamp decides both whether the
   * row wins its merge and when it was tombstoned, so there is no second clock to disagree with.
   * Instants become ISO strings rather than `Date` objects — the driver would serialise them
   * anyway, and a string is what the parameter is inferred as.
   */
  toValues(userId, mutation) {
    const stamped = new Date(mutation.clientUpdatedAt).toISOString();

    return {
      user_id: userId,
      key: mutationKey(mutation),
      value: mutation.op === 'upsert' ? mutation.entry.value : TOMBSTONE_VALUE,
      client_updated_at: stamped,
      deleted_at: mutation.op === 'delete' ? stamped : null,
    };
  },

  settledWhere(userId, mutations) {
    return and(
      eq(userPreferences.userId, userId),
      inArray(userPreferences.key, mutations.map(mutationKey)),
    );
  },
};
