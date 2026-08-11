import { describe, expect, it } from 'vitest';

import {
  ActivityParseError,
  midiForTarget,
  parseActivityDocument,
  parseActivityMeta,
  runnableRounds,
} from './activity';

const meta = {
  id: 'activity_test',
  slug: 'test-activity',
  title: 'Test Activity',
};

const doc = (activity: unknown, extra: Record<string, unknown> = {}) => ({
  schemaVersion: 1,
  meta,
  activity,
  ...extra,
});

const targets = (id: string, extra: Record<string, unknown> = {}) => ({
  kind: 'targets',
  id,
  prompt: [{ text: 'Find every C' }],
  targets: [
    { string: 2, fret: 1 },
    { string: 5, fret: 3 },
  ],
  ...extra,
});

const notePlay = (rounds: unknown[], extra: Record<string, unknown> = {}) => ({
  kind: 'note-play',
  modes: ['easy', 'hard'],
  rounds,
  ...extra,
});

const pattern = (id: string, extra: Record<string, unknown> = {}) => ({
  kind: 'pattern',
  id,
  prompt: [{ text: 'Play along' }],
  bpm: 90,
  beatsPerBar: 4,
  subdivision: 2,
  bars: 1,
  slots: ['accent', 'rest', 'hit', 'rest', 'hit', 'rest', 'hit', 'rest'],
  ...extra,
});

const rhythm = (rounds: unknown[]) => ({ kind: 'rhythm', rounds });

