import { describe, expect, it } from 'vitest';

import {
  mutationKey,
  preferenceMutation,
  preferenceSyncRow,
  SYNC_PUSH_LIMIT,
  SYNCED_TABLE_NAMES,
  syncPullInput,
  syncPushInput,
} from './sync';

describe('preferenceMutation', () => {
  it('accepts an upsert whose value belongs to its key', () => {
    const parsed = preferenceMutation.safeParse({
      op: 'upsert',
      entry: { key: 'theme', value: 'dark' },
      clientUpdatedAt: 1,
    });

    expect(parsed.success).toBe(true);
  });

  /** The reason push validates against `preferenceEntry` rather than a bare string value. */
  it('rejects an upsert whose value belongs to a different key', () => {
    const parsed = preferenceMutation.safeParse({
      op: 'upsert',
      entry: { key: 'theme', value: 'sharp' },
      clientUpdatedAt: 1,
    });

    expect(parsed.success).toBe(false);
  });

  it('rejects a key no version of the app has ever written', () => {
    const parsed = preferenceMutation.safeParse({ op: 'delete', key: 'tempo', clientUpdatedAt: 1 });

    expect(parsed.success).toBe(false);
  });

  it('reads the key off either arm', () => {
    expect(
      mutationKey({ op: 'upsert', entry: { key: 'theme', value: 'dark' }, clientUpdatedAt: 1 }),
    ).toBe('theme');
    expect(mutationKey({ op: 'delete', key: 'accidentalPreference', clientUpdatedAt: 1 })).toBe(
      'accidentalPreference',
    );
  });
});

describe('preferenceSyncRow', () => {
  /**
   * Pulled rows are validated loosely on purpose: a row written by a newer app version has to
   * survive an older version's pull, or that device never advances its cursor again.
   */
  it('accepts a key this version does not know', () => {
    const parsed = preferenceSyncRow.safeParse({
      key: 'somethingNewer',
      value: 'whatever',
      clientUpdatedAt: 1,
      deletedAt: null,
      serverSeq: 7,
    });

    expect(parsed.success).toBe(true);
  });

  it('requires a sequence value, since it is what the cursor is made of', () => {
    const parsed = preferenceSyncRow.safeParse({
      key: 'theme',
      value: 'dark',
      clientUpdatedAt: 1,
      deletedAt: null,
    });

    expect(parsed.success).toBe(false);
  });
});

describe('syncPushInput', () => {
  /**
   * Asserted against the registry rather than a written-out shape: a device that wrote to one
   * table sends only that key, so every other table has to arrive as an empty batch — including
   * tables added after this test was written.
   */
  it('defaults every table nobody wrote to an empty batch', () => {
    const parsed = syncPushInput.parse({});

    expect(Object.keys(parsed).sort()).toEqual([...SYNCED_TABLE_NAMES].sort());
    expect(Object.values(parsed)).toEqual(SYNCED_TABLE_NAMES.map(() => []));
  });

  it('caps a batch, so one request cannot become an unbounded statement', () => {
    const mutation = { op: 'upsert', entry: { key: 'theme', value: 'dark' }, clientUpdatedAt: 1 };
    const oversized = {
      userPreferences: Array.from({ length: SYNC_PUSH_LIMIT + 1 }, () => mutation),
    };

    expect(syncPushInput.safeParse(oversized).success).toBe(false);
  });
});

describe('syncPullInput', () => {
  it('accepts a first pull', () => {
    expect(syncPullInput.parse({ cursor: 0 })).toEqual({ cursor: 0 });
  });

  it('rejects a limit past the page ceiling', () => {
    expect(syncPullInput.safeParse({ cursor: 0, limit: 10_000 }).success).toBe(false);
  });
});
