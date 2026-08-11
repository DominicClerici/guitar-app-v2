import { describe, expect, it } from 'vitest';

import type { RhythmSlot } from '@/lib/content';

import {
  describeBias,
  describeBreakdown,
  describeScore,
  grade,
  matchWindowMs,
  onBandMs,
  summariseRun,
} from './rhythmGrading';
import { buildGrid, type GridSpec } from './rhythmGrid';

const ANCHOR = 1_700_000_000_000;

function gridOf(over: Partial<GridSpec>) {
  return buildGrid({
    bpm: 120,
    beatsPerBar: 4,
    subdivision: 1,
    bars: 1,
    slots: ['hit', 'rest', 'hit', 'rest'],
    ...over,
  });
}

/** Onsets given as milliseconds from the downbeat, before latency is added back on. */
function heard(offsets: number[], latencyMs = 0) {
  return offsets.map((offset) => ({ at: ANCHOR + offset + latencyMs }));
}

const rests = (count: number): RhythmSlot[] => Array.from({ length: count }, () => 'rest');

describe('the judging windows', () => {
  it('is a fraction of a slot, not of a beat', () => {
    // Quarters at 120: slot and beat are the same 500ms, so the two rules agree.
    expect(matchWindowMs(500)).toBe(200);
    // Sixteenths at 120: the slot is 125ms and the window shrinks with it. A beat-relative
    // window would still be 200ms, three neighbouring slots wide.
    expect(matchWindowMs(125)).toBe(50);
  });

  it('bounds the on-the-beat band at both ends', () => {
    // A slow quarter: 18% would be 180ms, which nobody hears as on time.
    expect(onBandMs(1000)).toBe(70);
    // A fast sixteenth: 18% would be 13ms, tighter than the detector's own hop.
    expect(onBandMs(75)).toBe(25);
    expect(onBandMs(300)).toBe(54);
  });

  it('never lets the band outgrow the window it lives inside', () => {
    // 300 bpm sixteenths — the fastest grid the schema allows.
    expect(onBandMs(50)).toBe(matchWindowMs(50));
  });
});

describe('grade', () => {
  it('calls a hit inside the band on time', () => {
    const grid = gridOf({});
    const result = grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 0, onsets: heard([10, 1010]) });

    expect(result.hits.map((hit) => hit.verdict)).toEqual(['on', 'on']);
    expect(result.onTime).toBe(2);
    expect(result.expected).toBe(2);
    expect(result.extras).toEqual([]);
  });

  it('separates early from late by the sign of the deviation', () => {
    const grid = gridOf({});
    const result = grade({
      grid,
      anchorEpochMs: ANCHOR,
      latencyMs: 0,
      onsets: heard([-120, 1120]),
    });

    expect(result.hits.map((hit) => hit.verdict)).toEqual(['early', 'late']);
    expect(result.hits[0].deviationMs).toBe(-120);
    expect(result.hits[1].deviationMs).toBe(120);
  });

  it('reports a hit nobody played as missed', () => {
    const grid = gridOf({});
    const result = grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 0, onsets: heard([0]) });

    expect(result.hits.map((hit) => hit.verdict)).toEqual(['on', 'missed']);
    expect(result.missed).toBe(1);
    expect(result.hits[1].playedAtMs).toBeNull();
    expect(result.hits[1].deviationMs).toBeNull();
  });

  it('counts an onset played in a rest as an extra', () => {
    const grid = gridOf({});
    const result = grade({
      grid,
      anchorEpochMs: ANCHOR,
      latencyMs: 0,
      onsets: heard([0, 500, 1000]),
    });

    expect(result.hits.map((hit) => hit.verdict)).toEqual(['on', 'on']);
    expect(result.extras).toEqual([500]);
  });

  it('matches an onset sitting exactly on the window boundary', () => {
    const grid = gridOf({});
    const result = grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 0, onsets: heard([200, 1000]) });

    expect(result.matchWindowMs).toBe(200);
    expect(result.hits[0].verdict).toBe('late');
    expect(result.hits[0].deviationMs).toBe(200);
    expect(result.extras).toEqual([]);
  });

  it('drops an onset a hair outside it to extras', () => {
    const grid = gridOf({});
    const result = grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 0, onsets: heard([201, 1000]) });

    expect(result.hits[0].verdict).toBe('missed');
    expect(result.extras).toEqual([201]);
  });

  it('gives a slot to the nearer of two onsets and calls the other an extra', () => {
    const grid = gridOf({});
    const result = grade({
      grid,
      anchorEpochMs: ANCHOR,
      latencyMs: 0,
      onsets: heard([-150, 20, 1000]),
    });

    expect(result.hits[0].verdict).toBe('on');
    expect(result.hits[0].deviationMs).toBe(20);
    expect(result.extras).toEqual([-150]);
  });

  it('ignores onsets from outside the pattern altogether', () => {
    const grid = gridOf({});
    const result = grade({
      grid,
      anchorEpochMs: ANCHOR,
      latencyMs: 0,
      // One during the count-in, one after the last bar has run out.
      onsets: heard([-900, 0, 1000, 2600]),
    });

    expect(result.onTime).toBe(2);
    expect(result.extras).toEqual([]);
  });

  it('places a sixteenth-note onset on the slot it belongs to, not the beat', () => {
    // Sixteenths at 120: 125ms slots. The hits are a beat apart; the stray onset is 160ms
    // after the first, which a ±40%-of-a-BEAT window (±200ms) would have absorbed into it
    // and graded 'late'. Against ±40% of a slot (±50ms) it is what it actually was: a pick
    // in a rest, one and a bit slots off the hit.
    const grid = gridOf({
      subdivision: 4,
      slots: ['hit', ...rests(7), 'hit', ...rests(7)],
    });

    expect(grid.slotMs).toBe(125);

    const result = grade({
      grid,
      anchorEpochMs: ANCHOR,
      latencyMs: 0,
      onsets: heard([0, 160, 1000]),
    });

    expect(result.matchWindowMs).toBe(50);
    expect(result.hits.map((hit) => hit.verdict)).toEqual(['on', 'on']);
    expect(result.extras).toEqual([160]);
  });

  it('shifts a verdict by subtracting the calibrated round trip', () => {
    const grid = gridOf({});
    // Played 65ms after the downbeat, but timestamped 60ms later still because that is how
    // long the click took to reach the ear and the pick to reach the microphone.
    const onsets = heard([65], 60);

    expect(grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 0, onsets }).hits[0].verdict).toBe(
      'late',
    );
    expect(grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 60, onsets }).hits[0].verdict).toBe(
      'on',
    );
  });
});

