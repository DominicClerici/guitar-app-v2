/**
 * The device's half of the merge rules (BACKEND_PLAN.md §7).
 *
 * Pure, and separate from the engine that calls it, for the reason §11 gives: merge rules are the
 * highest-risk logic in the whole design and have no I/O, so they are the part worth testing
 * directly. Nothing here touches SQLite, the network, or React.
 *
 * These decisions mirror the server's `ON CONFLICT` clause rather than duplicating it in a second
 * dialect: the server is the authority, and a device that disagrees converges on the next pull.
 * What the device adds is the one thing the server cannot know — whether a local row is a write
 * that has not been pushed yet.
 */
import {
  isPreferenceKey,
  preferenceEntry,
  type PreferenceMutation,
  type PreferenceSyncRow,
} from '@guitar/shared';

/** A stored row as the device holds it, with instants as epoch milliseconds. */
export interface LocalPreferenceRow {
  key: string;
  value: string;
  clientUpdatedAt: number;
  deletedAt: number | null;
  /** `null` means "written here and not yet accepted by the server". */
  serverSeq: number | null;
}

/**
 * Whether a row that arrived from the server replaces the device's copy.
 *
 * A local row carrying a `server_seq` is one the server has already seen, so there is no unpushed
 * edit to protect and the incoming row simply wins. Only a pending local write competes, and it
 * has to be strictly newer to survive — a tie goes to the server, so two devices that write in the
 * same millisecond converge instead of each keeping its own.
 */
export function acceptsRemote(
  local: LocalPreferenceRow | undefined,
  remote: PreferenceSyncRow,
): boolean {
  if (!local) return true;
  if (local.serverSeq !== null) return true;

  return remote.clientUpdatedAt >= local.clientUpdatedAt;
}

/**
 * Whether a row being carried over from the previous account replaces what this account already
 * has locally (§5).
 *
 * The same last-write-wins comparison the server runs when it merges the guest's rows — the device
 * does it too so that the moment after signing in looks like the moment after the next pull,
 * rather than showing the account's old value until sync catches up. A tie keeps what is already
 * there, since the incoming row has no claim to being newer.
 */
export function acceptsAdopted(
  existing: LocalPreferenceRow | undefined,
  adopted: LocalPreferenceRow,
): boolean {
  return !existing || adopted.clientUpdatedAt > existing.clientUpdatedAt;
}

/**
 * A cursor below what the server can still serve means tombstones this device never saw have been
 * purged, so it has no way to learn about those deletions except by starting over (§7).
 */
export function needsFullResync(cursor: number, minValidCursor: number): boolean {
  return cursor < minValidCursor;
}

/**
 * Turns unpushed local rows into the operations `sync.push` takes.
 *
 * A row is dropped when its value no longer parses — which happens if this build of the app is
 * older than the one that wrote the row, and can only come from a downgrade. Dropping one row is
 * the alternative to the whole batch being rejected by the server's validation and no preference
 * on the device ever syncing again.
 */
export function toPushOperations(rows: readonly LocalPreferenceRow[]): PreferenceMutation[] {
  const operations: PreferenceMutation[] = [];

  for (const row of rows) {
    if (!isPreferenceKey(row.key)) continue;

    // A tombstone carries no value, so it only needs a key the server will recognise.
    if (row.deletedAt !== null) {
      operations.push({ op: 'delete', key: row.key, clientUpdatedAt: row.clientUpdatedAt });
      continue;
    }

    const parsed = preferenceEntry.safeParse({ key: row.key, value: row.value });
    if (parsed.success) {
      operations.push({ op: 'upsert', entry: parsed.data, clientUpdatedAt: row.clientUpdatedAt });
    }
  }

  return operations;
}
