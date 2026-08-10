/**
 * Paging arithmetic for `sync.pull` (BACKEND_PLAN.md §7, §11).
 *
 * Pure, so it runs without a database. The cases that matter are the multi-table ones, which
 * cannot be exercised end to end yet — `user_preferences` is the only synced table — and which are
 * exactly where a wrong cursor loses rows silently rather than failing.
 */
import { describe, expect, it } from 'vitest';

import { resolvePage } from '../src/sync/cursor';

const rows = (...seqs: number[]) => seqs.map((serverSeq) => ({ serverSeq }));

describe('resolvePage', () => {
  it('keeps the cursor where it was when nothing has changed', () => {
    const page = resolvePage(40, 10, { userPreferences: [] });

    expect(page).toMatchObject({ cursor: 40, hasMore: false });
  });

  it('advances to the highest row it returned', () => {
    const page = resolvePage(0, 10, { userPreferences: rows(3, 8, 11) });

    expect(page).toMatchObject({ cursor: 11, hasMore: false });
  });

  it('reports more waiting when a table fills its page', () => {
    const page = resolvePage(0, 3, { userPreferences: rows(3, 8, 11) });

    expect(page).toMatchObject({ cursor: 11, hasMore: true });
  });

  /**
   * The case the whole module exists for. `a` stopped at 9 because its page was full; `b` returned
   * everything it had, up to 40. Resuming from 40 would skip whatever `a` holds between 9 and 40 —
   * forever, since the cursor only moves forward.
   */
  it('stops at the lowest table that filled its page', () => {
    const page = resolvePage(0, 2, { a: rows(4, 9), b: rows(12, 40) });

    expect(page.cursor).toBe(9);
    expect(page.hasMore).toBe(true);
  });

  it('drops rows above that boundary, so the next page re-sends them', () => {
    const page = resolvePage(0, 2, { a: rows(4, 9), b: rows(12, 40) });

    expect(page.rows.a).toEqual(rows(4, 9));
    expect(page.rows.b).toEqual([]);
  });

  it('never moves the cursor backwards', () => {
    const page = resolvePage(100, 10, { userPreferences: rows(3) });

    expect(page.cursor).toBe(100);
  });
});
