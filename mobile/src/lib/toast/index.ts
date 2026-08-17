import { useSyncExternalStore } from 'react';

import { dismiss, NO_TOAST, show, type Toast, type ToastState } from './queue';

export type { Toast, ToastTone } from './queue';

/**
 * The app's toasts.
 *
 * A store rather than a context, because the callers that most need one are not
 * components: sync reconciles on its own and reports what it could not do, and
 * threading a hook out to it would mean giving it a place in the tree it does not
 * otherwise want. `toast.error(…)` works from anywhere, including a module that
 * never renders.
 *
 * ```ts
 * toast.success('Preferences saved');
 * toast.error("Couldn't reach the server — saved on this device");
 * ```
 *
 * Nothing is shown until `ToastHost` is mounted, which the root layout does once.
 */

let state: ToastState = NO_TOAST;
const listeners = new Set<() => void>();

function commit(next: ToastState) {
  // `dismiss` returns the same state for an id that has already been superseded,
  // which is the ordinary case of a timer outliving what it was set for. Nothing
  // changed, so nothing re-renders.
  if (next === state) return;
  state = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function currentToast(): Toast | null {
  return state.current;
}

/** The toast on screen, or `null`. Only `ToastHost` should need this. */
export function useCurrentToast(): Toast | null {
  return useSyncExternalStore(subscribe, currentToast, currentToast);
}

export const toast = {
  success(message: string, durationMs?: number) {
    commit(show(state, { tone: 'success', message, durationMs }));
  },
  error(message: string, durationMs?: number) {
    commit(show(state, { tone: 'error', message, durationMs }));
  },
  info(message: string, durationMs?: number) {
    commit(show(state, { tone: 'info', message, durationMs }));
  },
  dismiss(id: number) {
    commit(dismiss(state, id));
  },
};
