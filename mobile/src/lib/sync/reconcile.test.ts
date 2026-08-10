import { describe, expect, it } from 'vitest';

import {
  lastWriteWinsAcceptsAdopted,
  lastWriteWinsAcceptsRemote,
  needsFullResync,
} from './reconcile';

const EARLIER = 1_000;
const LATER = 2_000;

interface Row {
  clientUpdatedAt: number;
  deletedAt: number | null;
  serverSeq: number | null;
}

const row = (overrides: Partial<Row> = {}): Row => ({
  clientUpdatedAt: EARLIER,
  deletedAt: null,
  serverSeq: 1,
  ...overrides,
});

describe('lastWriteWinsAcceptsRemote', () => {
  it('takes a row the device has never seen', () => {
    expect(lastWriteWinsAcceptsRemote(undefined, { clientUpdatedAt: LATER })).toBe(true);
  });

  it('takes a row over a local copy the server already has', () => {
    expect(
      lastWriteWinsAcceptsRemote(row({ clientUpdatedAt: LATER, serverSeq: 9 }), {
        clientUpdatedAt: EARLIER,
      }),
    ).toBe(true);
  });

  it('keeps a local write that has not been pushed and is newer', () => {
    expect(
      lastWriteWinsAcceptsRemote(row({ clientUpdatedAt: LATER, serverSeq: null }), {
        clientUpdatedAt: EARLIER,
      }),
    ).toBe(false);
  });

  it('takes the server row when an unpushed local write is older', () => {
    expect(
      lastWriteWinsAcceptsRemote(row({ clientUpdatedAt: EARLIER, serverSeq: null }), {
        clientUpdatedAt: LATER,
      }),
    ).toBe(true);
  });

  /** A tie has to break the same way everywhere, or two devices each keep their own value. */
  it('gives a tie to the server', () => {
    expect(
      lastWriteWinsAcceptsRemote(row({ clientUpdatedAt: LATER, serverSeq: null }), {
        clientUpdatedAt: LATER,
      }),
    ).toBe(true);
  });
});

describe('lastWriteWinsAcceptsAdopted', () => {
  it('carries a row over to an account that has nothing under that identity', () => {
    expect(lastWriteWinsAcceptsAdopted(undefined, row())).toBe(true);
  });

  it('carries it over when the guest wrote later', () => {
    expect(
      lastWriteWinsAcceptsAdopted(
        row({ clientUpdatedAt: EARLIER }),
        row({ clientUpdatedAt: LATER }),
      ),
    ).toBe(true);
  });

  it('leaves the account alone when the account wrote later', () => {
    expect(
      lastWriteWinsAcceptsAdopted(
        row({ clientUpdatedAt: LATER }),
        row({ clientUpdatedAt: EARLIER }),
      ),
    ).toBe(false);
  });

  /** Unlike a pull, a tie here keeps what is already there: the guest row has no claim to be newer. */
  it('leaves the account alone on a tie', () => {
    expect(
      lastWriteWinsAcceptsAdopted(row({ clientUpdatedAt: LATER }), row({ clientUpdatedAt: LATER })),
    ).toBe(false);
  });
});

describe('needsFullResync', () => {
  it('is false for a cursor the server can still serve', () => {
    expect(needsFullResync(10, 0)).toBe(false);
  });

  it('is false at the boundary', () => {
    expect(needsFullResync(10, 10)).toBe(false);
  });

  it('is true once tombstones the device never saw have been purged', () => {
    expect(needsFullResync(10, 11)).toBe(true);
  });
});
