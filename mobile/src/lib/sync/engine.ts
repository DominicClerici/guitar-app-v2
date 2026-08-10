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
  deleteAllRows,
  deleteRow,
  readRows,
  readSyncState,
  readUnpushedRows,
  writeRow,
  writeSyncState,
} from '@/lib/db/rows';

import { needsFullResync } from './reconcile';
import { DEVICE_SYNC_TABLE_LIST } from './tables';

interface SyncTarget {
  client: TRPCClient<AppRouter>;
  userId: string;
}

/** How long a local write waits for its neighbours before a push goes out. */
const PUSH_DEBOUNCE_MS = 500;

let target: SyncTarget | null = null;
let running = false;
let queued = false;
let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * Points the engine at a signed-in user, or parks it. Called by the provider as the session
 * changes; a null target makes every trigger a no-op rather than something to guard at each call
 * site.
 */
export function setSyncTarget(next: SyncTarget | null): void {
  target = next;
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

  running = true;

  try {
    await push(active);
    await pull(active);
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
async function push({ client, userId }: SyncTarget): Promise<void> {
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

  applyRemoteRows(userId, result.rows);
}

/** Pulls pages until the server has nothing newer, moving the cursor forward as each lands. */
async function pull({ client, userId }: SyncTarget): Promise<void> {
  let resynced = false;

  for (;;) {
    const state = readSyncState();
    const page = await client.sync.pull.query({ cursor: state.cursor });

    // Once only: if a resync from zero still comes back stale, something is wrong on the server
    // and looping would just hammer it.
    if (!resynced && needsFullResync(state.cursor, page.minValidCursor)) {
      resynced = true;
      db.transaction((tx) => {
        deleteAllRows(userId, tx);
        writeSyncState({ ...state, cursor: 0 }, tx);
      });
      continue;
    }

    applyRemoteRows(userId, page.rows);
    writeSyncState({ ...state, cursor: page.cursor, lastPulledAt: new Date() });

    if (!page.hasMore) return;
  }
}

/**
 * Applies server rows to the local database under each table's merge rule.
 *
 * One transaction across every table, so a screen reading through `useLiveQuery` never sees half a
 * page — and so the comparison each row is judged against cannot change underneath the loop.
 */
function applyRemoteRows(userId: string, rows: SyncRowsByTable): void {
  const incoming = DEVICE_SYNC_TABLE_LIST.map(
    (spec) => [spec, (rows[spec.name] ?? []) as SyncRow[]] as const,
  ).filter(([, table]) => table.length > 0);

  if (!incoming.length) return;

  db.transaction((tx) => {
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
  });
}