describe('parseActivityDocument', () => {
  it('parses a note-play activity', () => {
    const parsed = parseActivityDocument(
      doc(
        notePlay(
          [targets('r1', { ordered: true }), targets('r2', { board: { fretFrom: 0, fretTo: 5 } })],
          {
            board: { fretFrom: 0, fretTo: 12 },
          },
        ),
      ),
    );

    const activity = parsed.activity;
    if (activity.kind !== 'note-play') throw new Error('expected note-play');
    expect(activity.modes).toEqual(['easy', 'hard']);
    expect(activity.board).toEqual({ fretFrom: 0, fretTo: 12 });
    expect(runnableRounds(activity.rounds)).toHaveLength(2);

    const round = activity.rounds[0];
    if (round?.kind !== 'targets') throw new Error('expected targets');
    expect(round.ordered).toBe(true);
    expect(round.targets).toEqual([
      { string: 2, fret: 1 },
      { string: 5, fret: 3 },
    ]);
  });

  it('parses a rhythm activity', () => {
    const parsed = parseActivityDocument(doc(rhythm([pattern('r1', { countInBars: 2 })])));

    const activity = parsed.activity;
    if (activity.kind !== 'rhythm') throw new Error('expected rhythm');

    const round = activity.rounds[0];
    if (round?.kind !== 'pattern') throw new Error('expected pattern');
    expect(round.slots).toHaveLength(8);
    expect(round.countInBars).toBe(2);
    expect(runnableRounds(activity.rounds)).toHaveLength(1);
  });

  it('dedupes and canonicalises the modes it was given', () => {
    const parsed = parseActivityDocument(
      doc(notePlay([targets('r1')], { modes: ['hard', 'easy', 'hard'] })),
    );

    const activity = parsed.activity;
    if (activity.kind !== 'note-play') throw new Error('expected note-play');
    expect(activity.modes).toEqual(['easy', 'hard']);
  });

  it('turns an unknown activity kind into a placeholder activity', () => {
    const parsed = parseActivityDocument(doc({ kind: 'sing-along', rounds: [] }));
    expect(parsed.activity).toEqual({ kind: 'unknown', originalKind: 'sing-along' });
  });

  it('degrades an unknown activity kind whatever the rest of its payload holds', () => {
    // Nothing about a kind we've never heard of may throw: a future activity
    // need not be round-based at all.
    const roundless = parseActivityDocument(doc({ kind: 'sing-along', melody: 'C D E' }));
    expect(roundless.activity).toEqual({ kind: 'unknown', originalKind: 'sing-along' });

    const misshapen = parseActivityDocument(doc({ kind: 'sing-along', rounds: 'nope' }));
    expect(misshapen.activity).toEqual({ kind: 'unknown', originalKind: 'sing-along' });
  });

  it('degrades an activity with no readable kind', () => {
    for (const activity of ['nope', 42, [], null, { rounds: [] }, { kind: 7 }, { kind: '' }]) {
      expect(parseActivityDocument(doc(activity)).activity).toEqual({
        kind: 'unknown',
        originalKind: '(unspecified)',
      });
    }
  });

  it('turns a known activity kind with an invalid payload into a placeholder activity', () => {
    const parsed = parseActivityDocument(
      doc(notePlay([targets('r1')], { board: { fretFrom: 9 } })),
    );
    expect(parsed.activity).toEqual({ kind: 'unknown', originalKind: 'note-play' });
  });

  it('turns a note-play activity with no modes into a placeholder activity', () => {
    const parsed = parseActivityDocument(doc(notePlay([targets('r1')], { modes: [] })));
    expect(parsed.activity).toEqual({ kind: 'unknown', originalKind: 'note-play' });

    const absent = parseActivityDocument(doc({ kind: 'note-play', rounds: [targets('r1')] }));
    expect(absent.activity).toEqual({ kind: 'unknown', originalKind: 'note-play' });
  });

  it('turns an unknown round kind into a placeholder kept in the list', () => {
    const parsed = parseActivityDocument(
      doc(notePlay([targets('r1'), { kind: 'hum-it', id: 'r2', pitch: 'A440' }, targets('r3')])),
    );

    const activity = parsed.activity;
    if (activity.kind !== 'note-play') throw new Error('expected note-play');
    expect(activity.rounds).toHaveLength(3);
    expect(activity.rounds[1]).toEqual({ kind: 'unknown', id: 'r2' });
    expect(runnableRounds(activity.rounds).map((round) => round.id)).toEqual(['r1', 'r3']);
  });

  it('turns a round whose targets repeat a pitch into a placeholder', () => {
    // Both positions sound E4 — the detector cannot tell them apart.
    const parsed = parseActivityDocument(
      doc(
        notePlay([
          targets('r1', {
            targets: [
              { string: 1, fret: 0 },
              { string: 2, fret: 5 },
            ],
          }),
        ]),
      ),
    );

    const activity = parsed.activity;
    if (activity.kind !== 'note-play') throw new Error('expected note-play');
    expect(activity.rounds[0]).toEqual({ kind: 'unknown', id: 'r1' });
    expect(runnableRounds(activity.rounds)).toHaveLength(0);
  });

  it('turns a round targeting a fret outside the declared window into a placeholder', () => {
    const outsideDocument = parseActivityDocument(
      doc(
        notePlay([targets('r1', { targets: [{ string: 3, fret: 9 }] })], {
          board: { fretFrom: 0, fretTo: 5 },
        }),
      ),
    );

    const documentActivity = outsideDocument.activity;
    if (documentActivity.kind !== 'note-play') throw new Error('expected note-play');
    expect(documentActivity.rounds[0]).toEqual({ kind: 'unknown', id: 'r1' });

    // The round's own window wins, so the same target is fine when it widens it.
    const overridden = parseActivityDocument(
      doc(
        notePlay(
          [
            targets('r1', {
              targets: [{ string: 3, fret: 9 }],
              board: { fretFrom: 7, fretTo: 12 },
            }),
          ],
          { board: { fretFrom: 0, fretTo: 5 } },
        ),
      ),
    );

    const overriddenActivity = overridden.activity;
    if (overriddenActivity.kind !== 'note-play') throw new Error('expected note-play');
    expect(overriddenActivity.rounds[0]?.kind).toBe('targets');
  });

  it('turns a round whose slot count misses its grid into a placeholder', () => {
    const parsed = parseActivityDocument(
      doc(rhythm([pattern('r1', { slots: ['hit', 'rest', 'hit'] })])),
    );

    const activity = parsed.activity;
    if (activity.kind !== 'rhythm') throw new Error('expected rhythm');
    expect(activity.rounds[0]).toEqual({ kind: 'unknown', id: 'r1' });
  });

  it('turns an all-rest round into a placeholder', () => {
    const parsed = parseActivityDocument(
      doc(rhythm([pattern('r1', { slots: Array.from({ length: 8 }, () => 'rest') })])),
    );

    const activity = parsed.activity;
    if (activity.kind !== 'rhythm') throw new Error('expected rhythm');
    expect(activity.rounds[0]).toEqual({ kind: 'unknown', id: 'r1' });
    expect(runnableRounds(activity.rounds)).toHaveLength(0);
  });

  it('drops unknown marks in a prompt but keeps the text', () => {
    const parsed = parseActivityDocument(
      doc(notePlay([targets('r1', { prompt: [{ text: 'Hi', marks: ['bold', 'sparkle'] }] })])),
    );

    const activity = parsed.activity;
    if (activity.kind !== 'note-play') throw new Error('expected note-play');
    const round = activity.rounds[0];
    if (round?.kind !== 'targets') throw new Error('expected targets');
    expect(round.prompt[0]?.marks).toEqual(['bold']);
  });

  it('rejects an unsupported schemaVersion', () => {
    expect(() => parseActivityDocument({ schemaVersion: 2, meta, activity: notePlay([]) })).toThrow(
      ActivityParseError,
    );
  });

  it('rejects a document with no activity at all', () => {
    // Distinct from an activity we can't read: there is nothing here for a
    // future build to have written, so it is damage rather than novelty.
    expect(() => parseActivityDocument({ schemaVersion: 1, meta })).toThrow(ActivityParseError);
  });

  it('rejects a known activity kind whose rounds are not an array', () => {
    expect(() => parseActivityDocument(doc({ kind: 'rhythm', rounds: 'nope' }))).toThrow(
      ActivityParseError,
    );
    expect(() => parseActivityDocument(doc({ kind: 'rhythm' }))).toThrow(ActivityParseError);
    expect(() => parseActivityDocument(doc({ kind: 'note-play', modes: ['easy'] }))).toThrow(
      ActivityParseError,
    );
  });

  it('rejects a round that is not an object with a string id', () => {
    expect(() => parseActivityDocument(doc(notePlay([{ kind: 'hum-it' }])))).toThrow(
      ActivityParseError,
    );
    expect(() => parseActivityDocument(doc(rhythm([42])))).toThrow(ActivityParseError);
  });

  it('rejects a document with invalid meta', () => {
    expect(() =>
      parseActivityDocument({
        schemaVersion: 1,
        meta: { ...meta, slug: '' },
        activity: rhythm([]),
      }),
    ).toThrow(ActivityParseError);
  });
});

describe('parseActivityMeta', () => {
  it('parses meta with and without a summary', () => {
    expect(parseActivityMeta(meta)).toEqual(meta);
    expect(parseActivityMeta({ ...meta, summary: 'Find the notes' }).summary).toBe(
      'Find the notes',
    );
  });

  it('rejects meta missing a title', () => {
    expect(() => parseActivityMeta({ id: 'a', slug: 'a' })).toThrow(ActivityParseError);
  });
});

describe('midiForTarget', () => {
  it('places the standard-tuning anchors', () => {
    expect(midiForTarget({ string: 6, fret: 0 })).toBe(40);
    expect(midiForTarget({ string: 1, fret: 0 })).toBe(64);
    expect(midiForTarget({ string: 5, fret: 5 })).toBe(50);
    expect(midiForTarget({ string: 1, fret: 12 })).toBe(76);
  });

  it('refuses a string that is not on the neck', () => {
    expect(() => midiForTarget({ string: 7, fret: 0 })).toThrow(ActivityParseError);
  });
});
