/**
 * What a toast is and how one supersedes another. Kept apart from the store so the
 * rule that matters can be pinned down in a test: a toast dismisses itself on a
 * timer, so a replaced one is always still holding a timer against the toast that
 * replaced it, and that is not a thing you would notice by looking — a message cut
 * short after a few frames reads as a rendering glitch, not as a stale timer.
 *
 * One toast is on screen at a time. A second arriving takes the place of the first
 * rather than queueing behind it: a toast is a report on what just happened, and a
 * backlog of them would be showing the reader the past.
 */

export type ToastTone = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
  durationMs: number;
}

export interface ToastRequest {
  tone: ToastTone;
  message: string;
  durationMs?: number;
}

export interface ToastState {
  current: Toast | null;
  nextId: number;
}

/** Long enough to read a short sentence without holding the screen. */
export const DEFAULT_DURATION_MS = 3200;

export const NO_TOAST: ToastState = { current: null, nextId: 1 };

export function show(state: ToastState, request: ToastRequest): ToastState {
  return {
    current: {
      id: state.nextId,
      tone: request.tone,
      message: request.message,
      durationMs: request.durationMs ?? DEFAULT_DURATION_MS,
    },
    nextId: state.nextId + 1,
  };
}

/**
 * Take down the toast `id` names, if it is still the one on screen. An id that has
 * been superseded is not an error — it is the ordinary case of a timer outliving
 * what it was set for — so it returns the state untouched, by reference, and the
 * store publishes nothing.
 */
export function dismiss(state: ToastState, id: number): ToastState {
  if (state.current?.id !== id) return state;
  return { ...state, current: null };
}
