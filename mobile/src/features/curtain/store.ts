import { useSyncExternalStore } from 'react';

import type { Moment } from './moment';

/**
 * The curtain that is down, held outside the tree.
 *
 * It has to be: what asks for a curtain is on the screen the curtain is about to take away. The
 * onboarding flow is unwound the moment its welcome is up, and the sheet that asks about signing
 * out is dismissed under its own. A moment owned by the screen that ordered it would be torn down
 * in the same frame it appeared.
 *
 * So this is the toast store's shape for the same reason (`lib/toast`), with one addition —
 * `onCovered`. The caller does not get to choose when it acts: it says what to do and the curtain
 * runs it at the moment the screen is fully hidden, which is the only moment a pop, a dismissal or
 * a session dropping out from under a screen is worth nothing to look at.
 */

export type CurtainRequest = Moment & {
  /**
   * Run once, at the moment the curtain covers everything — immediately for a moment that opens on
   * black, and at the end of the fade for one that comes down over a screen in use. Where the
   * caller does whatever would have been a flash.
   */
  onCovered?: () => void;
};

export type Playing = CurtainRequest & {
  /** Distinguishes one moment from the next, so a second replays rather than resuming the first. */
  id: number;
};

let current: Playing | null = null;
let nextId = 1;
const listeners = new Set<() => void>();

function commit(next: Playing | null): void {
  current = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function playing(): Playing | null {
  return current;
}

/** The curtain on screen, or `null`. Only `CurtainHost` should need this. */
export function useCurtain(): Playing | null {
  return useSyncExternalStore(subscribe, playing, playing);
}

/**
 * Bring the curtain down on a moment. Nothing is shown unless `CurtainHost` is mounted, which the
 * root layout does once.
 */
export function curtain(request: CurtainRequest): void {
  commit({ ...request, id: nextId++ });
}

/**
 * Take the curtain `id` names up, if it is still the one on screen. An id that has been superseded
 * is the ordinary case of a timer outliving what it was set for, so it does nothing.
 */
export function endCurtain(id: number): void {
  if (current?.id !== id) return;
  commit(null);
}
