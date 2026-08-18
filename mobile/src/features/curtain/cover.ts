import { useSyncExternalStore } from 'react';

/**
 * The cover: the screen held blank while something is happening somewhere else.
 *
 * The curtain's plainer sibling, and deliberately mute — it says nothing and plays nothing. What it
 * is for is a wait that belongs to another surface entirely: a provider's sign-in sheet comes up
 * over the app, and what is behind it stops being a screen anyone is using. Covering it is what
 * makes the two ends of a sign-in one movement rather than two, because whatever the app does next
 * — push a route, drop a session, put a welcome up — it does unseen, and the person watching sees
 * only the thing it fades back to.
 *
 * Outside the tree for the same reason the curtain and the toasts are (`store.ts`): what raises a
 * cover is on a screen the cover may be about to leave. The settings tab raises one and the
 * onboarding flow takes it away, and neither is mounted at the same time as the other.
 *
 * It ends in one of three ways, and which one is the whole of the API:
 *
 * - `lowerCover` — back to what was underneath, in front of whoever is watching. A sheet that was
 *   dismissed rather than answered.
 * - `clearCover` — gone at once, because something opaque now owns the screen: the curtain playing
 *   a welcome over it, or the screen it was covering for having arrived underneath.
 */

export interface Cover {
  /** Distinguishes one cover from the next, so a second is raised rather than resuming the first. */
  id: number;
  /** Whether it is on its way out. */
  leaving: boolean;
}

let current: Cover | null = null;
let nextId = 1;
const listeners = new Set<() => void>();

function commit(next: Cover | null): void {
  current = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function covering(): Cover | null {
  return current;
}

/** The cover on screen, or `null`. Only `CoverHost` should need this. */
export function useCover(): Cover | null {
  return useSyncExternalStore(subscribe, covering, covering);
}

/**
 * Whether the screen is spoken for, for a caller that must not re-render when it stops being.
 *
 * The root layout is the one that asks: a route pushed under a cover must appear rather than
 * travel, since the travelling is what the cover exists to hide. Read at the moment the navigator
 * builds the screen, which is the moment the push happens — subscribing to it instead would
 * re-render the whole app twice for every sign-in.
 */
export function isCovered(): boolean {
  return current !== null && !current.leaving;
}

/** Take the screen. Raising one that is already up, or catching one on its way out, keeps it. */
export function raiseCover(): void {
  if (!current) {
    commit({ id: nextId++, leaving: false });
    return;
  }

  if (current.leaving) commit({ ...current, leaving: false });
}

/** Give the screen back, visibly, to whatever was underneath. */
export function lowerCover(): void {
  if (!current || current.leaving) return;
  commit({ ...current, leaving: true });
}

/** Take it away where nothing can see it go — something else opaque is over or under it now. */
export function clearCover(): void {
  if (current) commit(null);
}

/**
 * Drop the cover `id` names, if it is still the one on screen. An id that has been superseded is
 * the ordinary case of a timer outliving what it was set for, so it does nothing.
 */
export function endCover(id: number): void {
  if (current?.id !== id) return;
  commit(null);
}
