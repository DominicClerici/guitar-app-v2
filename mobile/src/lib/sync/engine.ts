/**
 * The sync loop (BACKEND_PLAN.md §6, §7).
 *
 * Push what this device wrote, then pull what it has not seen — both against the local database,
 * which nothing in the app ever waits on. A failure is ordinary here rather than exceptional: the
 * device is offline more often than the sync layer is broken, and the triggers in `provider.tsx`
 * are what bring it back.
 *
 * Two schedules run against that. A failed run retries on a widening backoff (`retry.ts`) and, if
 * it never gets through, says so once — a device that has been holding a write for ten minutes is
 * not "offline-first", it is silently wrong, and the user is the only one who can do anything
 * about it. Separately, a pull goes out every two minutes regardless of what this device has
 * written, because a change made on another device otherwise waits for something to happen here.
 * The two schedules give way to each other rather than interleaving: the periodic pull stands
 * aside for a push, and nothing is pushed while a pull is in flight.
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
  SYNCED_TABLE_SPECS,
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
import { toast } from '@/lib/toast';

import { needsFullResync } from './reconcile';
import { nextRetry } from './retry';
import type { DeviceSyncTable, LocalSyncRow } from './spec';
import { DEVICE_SYNC_TABLE_LIST } from './tables';

interface SyncTarget {
  client: TRPCClient<AppRouter>;
  userId: string;
}

/** How long a local write waits for its neighbours before a push goes out. */
const PUSH_DEBOUNCE_MS = 1500;

/**
 * How often the device asks the server what it has not seen, while the app is open.
 *
 * Nothing else pulls on its own: a device with no local writes and no foreground or network event
 * would otherwise sit on whatever it last saw, so a change made on another device would not arrive
 * until this one was reopened.
 */
const PULL_INTERVAL_MS = 120_000;

/**
 * How long a due pull waits after the push it stood aside for.
 *
 * A pull that lands the instant a push returns reads a server that is still settling: the push
 * response has already been applied here, so the page it would fetch is mostly this device's own
 * rows coming back. The gap also lets the writes that usually follow one another — a quiz attempt
 * and the progress row it moves — finish arriving before the pull takes its turn.
 */
const PULL_AFTER_PUSH_GRACE_MS = 2_000;

/** What the user is told once a run has failed every time the schedule allows. */
const SYNC_FAILED_MESSAGE = 'Something went wrong syncing your data';

let target: SyncTarget | null = null;
let running = false;
let queued = false;
let timer: ReturnType<typeof setTimeout> | null = null;

/**
 * When the pending run is due, and whether it is a retry.
 *
 * A request only moves the timer earlier, so the debounce still collapses a burst of writes into
 * one run. A retry is the exception in both directions: it replaces whatever was pending, and
 * nothing ordinary pulls it forward — otherwise a screen writing a preference per keystroke would
 * ask the server again every 1.5s for as long as the device was offline, which is the thing the
 * backoff exists to stop. What does override it is `syncNow`, because the events that call it are
 * exactly the ones the backoff was waiting for.
 */
let timerDueAt = 0;
let timerIsRetry = false;

/** Consecutive failed runs that have already been retried, and what a retry is measured against. */
let retried = 0;

/**
 * The periodic pull's timer, and whether one came due while a push had the engine.
 *
 * Separate from `timer` because the two are answering different questions — "has this device
 * written anything lately" and "how long since it last heard from the server" — and a pull that
 * reset the push debounce would delay writes rather than accompany them.
 */
let pullTimer: ReturnType<typeof setTimeout> | null = null;
let pullDue = false;

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
 *
 * Every schedule is dropped here, including the backoff and the periodic pull. They were counted
 * and timed for an account that no longer owns this database, and a retry surviving a sign-out
 * would report the previous session's failure to whoever is holding the phone now. `running` is
 * deliberately left alone: a run really is in flight, and `stale` is what stops it.
 */
