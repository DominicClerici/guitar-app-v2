import { describe, expect, it } from 'vitest';

import { dismiss, NO_TOAST, show, type ToastState } from './queue';

/** A state with one toast already on screen, and the id it is showing under. */
function showing(message = 'Saved'): { state: ToastState; id: number } {
  const state = show(NO_TOAST, { tone: 'success', message });
  return { state, id: state.current!.id };
}

describe('show', () => {
  it('puts a toast on screen when there is none', () => {
    const { state } = showing('Saved');

    expect(state.current).toMatchObject({ tone: 'success', message: 'Saved' });
  });

  it('replaces the toast already on screen', () => {
    const { state } = showing('Saved');
    const next = show(state, { tone: 'error', message: "Couldn't reach the server" });

    expect(next.current).toMatchObject({ tone: 'error', message: "Couldn't reach the server" });
  });

  it('gives every showing its own id, so two of the same message are still two', () => {
    const first = show(NO_TOAST, { tone: 'info', message: 'Syncing' });
    const second = show(first, { tone: 'info', message: 'Syncing' });

    expect(second.current!.id).not.toBe(first.current!.id);
  });

  it('carries a default duration, and takes one that was asked for', () => {
    const standard = show(NO_TOAST, { tone: 'info', message: 'Syncing' });
    const lingering = show(NO_TOAST, { tone: 'info', message: 'Syncing', durationMs: 8000 });

    expect(standard.current!.durationMs).toBeGreaterThan(0);
    expect(lingering.current!.durationMs).toBe(8000);
  });
});

describe('dismiss', () => {
  it('clears the toast it names', () => {
    const { state, id } = showing();

    expect(dismiss(state, id).current).toBeNull();
  });

  /**
   * The case the whole id exists for. A toast schedules its own dismissal, so a
   * replaced one still has a timer running against it — and that timer must not
   * take down the toast that replaced it, which would cut a message off after a
   * few frames for no reason the reader could see.
   */
  it('ignores an id that is no longer the toast on screen', () => {
    const { state, id: replaced } = showing('Saved');
    const next = show(state, { tone: 'error', message: 'Failed' });

    expect(dismiss(next, replaced)).toBe(next);
    expect(dismiss(next, replaced).current).toMatchObject({ message: 'Failed' });
  });

  it('does nothing when there is no toast at all', () => {
    expect(dismiss(NO_TOAST, 1)).toBe(NO_TOAST);
  });
});
