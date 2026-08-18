/**
 * Reading a table so a screen redraws when it changes (BACKEND_PLAN.md §6).
 *
 * The change notification `enableChangeListener` provides is `sqlite3_update_hook`: one native
 * event per changed **row**, with nothing between it and the JS thread. Drizzle's own
 * `useLiveQuery` re-runs its whole query on each of them, which is right for the write a user just
 * made and quadratic for a sync — a pulled page of two hundred rows is two hundred events, so every
 * mounted hook on that table runs its query two hundred times, in the same tick, to arrive at the
 * state the last one describes. The transaction the page is applied in does not help: it makes the
 * reads consistent, not the notifications fewer.
 *
 * So events are counted here rather than acted on. Each one marks its table and asks for one flush
 * on the next tick, and the flush is what tells the subscribers — once, however many rows the
 * transaction touched. It has to be a timer rather than a microtask: the events arrive as separate
 * tasks, and a microtask queue drains between them, which would coalesce nothing.
 *
 * The other half is that reads here are synchronous. expo-sqlite runs on the JS thread against a
 * local file, so a screen renders its rows on the first frame rather than an empty list followed by
 * the real one.
 */
import { getTableConfig, type SQLiteTable } from 'drizzle-orm/sqlite-core';
import { addDatabaseChangeListener } from 'expo-sqlite';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

type Listener = () => void;

/** Who is watching each table, and how many times it has changed since the app started. */
const listeners = new Map<string, Set<Listener>>();
const versions = new Map<string, number>();

/** The tables a flush has been asked for, and the one timer that will do it. */
const pending = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * The single native subscription, held only while something is watching.
 *
 * Dropping it matters as much as coalescing does: the native side checks whether JS is listening
 * before it sends anything, so a subscription kept alive out of convenience would have a sync that
 * happens with no screen mounted — the first one, during the splash — send an event per row to a
 * handler that does nothing with it.
 */
let subscription: { remove: () => void } | null = null;

function flush(): void {
  flushTimer = null;

  const changed = [...pending];
  pending.clear();

  // Every version moves before anyone is told, so a subscriber woken by one table and reading
  // another sees the state the whole transaction left behind rather than half of it.
  for (const table of changed) versions.set(table, (versions.get(table) ?? 0) + 1);

  for (const table of changed) {
    for (const listener of [...(listeners.get(table) ?? [])]) listener();
  }
}

function onDatabaseChange({ tableName }: { tableName: string }): void {
  if (!listeners.has(tableName)) return;

  pending.add(tableName);
  flushTimer ??= setTimeout(flush, 0);
}

function watch(table: string, listener: Listener): () => void {
  const watching = listeners.get(table) ?? new Set<Listener>();

  listeners.set(table, watching);
  watching.add(listener);
  subscription ??= addDatabaseChangeListener(onDatabaseChange);

  return () => {
    watching.delete(listener);
    if (watching.size) return;

    listeners.delete(table);
    if (listeners.size) return;

    subscription?.remove();
    subscription = null;
  };
}

/**
 * A read that answers with nothing rather than throwing.
 *
 * A screen mounted before the migrations have finished is the ordinary launch, and the tables it
 * reads do not exist yet — which is a learner with no rows, not an error to render. The same
 * shared array comes back every time, so a failing read does not churn what it feeds.
 */
const NOTHING: never[] = [];

function readOrNothing<TRow>(read: () => TRow[]): TRow[] {
  try {
    return read();
  } catch (error) {
    if (__DEV__) console.warn('[db] live read failed', error);

    return NOTHING;
  }
}

/**
 * The rows `read` selects, re-read once whenever `table` changes.
 *
 * `key` is everything the read depends on that a write to the table would not announce: the
 * account it is scoped to, and whether the migrations have run — nothing writes to a table that
 * did not exist, so nothing would otherwise ask again once it does. One string rather than a
 * dependency list because a spread list is not something the compiler will accept, and the
 * obligation is the same either way: a read whose key leaves something out keeps answering with
 * what that something used to be.
 */
export function useLiveRows<TRow>(table: SQLiteTable, read: () => TRow[], key: string): TRow[] {
  const name = useMemo(() => getTableConfig(table).name, [table]);
  const subscribe = useCallback((listener: Listener) => watch(name, listener), [name]);
  const version = useSyncExternalStore(subscribe, () => versions.get(name) ?? 0);

  // `key` is what stands in for `read`, which is a new closure on every render and would defeat
  // the whole point as a dependency of its own.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => readOrNothing(read), [version, key]);
}
