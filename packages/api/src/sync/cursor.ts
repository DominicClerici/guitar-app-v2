/**
 * Where a `pull` page ends (BACKEND_PLAN.md §7).
 *
 * One global sequence orders every synced row, but a page is read per table — so the returned
 * cursor cannot simply be the highest sequence value seen. If one table filled its page at
 * sequence 900 while another returned everything it had up to 1200, resuming from 1200 would skip
 * the first table's rows between 900 and 1200 permanently.
 *
 * The safe boundary is therefore the *lowest* stopping point among the tables that filled their
 * page, with rows above it dropped from the response and returned by the next one. Rows are
 * re-sent rather than lost, and applying a row twice is harmless: every merge rule is idempotent.
 *
 * Pure, and unit-tested — with one synced table this is arithmetic nobody would get wrong, and
 * with three it is the kind of thing that silently loses rows for one device in a hundred.
 */

/** The single field paging needs from a row. */
export interface SequencedRow {
  serverSeq: number;
}

export interface Page<TRow extends SequencedRow> {
  cursor: number;
  hasMore: boolean;
  rows: Record<string, TRow[]>;
}

/**
 * The oldest cursor the server can still serve correctly (§7).
 *
 * Zero, because nothing has ever been purged: tombstones are kept for 90 days and the job that
 * removes them does not exist yet. When it lands — as a Cloudflare Cron Trigger (§2) — it has to
 * record the highest sequence value it purged and this has to return that watermark instead, or
 * every device that was offline across a purge keeps a cursor the server can no longer honour and
 * silently misses those deletions.
 */
export const MIN_VALID_CURSOR = 0;

export function resolvePage<TRow extends SequencedRow>(
  cursor: number,
  limit: number,
  tables: Record<string, TRow[]>,
): Page<TRow> {
  const entries = Object.entries(tables);

  // A table that returned a full page has more rows waiting behind it, and its last row is the
  // furthest this page can safely claim to have covered for that table.
  const capped = entries
    .map(([, rows]) => rows)
    .filter((rows) => rows.length >= limit)
    .map((rows) => rows[rows.length - 1]?.serverSeq ?? cursor);

  if (!capped.length) {
    const highest = entries.flatMap(([, rows]) => rows.map((row) => row.serverSeq));

    return { cursor: Math.max(cursor, ...highest), hasMore: false, rows: tables };
  }

  const boundary = Math.min(...capped);

  return {
    cursor: boundary,
    hasMore: true,
    rows: Object.fromEntries(
      entries.map(([name, rows]) => [name, rows.filter((row) => row.serverSeq <= boundary)]),
    ) as Record<string, TRow[]>,
  };
}
