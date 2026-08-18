import { describe, expect, it } from 'vitest';

import { nextRetry, RETRY_DELAYS_MS } from './retry';

describe('nextRetry', () => {
  it('waits five seconds after the first failure', () => {
    expect(nextRetry(0)).toEqual({ kind: 'retry', delayMs: 5_000 });
  });

  it('backs off to twenty seconds, then a minute', () => {
    expect(nextRetry(1)).toEqual({ kind: 'retry', delayMs: 20_000 });
    expect(nextRetry(2)).toEqual({ kind: 'retry', delayMs: 60_000 });
  });

  it('reports to the user once three retries have failed', () => {
    expect(nextRetry(RETRY_DELAYS_MS.length)).toEqual({ kind: 'report' });
  });

  it('keeps reporting rather than retrying past the end of the schedule', () => {
    expect(nextRetry(RETRY_DELAYS_MS.length + 5)).toEqual({ kind: 'report' });
  });
});
