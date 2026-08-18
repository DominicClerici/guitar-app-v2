/**
 * The sync loop (BACKEND_PLAN.md §6, §7).
 *
 * Push what this device wrote, then pull what it has not seen — both against the local database,
 * which nothing in the app ever waits on. A failure is ordinary here rather than exceptional: the
 * device is offline more often than the sync layer is broken, and the triggers in `provider.tsx`
 * are what bring it back.
 *
 * No table is named anywhere below. Both halves walk `DEVICE_SYNC_TABLE_LIST`, because the failure
 * mode of naming them is silent — a table left out of the push loop is simply never sent, and
 * nothing reports it.
 *
 * The target is module state rather than a React value because writes come from anywhere — a
 * preference is set from a screen with no access to a provider, and the write should nudge sync
 * without the caller knowing sync exists.
 */
import type { AppRouter } from '@guitar/api';
import {
  SYNC_PUSH_LIMIT,
  type SyncedTableName,
  type SyncMutation,
  type SyncPushInput,
  type SyncRow,
  type SyncRowsByTable,
} from '@guitar/shared';
import type { TRPCClient } from '@trpc/client';

import { db } from '@/lib/db/client';
import {
  deletePushedRows,
  deleteRow,
  readRows,
  readSyncState,
  readUnpushedRows,
  writeRow,
  writeSyncCursor,
  type Writer,
} from '@/lib/db/rows';

import { needsFullResync } from './reconcile';
import { DEVICE_SYNC_TABLE_LIST } from './tables';

interface SyncTarget {
  client: TRPCClient<AppRouter>;
  userId: string;
}

/** How long a local write waits for its neighbours before a push goes out. */
const PUSH_DEBOUNCE_MS = 1500;

let target: SyncTarget | null = null;
let running = false;
let queued = false;
let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * Which account the engine is currently pointed at, counted rather than named.
 *
 * A run holds its target across every await, and the target can be replaced while one is in flight.
 * Comparing ids would not catch it: signing out and back in as the same user still moves the
 * database out from under the run, because `adoptUser` has reset the cursor in between.
 */
let targetGeneration = 0;

/**
 * Points the engine at a signed-in user, or parks it. Called by the provider as the session
 * changes; a null target makes every trigger a no-op rather than something to guard at each call
 * site.
 */
export function setSyncTarget(next: SyncTarget | null): void {
  target = next;
  targetGeneration += 1;
}

/**
 * Whether the account a run started under is still the one the engine is pointed at. Checked after
 * every await, and the run gives up outright when it is not.
 *
 * The case this exists for is a guest signing in. `adoptUser` carries the guest's rows to the real
 * account, drops the guest's, and restarts the cursor — all synchronously, while the guest's pull is
 * still waiting on the network. Everything that pull does when it resolves is then addressed to an
 * account that no longer owns this database: it writes rows back under the old id, undoing the
 * handover, and it moves the cursor to a position in the shared sequence that the new account has
 * never read. Nothing about that surfaces. The next pull simply asks for rows above a cursor the
 * account never reached, and every row below it is skipped until the next launch notices the id is
 * wrong and adopts all over again.
 */
function stale(generation: number): boolean {
  return generation !== targetGeneration;
}

/**
 * Asks for a sync soon. Repeated calls collapse into one run, and a call made while a run is in
 * flight schedules exactly one more after it — so a screen that writes a preference per keystroke
 * costs one round trip, not one per keystroke.
 */
export function requestSync(delayMs: number = PUSH_DEBOUNCE_MS): void {
  if (timer) return;

  timer = setTimeout(() => {
    timer = null;
    void runSync();
  }, delayMs);
}

