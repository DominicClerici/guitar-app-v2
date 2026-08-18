/**
 * What a failed sync does next.
 *
 * Pure and separate from the engine for the same reason `reconcile.ts` is: the schedule is a
 * decision, the engine is the I/O around it, and the off-by-one that matters here — how many
 * attempts a user actually waits through before being told something is wrong — is invisible from
 * the outside. A run that gives up one step early reports a failure the next retry would have
 * fixed; one that gives up a step late shows nothing for an extra minute.
 *
 * The count is of *consecutive* failures, held by the engine and reset by any run that succeeds.
 * Nothing here knows which half failed: a push refused and a pull refused are the same event to a
 * user, and the report they get says so.
 */

/**
 * What each retry waits, in order. Deliberately steep — a device that has failed three times is
 * almost always offline rather than briefly unlucky, and retrying a dead radio has a cost the user
 * pays in battery.
 */
export const RETRY_DELAYS_MS = [5_000, 20_000, 60_000] as const;

export type RetryDecision =
  /** Try again in `delayMs`. */
  | { kind: 'retry'; delayMs: number }
  /** Out of retries: tell the user, and let the ordinary triggers start over. */
  | { kind: 'report' };

/**
 * Given how many consecutive failures have already been *retried*, what the run that just failed
 * should do. Zero means this was the first failure, so it takes the first delay.
 */
export function nextRetry(retried: number): RetryDecision {
  const delayMs = RETRY_DELAYS_MS[retried];

  return delayMs === undefined ? { kind: 'report' } : { kind: 'retry', delayMs };
}
