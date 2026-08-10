import type { PreferenceSyncRow } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import {
  acceptsAdopted,
  acceptsRemote,
  needsFullResync,
  toPushOperations,
  type LocalPreferenceRow,
} from './reconcile';

const EARLIER = 1_000;
const LATER = 2_000;

const local = (row: Partial<LocalPreferenceRow> = {}): LocalPreferenceRow => ({
  key: 'theme',
  value: 'dark',
  clientUpdatedAt: EARLIER,
  deletedAt: null,
  serverSeq: 1,
  ...row,
});

const remote = (row: Partial<PreferenceSyncRow> = {}): PreferenceSyncRow => ({
  key: 'theme',
  value: 'light',
  clientUpdatedAt: LATER,
  deletedAt: null,
  serverSeq: 2,
  ...row,
});

describe('acceptsRemote', () => {
  it('takes a row the device has never seen', () => {
    expect(acceptsRemote(undefined, remote())).toBe(true);
  });

  it('takes a row over a local copy the server already has', () => {
    expect(
      acceptsRemote(
        local({ clientUpdatedAt: LATER, serverSeq: 9 }),
        remote({ clientUpdatedAt: EARLIER }),
      ),
    ).toBe(true);
  });

  it('keeps a local write that has not been pushed and is newer', () => {
    expect(
      acceptsRemote(
        local({ clientUpdatedAt: LATER, serverSeq: null }),
        remote({ clientUpdatedAt: EARLIER }),
      ),
    ).toBe(false);
  });

  it('takes the server row when an unpushed local write is older', () => {
    expect(
      acceptsRemote(
        local({ clientUpdatedAt: EARLIER, serverSeq: null }),
        remote({ clientUpdatedAt: LATER }),
      ),
    ).toBe(true);
  });

  /** A tie has to break the same way everywhere, or two devices each keep their own value. */
  it('gives a tie to the server', () => {
    expect(
      acceptsRemote(
        local({ clientUpdatedAt: LATER, serverSeq: null }),
        remote({ clientUpdatedAt: LATER }),
      ),
    ).toBe(true);
  });
});

describe('acceptsAdopted', () => {
  it('carries a row over to an account that has nothing for that key', () => {
    expect(acceptsAdopted(undefined, local())).toBe(true);
  });

  it('carries it over when the guest wrote later', () => {
    expect(
      acceptsAdopted(local({ clientUpdatedAt: EARLIER }), local({ clientUpdatedAt: LATER })),
    ).toBe(true);
  });

  it('leaves the account alone when the account wrote later', () => {
    expect(
      acceptsAdopted(local({ clientUpdatedAt: LATER }), local({ clientUpdatedAt: EARLIER })),
    ).toBe(false);
  });

  /** Unlike a pull, a tie here keeps what is already there: the guest row has no claim to be newer. */
  it('leaves the account alone on a tie', () => {
    expect(
      acceptsAdopted(local({ clientUpdatedAt: LATER }), local({ clientUpdatedAt: LATER })),
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

describe('toPushOperations', () => {
  it('sends an unpushed write as an upsert', () => {
    expect(toPushOperations([local({ serverSeq: null })])).toEqual([
      { op: 'upsert', entry: { key: 'theme', value: 'dark' }, clientUpdatedAt: EARLIER },
    ]);
  });

  it('sends a tombstone as a delete, without its value', () => {
    expect(toPushOperations([local({ serverSeq: null, value: '', deletedAt: LATER })])).toEqual([
      { op: 'delete', key: 'theme', clientUpdatedAt: EARLIER },
    ]);
  });

  /**
   * Only reachable by downgrading the app below the build that wrote the row. Dropping the row is
   * the alternative to the server rejecting the batch and no preference syncing ever again.
   */
  it('drops a key this build does not know', () => {
    expect(toPushOperations([local({ key: 'somethingNewer', serverSeq: null })])).toEqual([]);
  });

  it('drops a value that does not belong to its key', () => {
    expect(toPushOperations([local({ value: 'sharp', serverSeq: null })])).toEqual([]);
  });

  it('keeps the rows around a dropped one', () => {
    const rows = [
      local({ key: 'somethingNewer', serverSeq: null }),
      local({ key: 'accidentalPreference', value: 'flat', serverSeq: null }),
    ];

    expect(toPushOperations(rows)).toHaveLength(1);
  });
});
