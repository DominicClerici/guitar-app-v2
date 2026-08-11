import { describe, expect, it } from 'vitest';

import type { FretPosition, NotePlayRound } from '@/lib/content';

import {
  boardWindow,
  deriveWindow,
  emptyProgress,
  liveTargets,
  nextRoundIndex,
  noteLabel,
  observeFrame,
  roundComplete,
  targetLabel,
  type RoundProgress,
} from './notePlay';

// Pitches, for reading the frame sequences below. String 1 is the high e.
const E4: FretPosition = { string: 1, fret: 0 }; // 64
const C4: FretPosition = { string: 2, fret: 1 }; // 60
const A3: FretPosition = { string: 3, fret: 2 }; // 57
const G2: FretPosition = { string: 6, fret: 3 }; // 43

function round(targets: FretPosition[], extra: Partial<NotePlayRound> = {}): NotePlayRound {
  return { kind: 'targets', id: 'r1', prompt: [], targets, ...extra };
}

/** Feeds a sequence of detected pitches through a round; null is a frame of silence. */
function play(
  r: NotePlayRound,
  midis: (number | null)[],
  from: RoundProgress = emptyProgress,
): RoundProgress {
  return midis.reduce((progress, midi) => observeFrame(r, progress, midi), from);
}

describe('deriveWindow', () => {
  it('reaches down to the nut for a shape sitting near it', () => {
    expect(deriveWindow([{ string: 1, fret: 3 }, C4])).toEqual({ fretFrom: 0, fretTo: 4 });
  });

  it('leaves the nut alone for a shape high on the neck', () => {
    const window = deriveWindow([
      { string: 1, fret: 19 },
      { string: 6, fret: 21 },
    ]);

    expect(window.fretFrom).toBe(18);
    expect(window.fretTo).toBe(22);
  });

  it('widens a single target into a board wide enough to place', () => {
    const window = deriveWindow([{ string: 4, fret: 17 }]);

    expect(window.fretTo - window.fretFrom + 1).toBeGreaterThanOrEqual(5);
    expect(window.fretFrom).toBeLessThanOrEqual(17);
    expect(window.fretTo).toBeGreaterThanOrEqual(17);
  });

  it('keeps a target past the drawn neck inside the window rather than clamping it away', () => {
    const window = deriveWindow([{ string: 6, fret: 24 }]);

    expect(window.fretTo).toBeGreaterThanOrEqual(24);
  });
});

describe('boardWindow', () => {
  const documentBoard = { fretFrom: 0, fretTo: 12 };

  it('prefers the round’s own window', () => {
    const r = round([C4], { board: { fretFrom: 0, fretTo: 3 } });
    expect(boardWindow(r, documentBoard)).toEqual({ fretFrom: 0, fretTo: 3 });
  });

  it('falls back to the document’s', () => {
    expect(boardWindow(round([C4]), documentBoard)).toEqual(documentBoard);
  });

  it('derives one when neither names a window', () => {
    expect(boardWindow(round([{ string: 4, fret: 9 }]))).toEqual({ fretFrom: 7, fretTo: 11 });
  });
});

describe('liveTargets', () => {
  it('offers every unhit target in an unordered round', () => {
    expect(liveTargets(round([E4, C4, G2]), new Set([1]))).toEqual([0, 2]);
  });

  it('offers only the next one in an ordered round', () => {
    const r = round([E4, C4, G2], { ordered: true });

    expect(liveTargets(r, new Set())).toEqual([0]);
    expect(liveTargets(r, new Set([0]))).toEqual([1]);
  });

  it('offers nothing once every target is found', () => {
    expect(liveTargets(round([E4]), new Set([0]))).toEqual([]);
  });
});

describe('observeFrame', () => {
  it('registers a hit on two consecutive frames of the same pitch', () => {
    const progress = play(round([E4, C4]), [64, 64]);

    expect([...progress.hits]).toEqual([0]);
    expect(progress.pending).toBeNull();
  });

  it('never registers a hit from frames that alternate between two targets', () => {
    const progress = play(round([E4, C4]), [64, 60, 64, 60, 64, 60]);

    expect(progress.hits.size).toBe(0);
  });

  it('breaks the run on a frame of silence between two matching frames', () => {
    const progress = play(round([E4]), [64, null, 64]);

    expect(progress.hits.size).toBe(0);
    expect(progress.pending).toBe(0);
  });

  it('registers nothing for a pitch on no target, and drops a pending match', () => {
    const progress = play(round([E4, C4]), [64, 61, 61]);

    expect(progress.hits.size).toBe(0);
    expect(progress.pending).toBeNull();
  });

  it('leaves a found target found when its pitch is played again', () => {
    const found = play(round([E4, C4]), [64, 64]);
    const again = play(round([E4, C4]), [64, 64], found);

    expect([...again.hits]).toEqual([0]);
    expect(again.pending).toBeNull();
  });

  it('accepts targets in any order when the round is unordered', () => {
    const r = round([E4, C4, A3]);
    const progress = play(r, [57, 57, 60, 60, 64, 64]);

    expect(roundComplete(r, progress)).toBe(true);
  });

  it('ignores a later target’s pitch while an ordered round waits on an earlier one', () => {
    const r = round([E4, C4, A3], { ordered: true });
    const progress = play(r, [57, 57, 60, 60]);

    expect(progress.hits.size).toBe(0);
  });

  it('walks an ordered round one target at a time', () => {
    const r = round([E4, C4], { ordered: true });
    const progress = play(r, [64, 64, 60, 60]);

    expect(roundComplete(r, progress)).toBe(true);
  });

  it('hands back the same progress when a frame changes nothing', () => {
    const r = round([E4]);

    // The runner feeds every 30ms frame straight to setState; identity here is what keeps a
    // silent room from re-rendering the board.
    expect(observeFrame(r, emptyProgress, null)).toBe(emptyProgress);
    expect(observeFrame(r, emptyProgress, 61)).toBe(emptyProgress);
  });
});

describe('roundComplete', () => {
  it('is false until every target is found', () => {
    const r = round([E4, C4]);
    const progress = play(r, [64, 64]);

    expect(roundComplete(r, progress)).toBe(false);
    expect(roundComplete(r, play(r, [60, 60], progress))).toBe(true);
  });
});

describe('nextRoundIndex', () => {
  it('steps forward, then ends the run after the last round', () => {
    expect(nextRoundIndex(0, 3)).toBe(1);
    expect(nextRoundIndex(1, 3)).toBe(2);
    expect(nextRoundIndex(2, 3)).toBeNull();
  });
});

describe('labels', () => {
  it('names a pitch the way a learner reads it', () => {
    expect(noteLabel(64)).toBe('E4');
    expect(noteLabel(58)).toBe('A#3');
  });

  it('names what a target sounds', () => {
    expect(targetLabel(A3)).toBe('A3');
    expect(targetLabel(G2)).toBe('G2');
  });
});
