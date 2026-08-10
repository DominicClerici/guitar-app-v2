import { describe, expect, it } from 'vitest';

import { preferencesSyncTable, type LocalPreferenceRow } from './preferences';

const EARLIER = 1_000;
const LATER = 2_000;

const local = (row: Partial<LocalPreferenceRow> = {}): LocalPreferenceRow => ({
  key: 'theme',
  value: 'dark',
  clientUpdatedAt: EARLIER,
  deletedAt: null,
  serverSeq: null,
  ...row,
});

describe('toMutation', () => {
  const toMutation = (row: LocalPreferenceRow) => preferencesSyncTable.toMutation(row);

  it('sends an unpushed write as an upsert', () => {
    expect(toMutation(local())).toEqual({
      op: 'upsert',
      entry: { key: 'theme', value: 'dark' },
      clientUpdatedAt: EARLIER,
    });
  });

  it('sends a tombstone as a delete, without its value', () => {
    expect(toMutation(local({ value: '', deletedAt: LATER }))).toEqual({
      op: 'delete',
      key: 'theme',
      clientUpdatedAt: EARLIER,
    });
  });

  /**
   * Only reachable by downgrading the app below the build that wrote the row. Dropping the row is
   * the alternative to the server rejecting the batch and no preference syncing ever again.
   */
  it('drops a key this build does not know', () => {
    expect(toMutation(local({ key: 'somethingNewer' }))).toBeNull();
  });

  it('drops a value that does not belong to its key', () => {
    expect(toMutation(local({ value: 'sharp' }))).toBeNull();
  });
});

describe('identity', () => {
  /**
   * A pulled row is matched against the local one by identity, so the two sides reading it from
   * different shapes have to agree — they are the same row under `(user_id, key)`.
   */
  it('reads the same row from a local row and a pulled one', () => {
    expect(preferencesSyncTable.identity(local({ key: 'accidentalPreference' }))).toBe(
      preferencesSyncTable.wireIdentity({
        key: 'accidentalPreference',
        value: 'flat',
        clientUpdatedAt: EARLIER,
        deletedAt: null,
        serverSeq: 4,
      }),
    );
  });
});

describe('fromWire', () => {
  it('keeps the sequence value, marking the row as one the server has seen', () => {
    const row = preferencesSyncTable.fromWire({
      key: 'theme',
      value: 'light',
      clientUpdatedAt: LATER,
      deletedAt: null,
      serverSeq: 7,
    });

    expect(row).toEqual({
      key: 'theme',
      value: 'light',
      clientUpdatedAt: LATER,
      deletedAt: null,
      serverSeq: 7,
    });
  });
});
