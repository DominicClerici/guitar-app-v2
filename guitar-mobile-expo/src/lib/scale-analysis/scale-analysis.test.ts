import { describe, expect, it } from 'vitest';

import type {
  ChordFeature,
  KeyCandidate,
  ProgressionChord,
  SeventhQuality,
  TriadQuality,
} from '@/lib/key-analysis';

import { scalePlanFor } from './analyze';
import type { ScalePlan } from './types';

// ---------------------------------------------------------------------------
// Chord-symbol fixtures, in the same spirit as key-analysis.test.ts: a case
// reads as the progression a player would type, not as fret positions.
// ---------------------------------------------------------------------------

const PITCH_CLASS: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

interface QualitySpec {
  triad: TriadQuality;
  seventh: SeventhQuality;
  intervals: number[];
}

const QUALITIES: Record<string, QualitySpec> = {
  '': { triad: 'maj', seventh: 'none', intervals: [0, 4, 7] },
  m: { triad: 'min', seventh: 'none', intervals: [0, 3, 7] },
  dim: { triad: 'dim', seventh: 'none', intervals: [0, 3, 6] },
  dim7: { triad: 'dim', seventh: 'dim7', intervals: [0, 3, 6, 9] },
  '7': { triad: 'maj', seventh: 'min7', intervals: [0, 4, 7, 10] },
  maj7: { triad: 'maj', seventh: 'maj7', intervals: [0, 4, 7, 11] },
  m7: { triad: 'min', seventh: 'min7', intervals: [0, 3, 7, 10] },
};

let nextId = 0;