async function runSync(): Promise<void> {
  const active = target;
  if (!active) return;

  if (running) {
    queued = true;
    return;
  }

  const generation = targetGeneration;
  running = true;

  try {
    await push(active, generation);
    await pull(active, generation);
  } catch (error) {
    // Being unable to reach the server is the normal case, not a bug, and there is no screen to
    // report it to: local writes are already saved and the next trigger retries.
    if (__DEV__) console.warn('[sync] run failed', error);
  } finally {
    running = false;

    if (queued) {
      queued = false;
      requestSync(0);
    }
  }
}

/**
 * Sends this device's unsent writes and applies whatever the server settled on for them —
 * including the rows this device lost, which is what stops a stale local row being re-sent forever.
 *
 * One batch per run. `SYNC_PUSH_LIMIT` is a per-table ceiling, and a device that has more than that
 * waiting for one table sends the rest on the next run rather than in a loop here: the run is
 * already re-triggered by `queued`, and an unbounded loop against a server that keeps accepting is
 * how a sync turns into a stall on the JS thread.
 */
async function push({ client, userId }: SyncTarget, generation: number): Promise<void> {
  const operations: Partial<Record<SyncedTableName, SyncMutation[]>> = {};
  let total = 0;

  for (const spec of DEVICE_SYNC_TABLE_LIST) {
    const pending = readUnpushedRows(spec, userId).slice(0, SYNC_PUSH_LIMIT);
    if (!pending.length) continue;

    const mutations = pending
      .map((row) => spec.toMutation(row))
      .filter((mutation): mutation is SyncMutation => mutation !== null);

    if (!mutations.length) continue;

    operations[spec.name] = mutations;
    total += mutations.length;
  }

  if (!total) return;

  const result = await client.sync.push.mutate(operations as SyncPushInput);
  if (stale(generation)) return;

  db.transaction((tx) => applyRemoteRows(userId, result.rows, tx));
}

/**
 * Pulls pages until the server has nothing newer, moving the cursor forward as each lands.
 *
 * A page and the cursor that covers it are written together, so the cursor can never claim rows
 * that were not applied. The cursor is read fresh for each request and written as a field rather
 * than as part of the whole state, because the account underneath is not this loop's to decide.
 */
async function pull({ client, userId }: SyncTarget, generation: number): Promise<void> {
  let resynced = false;

  while (!stale(generation)) {
    const cursor = readSyncState().cursor;
    const page = await client.sync.pull.query({ cursor });

    if (stale(generation)) return;

    // Once only: if a resync from zero still comes back stale, something is wrong on the server
    // and looping would just hammer it.
    if (!resynced && needsFullResync(cursor, page.minValidCursor)) {
      resynced = true;
      db.transaction((tx) => {
        deletePushedRows(userId, tx);
        writeSyncCursor({ cursor: 0 }, tx);
      });
      continue;
    }

    db.transaction((tx) => {
      applyRemoteRows(userId, page.rows, tx);
      writeSyncCursor({ cursor: page.cursor, lastPulledAt: new Date() }, tx);
    });

    if (!page.hasMore) return;
  }
}

/**
 * Applies server rows to the local database under each table's merge rule.
 *
 * The caller supplies the transaction, and every table is applied inside it — so a screen reading
 * through `useLiveQuery` never sees half a page, the comparison each row is judged against cannot
 * change underneath the loop, and a pull can commit its page and its cursor as one thing.
 */
function applyRemoteRows(userId: string, rows: SyncRowsByTable, tx: Writer): void {
  const incoming = DEVICE_SYNC_TABLE_LIST.map(
    (spec) => [spec, (rows[spec.name] ?? []) as SyncRow[]] as const,
  ).filter(([, table]) => table.length > 0);

  for (const [spec, table] of incoming) {
    const local = new Map(
      readRows(spec, userId, tx).map((row) => [spec.identity(row), row] as const),
    );

    for (const remote of table) {
      const row = spec.merge(local.get(spec.wireIdentity(remote)), remote);
      if (!row) continue;

      if (row.deletedAt !== null) {
        deleteRow(spec, userId, row, tx);
        continue;
      }

      writeRow(spec, userId, row, tx);
    }
  }
}
