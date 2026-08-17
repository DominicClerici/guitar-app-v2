/**
 * The session, with "not known yet" told apart from "known to be nobody" (BACKEND_PLAN.md §5).
 *
 * `isPending` from Better Auth is not "first load". Its session atom sets `isPending: data === null`
 * on *every* refetch, so the flag goes back up each time the session is re-read while signed out —
 * and signing out does that twice over: the sign-out response schedules a refetch, then the guest
 * account created straight afterwards (`useEnsureGuestSession`) schedules another. A screen reading
 * it as "I don't know who this is" swaps itself for a spinner on each one, which is the flashing
 * this exists to stop. What those refetches carry is not an absence of an answer; it is the answer.
 *
 * There is exactly one moment in a launch with no answer at all: before the first read settles.
 * Hence a latch, and hence module scope — a screen mounted later, such as a tab opened for the
 * first time after signing out, starts from what the app already knows rather than re-deciding it
 * from whichever refetch happens to be in flight.
 */
import { useEffect, useSyncExternalStore } from 'react';

import { useSession } from './client';

type SessionData = ReturnType<typeof useSession>['data'];

/**
 * The latch, as a store rather than component state, because that is what it is: one fact about the
 * launch, shared by every screen that asks, and it changes once. Reading it through
 * `useSyncExternalStore` is also what keeps the hook's render pure — the alternative is a `setState`
 * in an effect, which is a cascading render and which the compiler's lint rejects outright.
 */
let everSettled = false;
const watchers = new Set<() => void>();

function settle(): void {
  if (everSettled) return;

  everSettled = true;
  for (const notify of [...watchers]) notify();
}

function watch(notify: () => void): () => void {
  watchers.add(notify);

  return () => {
    watchers.delete(notify);
  };
}

export interface KnownSession {
  /** The signed-in user's session, or null for a device with none. Meaningless while `unknown`. */
  session: SessionData;
  /** True only while there is no answer at all, which is once per launch at the most. */
  unknown: boolean;
}

export function useKnownSession(): KnownSession {
  const { data, isPending } = useSession();
  const settled = useSyncExternalStore(watch, () => everSettled);

  useEffect(() => {
    if (isPending) return;

    settle();
  }, [isPending]);

  // A session in hand is an answer whether or not a read is in flight behind it. The Expo plugin
  // hydrates one from the keychain before the first render, so this is also what spares a launch
  // that already knows who it belongs to from showing a spinner on the way to saying so.
  return { session: data, unknown: isPending && !settled && !data };
}