function featureOf(symbol: string): ChordFeature {
  const parsed = /^([A-G][#b]?)(.*)$/.exec(symbol);
  if (!parsed) throw new Error(`unparseable chord symbol: ${symbol}`);
  const spec = QUALITIES[parsed[2]];
  if (!spec) throw new Error(`unsupported quality "${parsed[2]}" in ${symbol}`);

  const rootPc = PITCH_CLASS[parsed[1]];
  return {
    rootPc,
    bassPc: null,
    triad: spec.triad,
    seventh: spec.seventh,
    pitchClasses: spec.intervals.map((i) => (rootPc + i) % 12),
  };
}

function chord(symbol: string): ProgressionChord {
  nextId += 1;
  return { id: `fixture-${nextId}`, voicing: [], readings: [featureOf(symbol)], pinned: null };
}

/** A key candidate as the estimator would emit it, without running the estimator. */
function keyOf(tonic: string, mode: 'major' | 'minor', count: number): KeyCandidate {
  return {
    tonicPc: PITCH_CLASS[tonic],
    mode,
    name: `${tonic} ${mode}`,
    score: 0,
    confidence: 1,
    assignment: Array.from({ length: count }, () => 0),
  };
}

function plan(symbols: string[], tonic: string, mode: 'major' | 'minor'): ScalePlan {
  const chords = symbols.map(chord);
  const result = scalePlanFor(chords, keyOf(tonic, mode, chords.length));
  if (!result) throw new Error('expected a plan');
  return result;
}

// ---------------------------------------------------------------------------

describe('global scale and coverage', () => {
  it('covers a fully diatonic progression with the key scale and no exceptions', () => {
    const p = plan(['C', 'Am', 'F', 'G'], 'C', 'major');
    expect(p.global.type.id).toBe('major');
    expect(p.global.root).toBe('C');
    expect(p.covered).toEqual([true, true, true, true]);
    expect(p.exceptions).toEqual([]);
  });

  it('spells the global scale on the key signature side', () => {
    const p = plan(['F', 'Bb', 'C7', 'F'], 'F', 'major');
    expect(p.global.notes).toContain('Bb');
    expect(p.global.notes).not.toContain('A#');
  });

  it('uses the natural minor scale for a minor key', () => {
    const p = plan(['Am', 'Dm', 'Em', 'Am'], 'A', 'minor');
    expect(p.global.type.id).toBe('minor');
    expect(p.global.root).toBe('A');
    expect(p.exceptions).toEqual([]);
  });
});

describe('pentatonic verdict', () => {
  it('names the relative minor pentatonic for a major key, with the major alias', () => {
    const p = plan(['C', 'Am', 'F', 'G'], 'C', 'major');
    expect(p.pentatonic.scale.root).toBe('A');
    expect(p.pentatonic.scale.type.id).toBe('minor-pentatonic');
    expect(p.pentatonic.alias?.root).toBe('C');
    expect(p.pentatonic.alias?.type.id).toBe('major-pentatonic');
    expect(p.pentatonic.survives).toBe(true);
  });

  it('keeps the tonic pentatonic in a minor key', () => {
    const p = plan(['Am', 'Dm', 'Em', 'Am'], 'A', 'minor');
    expect(p.pentatonic.scale.root).toBe('A');
    expect(p.pentatonic.survives).toBe(true);
  });

  it('flags the chords a borrowed chord makes the pentatonic rub against', () => {
    const p = plan(['C', 'Fm', 'C', 'G'], 'C', 'major');
    expect(p.pentatonic.survives).toBe(false);
    expect(p.pentatonic.clashes).toEqual([1]);
  });
});

describe('exception spans and deltas', () => {
  it('hears a secondary dominant as one raised note: V/vi means G→G♯, A harmonic minor', () => {
    const p = plan(['C', 'E7', 'Am', 'F'], 'C', 'major');
    expect(p.exceptions).toHaveLength(1);

    const span = p.exceptions[0];
    expect(span.start).toBe(1);
    expect(span.end).toBe(1);
    expect(span.deltas).toHaveLength(1);
    expect(span.deltas[0]).toMatchObject({ fromPc: 7, toPc: 8, fromName: 'G' });
    expect(span.scale?.root).toBe('A');
    expect(span.scale?.type.id).toBe('harmonic-minor');
  });

  it('hears a borrowed iv as one lowered note: Fm means A→A♭', () => {
    const p = plan(['C', 'Fm', 'C', 'G'], 'C', 'major');
    expect(p.exceptions).toHaveLength(1);

    const span = p.exceptions[0];
    expect(span.start).toBe(1);
    expect(span.end).toBe(1);
    expect(span.deltas).toEqual([
      { fromPc: 9, toPc: 8, fromName: 'A', toName: 'Ab' },
    ]);
  });

  it('merges compatible neighbours into one span: Fm–B♭7 is a single flat zone', () => {
    const p = plan(['C', 'Fm', 'Bb7', 'C'], 'C', 'major');
    expect(p.exceptions).toHaveLength(1);

    const span = p.exceptions[0];
    expect(span.start).toBe(1);
    expect(span.end).toBe(2);
    expect(span.deltas.map((d) => [d.fromPc, d.toPc])).toEqual([
      [9, 8],
      [11, 10],
    ]);
    expect(span.scale?.root).toBe('F');
    expect(span.scale?.type.id).toBe('melodic-minor');
  });

  it('splits contradictory neighbours: C7 needs E, F7 removes it', () => {
    const p = plan(['C7', 'F7', 'G7', 'C7'], 'C', 'major');
    const spans = p.exceptions.map((s) => [s.start, s.end]);
    expect(spans).toContainEqual([0, 0]);
    expect(spans).toContainEqual([1, 1]);
  });

  it('does not span across a covered chord', () => {
    const p = plan(['C', 'Fm', 'C', 'Bb7'], 'C', 'major');
    expect(p.exceptions).toHaveLength(2);
    expect(p.exceptions[0].start).toBe(1);
    expect(p.exceptions[1].start).toBe(3);
  });

  it('raises the minor leading tone: E7 in A minor means G→G♯, A harmonic minor', () => {
    const p = plan(['Am', 'Dm', 'E7', 'Am'], 'A', 'minor');
    expect(p.exceptions).toHaveLength(1);

    const span = p.exceptions[0];
    expect(span.deltas[0]).toMatchObject({ fromPc: 7, toPc: 8 });
    expect(span.scale?.root).toBe('A');
    expect(span.scale?.type.id).toBe('harmonic-minor');
  });

  it('gives an unnamed delta when no dictionary scale matches, and still spells it', () => {
    const p = plan(['C', 'Fm', 'C', 'G'], 'C', 'major');
    const span = p.exceptions[0];
    // C D E F G A♭ B is harmonic major — real, but outside the catalogue.
    expect(span.scale).toBeNull();
    expect(span.tones.map((t) => t.name)).toEqual(['C', 'D', 'E', 'F', 'G', 'Ab', 'B']);
  });

  it('names the I7 colour C Mixolydian, tonic-framed', () => {
    const p = plan(['C7', 'F7', 'G7', 'C7'], 'C', 'major');
    const first = p.exceptions.find((s) => s.start === 0);
    expect(first?.deltas).toEqual([
      { fromPc: 11, toPc: 10, fromName: 'B', toName: 'Bb' },
    ]);
    expect(first?.scale?.root).toBe('C');
    expect(first?.scale?.type.id).toBe('mixolydian');
  });
});

describe('the blues idiom', () => {
  it('switches to the tonic minor pentatonic and offers the blues scale', () => {
    const p = plan(['C7', 'F7', 'G7', 'C7'], 'C', 'major');
    expect(p.blues?.root).toBe('C');
    expect(p.blues?.type.id).toBe('blues');
    expect(p.pentatonic.scale.root).toBe('C');
    expect(p.pentatonic.scale.type.id).toBe('minor-pentatonic');
    expect(p.pentatonic.alias).toBeNull();
    // The ♭7 rubs are the sound, not clashes: the pentatonic survives the idiom.
    expect(p.pentatonic.survives).toBe(true);
  });

  it('does not fire outside the idiom', () => {
    const p = plan(['C', 'Am', 'F', 'G'], 'C', 'major');
    expect(p.blues).toBeNull();
  });
});

describe('input handling', () => {
  it('returns null for an empty progression', () => {
    expect(scalePlanFor([], keyOf('C', 'major', 0))).toBeNull();
  });

  it('follows the reading the key assignment chose', () => {
    // The same voicing offered as Am7 and C6: against C major both are covered
    // either way, but the assignment index must be respected, not the primary.
    nextId += 1;
    const ambiguous: ProgressionChord = {
      id: `fixture-${nextId}`,
      voicing: [],
      readings: [featureOf('Am7'), featureOf('C')],
      pinned: null,
    };
    const chords = [chord('C'), ambiguous];
    const key = keyOf('C', 'major', 2);
    key.assignment = [0, 1];
    const p = scalePlanFor(chords, key);
    expect(p?.covered).toEqual([true, true]);
  });
});
