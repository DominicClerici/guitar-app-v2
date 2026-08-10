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
 *
 * One function per rule from §7's table, taking the shape that rule needs rather than a particular
 * table's row. Each synced table names the pair it uses in its `DeviceSyncTable`, so the rule a
 * table merges under is declared once and read in one place.
 */
import type { LocalSyncRow } from './spec';

/** What a last-write-wins row must carry: the client stamp the whole comparison rests on. */
interface Stamped extends LocalSyncRow {
  clientUpdatedAt: number;
}

/**
 * Whether a row that arrived from the server replaces the device's copy, under last-write-wins.
 *
 * A local row carrying a `server_seq` is one the server has already seen, so there is no unpushed
 * edit to protect and the incoming row simply wins. Only a pending local write competes, and it
 * has to be strictly newer to survive — a tie goes to the server, so two devices that write in the
 * same millisecond converge instead of each keeping its own.
 */
export function lastWriteWinsAcceptsRemote(
  local: Stamped | undefined,
  remote: { clientUpdatedAt: number },
): boolean {
  if (!local) return true;
  if (local.serverSeq !== null) return true;

  return remote.clientUpdatedAt >= local.clientUpdatedAt;
}

/**
 * Whether a row being carried over from the previous account replaces what this account already
 * has locally (§5), under last-write-wins.
 *
 * The same comparison the server runs when it merges the guest's rows — the device does it too so
 * that the moment after signing in looks like the moment after the next pull, rather than showing
 * the account's old value until sync catches up. A tie keeps what is already there, since the
 * incoming row has no claim to being newer.
 */
export function lastWriteWinsAcceptsAdopted(
  existing: Stamped | undefined,
  adopted: Stamped,
): boolean {
  return !existing || adopted.clientUpdatedAt > existing.clientUpdatedAt;
}

/**
 * Whether an append-only row that arrived from the server has anything to tell this device.
 *
 * The row is immutable, so there is nothing to merge — but a local copy still waiting to be pushed
 * has to learn its sequence value, or the push path keeps finding it unsent and re-sending it
 * forever. That, not the row's contents, is what the server is answering with here.
 */
export function appendOnlyAcceptsRemote(
  local: LocalSyncRow | undefined,
  remote: { serverSeq: number },
): 'store' | 'confirm' | 'ignore' {
  if (!local) return 'store';
  if (local.serverSeq === null) return 'confirm';

  return 'ignore';
}

/**
 * Whether a monotonic fold still owes the server something (§7).
 *
 * The device keeps `server_seq` as its "already sent" marker, so the fold's own outcome decides it:
 * if what this device now holds is exactly what the server sent, the server has everything and the
 * row can carry the sequence value it came with. If the fold produced anything the server has not
 * seen — an earlier completion or a better score written offline — the row must stay unsent, or
 * that progress reaches no other device.
 */
export function monotonicSequence(
  folded: readonly (number | null)[],
  remote: readonly (number | null)[],
  remoteSeq: number,
): number | null {
  const settled = folded.every((value, index) => value === remote[index]);

  return settled ? remoteSeq : null;
}

/** Null means "nothing recorded", so it never displaces a real value on either side of a fold. */
export function earliest(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;

  return Math.min(a, b);
}

/** The other half of the monotonic fold: a best score only ever moves up. */
export function greatest(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;

  return Math.max(a, b);
}

/**
 * A cursor below what the server can still serve means tombstones this device never saw have been
 * purged, so it has no way to learn about those deletions except by starting over (§7).
 */
export function needsFullResync(cursor: number, minValidCursor: number): boolean {
  return cursor < minValidCursor;
}