export function setSyncTarget(next: SyncTarget | null): void {
  target = next;
  targetGeneration += 1;

  clearTimer();
  clearPullTimer();
  queued = false;
  retried = 0;

  if (next) schedulePull(PULL_INTERVAL_MS);
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

function clearTimer(): void {
  if (!timer) return;

  clearTimeout(timer);
  timer = null;
  timerIsRetry = false;
}

function clearPullTimer(): void {
  if (pullTimer) clearTimeout(pullTimer);

  pullTimer = null;
  pullDue = false;
}

/** Arms the run timer, unless something sooner or more authoritative is already pending. */
function schedule(delayMs: number, retry: boolean): void {
  const dueAt = Date.now() + delayMs;

  if (timer) {
    if (!retry && (timerIsRetry || dueAt >= timerDueAt)) return;
    clearTimer();
  }

  timerDueAt = dueAt;
  timerIsRetry = retry;
  timer = setTimeout(() => {
    timer = null;
    timerIsRetry = false;
    void runSync('sync');
  }, delayMs);
}

/**
 * Asks for a sync soon. Repeated calls collapse into one run, and a call made while a run is in
 * flight schedules exactly one more after it — so a screen that writes a preference per keystroke
 * costs one round trip, not one per keystroke.
 */
export function requestSync(delayMs: number = PUSH_DEBOUNCE_MS): void {
  schedule(delayMs, false);
}

/**
 * Syncs now, and forgets that anything has been failing.
 *
 * For the three moments that are not a local write — opening the app, returning to it, and the
 * network coming back. Each is new information about the thing the backoff is waiting on, so
 * serving out the rest of a minute-long delay would just be the app ignoring what it was told.
 */
export function syncNow(): void {
  retried = 0;
  clearTimer();
  schedule(0, false);
}

/**
 * Arms the periodic pull.
 *
 * A pull that comes due behind a push does not overtake it. Pushing first is what makes the pull
 * worth making — the server's answer then includes what this device just sent, merged against
 * whatever else arrived — and the two crossing would have this device apply a page that was
 * assembled before its own writes landed. A pending push counts as much as one in flight: the
 * debounce means a write from half a second ago is a push that has not been sent yet, and pulling
 * in front of it would put the round trips in the wrong order for the sake of a rounding error on
 * the two minutes.
 */
function schedulePull(delayMs: number): void {
  clearPullTimer();

  pullTimer = setTimeout(() => {
    pullTimer = null;

    if (running || timer) {
      pullDue = true;
      return;
    }

    void runSync('pull');
  }, delayMs);
}

/**
 * Runs one half of a sync, and reports whether it got there.
 *
 * Being unable to reach the server is the normal case, not a bug: local writes are already saved,
 * and a run that failed is a run to repeat rather than an error to raise. What matters is that the
 * failure stops at the half that caused it, and that the caller can still tell the halves apart —
 * a pull that succeeded next to a push that did not still means this device has heard from the
 * server, which is what the periodic pull is timed from.
 */
async function attempt<T>(
  half: string,
  run: () => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false }> {
  try {
    return { ok: true, value: await run() };
  } catch (error) {
    if (__DEV__) console.warn(`[sync] ${half} failed`, error);

    return { ok: false };
  }
}

/** A full run, or the pull alone — which is all the periodic timer is asking for. */
type RunMode = 'sync' | 'pull';

async function runSync(mode: RunMode): Promise<void> {
  const active = target;
  if (!active) return;

  if (running) {
    queued = true;
    return;
  }

  const generation = targetGeneration;
  running = true;

  let reached = true;
  let pulled = false;

  try {
    // The two directions share a run, not a fate. A row the server refuses outright — a validation
    // failure, not a lost connection — is refused again on every retry, so a single push wrapped
    // together with the pull would stop this device receiving anything from the server for as long
    // as that row sits unsent. Pulling is what eventually settles such a row anyway: the winning
    // version arriving from another device replaces it.
    if (mode === 'sync') {
      const pushed = await attempt('push', () => push(active, generation));

      if (!pushed.ok) reached = false;
      // A push that filled a table's ceiling left rows behind, and nothing else is going to ask for
      // them: `queued` is otherwise set only by a trigger that happened to land mid-run, so the
      // remainder would wait on an unrelated foreground or network event.
      else if (pushed.value) queued = true;
    }

    const page = await attempt('pull', () => pull(active, generation));

    if (page.ok) pulled = true;
    else reached = false;
  } finally {
    running = false;

    // A run whose account was replaced underneath it settles nothing. `setSyncTarget` has already
    // dropped every schedule and reset the count, and the outcome being carried here belongs to
    // the account that just went away.
    if (!stale(generation)) settle(reached, pulled);
  }
}

/**
 * What the run just finished asks for next: another attempt, a report, or nothing.
 *
 * Both halves feed one count. A user has no way to act on which direction failed, and a device
 * that cannot reach the server fails both — counting them apart would only mean waiting through
 * two schedules and being told twice.
 */
function settle(reached: boolean, pulled: boolean): void {
  if (reached) {
    retried = 0;
  } else {
    const decision = nextRetry(retried);

    if (decision.kind === 'retry') {
      schedule(decision.delayMs, true);
      retried += 1;
    } else {
      // Giving up is giving up on *this* chain, not on syncing. The count goes back to zero so the
      // next write, foreground or reconnect gets a full schedule of its own rather than one
      // attempt and another toast.
      retried = 0;
      toast.error(SYNC_FAILED_MESSAGE);
    }
  }

  if (queued) {
    queued = false;
    requestSync(0);
  }

  // The two minutes are measured from the last page that landed, not from the last timer that
  // fired, so a run triggered by a write also postpones the periodic pull it just did the work of.
  // The final branch is what keeps the period alive through an outage: the timer that started this
  // run is spent, and a failed pull would otherwise be the last one of the session.
  if (pulled) schedulePull(PULL_INTERVAL_MS);
  else if (pullDue) schedulePull(PULL_AFTER_PUSH_GRACE_MS);
  else if (!pullTimer) schedulePull(PULL_INTERVAL_MS);
}

/**
 * Sends this device's unsent writes and applies whatever the server settled on for them —
 * including the rows this device lost, which is what stops a stale local row being re-sent forever.
 *
 * One batch per run. `SYNC_PUSH_LIMIT` is a per-table ceiling, and a device that has more than that
 * waiting for one table sends the rest on the next run rather than in a loop here: an unbounded
 * loop against a server that keeps accepting is how a sync turns into a stall on the JS thread.
 * Returns whether anything was left behind, which is what asks for that next run — nothing else
 * knows the backlog exists.
 */
/**
 * One unpushed row as the mutation that sends it, or `null` when it cannot be sent at all.
 *
 * The server validates a push exactly (§7), and it validates the *batch*: one row it refuses takes
 * every other row in the request down with it, and a row is refused for the same reason on every
 * retry — so nothing this device has written would ever reach the server again. Checking each
 * mutation against the same schema the server will check it against is what makes that impossible
 * rather than merely survivable, and it is the same schema, imported from `@guitar/shared`, so the
 * two cannot drift apart.
 *
 * A skipped row is kept locally and simply never sent. That is a real cost — the row reaches no
 * other device — but it is paid by one row instead of by the account, and the alternative is not
 * "the row syncs later": a row the server rejects does not become acceptable by being retried.
 *
 * Reaching either branch means something upstream wrote a row it should not have, so both warn.
 */
function sendable(spec: DeviceSyncTable, row: LocalSyncRow): SyncMutation | null {
  const mutation = spec.toMutation(row);

  if (!mutation) {
    // Only reachable after a downgrade below the build that wrote the row, which is why the
    // adapter answers `null` rather than throwing.
    if (__DEV__) {
      console.warn(`[sync] skipped ${spec.name} row "${spec.identity(row)}": unrepresentable`);
    }

    return null;
  }

  const parsed = SYNCED_TABLE_SPECS[spec.name].mutation.safeParse(mutation);

  if (!parsed.success) {
    if (__DEV__) {
      console.warn(
        `[sync] skipped ${spec.name} row "${spec.identity(row)}": invalid mutation`,
        parsed.error.issues,
      );
    }

    return null;
  }

  return parsed.data as SyncMutation;
}

async function push({ client, userId }: SyncTarget, generation: number): Promise<boolean> {
  const operations: Partial<Record<SyncedTableName, SyncMutation[]>> = {};
  let truncated = false;

  for (const spec of DEVICE_SYNC_TABLE_LIST) {
    const mutations: SyncMutation[] = [];

    // The ceiling counts what can actually be sent, so a row that cannot is stepped over rather
    // than counted against it. Letting unsendable rows fill the batch would hold those places on
    // every run — they are never accepted, so they are never given up — and a real backlog behind
    // them would never drain. Stopping at the ceiling rather than reading past it also bounds the
    // validation above to one batch, however far behind the device has fallen.
    for (const row of readUnpushedRows(spec, userId)) {
      if (mutations.length === SYNC_PUSH_LIMIT) {
        truncated = true;
        break;
      }

      const mutation = sendable(spec, row);
      if (mutation) mutations.push(mutation);
    }

    if (mutations.length) operations[spec.name] = mutations;
  }

  if (!Object.keys(operations).length) return false;

  const result = await client.sync.push.mutate(operations as SyncPushInput);
  if (stale(generation)) return false;

  db.transaction((tx) => applyRemoteRows(userId, result.rows, tx));

  return truncated;
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