describe('bias', () => {
  it('is steady when the deviations are small either way', () => {
    const grid = gridOf({});
    const result = grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 0, onsets: heard([-10, 1010]) });

    expect(result.meanDeviationMs).toBe(0);
    expect(result.bias).toBe('steady');
  });

  it('reads a consistent rush as ahead of the beat', () => {
    const grid = gridOf({ slots: ['hit', 'hit', 'hit', 'hit'] });
    const result = grade({
      grid,
      anchorEpochMs: ANCHOR,
      latencyMs: 0,
      onsets: heard([-90, 410, 910, 1410]),
    });

    expect(result.meanDeviationMs).toBe(-90);
    expect(result.bias).toBe('ahead');
    expect(describeBias(result.bias)).toContain('ahead of the beat');
  });

  it('reads a small drag as only slightly behind', () => {
    const grid = gridOf({ slots: ['hit', 'hit', 'hit', 'hit'] });
    const result = grade({
      grid,
      anchorEpochMs: ANCHOR,
      latencyMs: 0,
      onsets: heard([40, 540, 1040, 1540]),
    });

    expect(result.bias).toBe('slightly-behind');
  });

  it('says nothing at all when nothing landed', () => {
    const grid = gridOf({});
    const result = grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 0, onsets: [] });

    expect(result.missed).toBe(2);
    expect(result.meanDeviationMs).toBeNull();
    expect(result.bias).toBe('unknown');
    expect(describeScore(result)).toBe('0 of 2 on time');
  });
});

describe('the written report', () => {
  it('counts what went wrong without ever naming a millisecond', () => {
    const grid = gridOf({ slots: ['hit', 'hit', 'hit', 'hit'] });
    const result = grade({
      grid,
      anchorEpochMs: ANCHOR,
      latencyMs: 0,
      onsets: heard([0, 380, 1120, 1750]),
    });

    expect(describeScore(result)).toBe('1 of 4 on time');
    expect(describeBreakdown(result)).toBe('1 early, 1 late, 1 not heard, 1 in a rest');
    expect(describeBreakdown(result)).not.toMatch(/ms/);
  });

  it('has something to say when everything landed', () => {
    const grid = gridOf({});
    const result = grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 0, onsets: heard([0, 1000]) });

    expect(describeBreakdown(result)).toBe('Nothing landed outside the window.');
  });
});

describe('summariseRun', () => {
  it('weights the bias by the hits that actually landed, not by round', () => {
    const grid = gridOf({ slots: ['hit', 'hit', 'hit', 'hit'] });
    // Three hits, every one of them 150ms ahead of the beat.
    const rushed = grade({
      grid,
      anchorEpochMs: ANCHOR,
      latencyMs: 0,
      onsets: heard([-150, 350, 850]),
    });
    // One hit, 150ms behind. Averaging the two rounds' means would come to exactly zero and
    // report a learner who rushed nine times out of ten as dead steady.
    const single = grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 0, onsets: heard([150]) });

    const run = summariseRun([rushed, single]);

    expect(run.expected).toBe(8);
    expect(run.onTime).toBe(0);
    expect(run.bias).toBe('ahead');
  });

  it('has no verdict on a run where nothing connected', () => {
    const grid = gridOf({});
    const empty = grade({ grid, anchorEpochMs: ANCHOR, latencyMs: 0, onsets: [] });

    expect(summariseRun([empty])).toEqual({ onTime: 0, expected: 2, bias: 'unknown' });
  });
});
