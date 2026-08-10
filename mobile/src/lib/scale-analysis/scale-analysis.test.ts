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
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
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

// ---------------------------------------------------------------------------
// The key fixes the tonic; it does not fix which mode of that tonic the
// progression actually lives in. A ♭VII vamp is Mixolydian, not major with a
// footnote — and the difference is the whole recommendation.
// ---------------------------------------------------------------------------

describe('choosing the global scale', () => {
  it('hears a ♭VII in a major key as Mixolydian, not an exception', () => {
    const p = plan(['G', 'F', 'C', 'G'], 'G', 'major');
    expect(p.global.root).toBe('G');
    expect(p.global.type.id).toBe('mixolydian');
    expect(p.global.notes).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F']);
    expect(p.covered).toEqual([true, true, true, true]);
    expect(p.exceptions).toEqual([]);
  });

  it('hears a major IV in a minor key as Dorian', () => {
    const p = plan(['Am', 'D', 'Am', 'D'], 'A', 'minor');
    expect(p.global.type.id).toBe('dorian');
    expect(p.exceptions).toEqual([]);
  });

  it('hears a ♭II in a minor key as Phrygian', () => {
    const p = plan(['Am', 'Bb', 'Am', 'Bb'], 'A', 'minor');
    expect(p.global.type.id).toBe('phrygian');
    expect(p.exceptions).toEqual([]);
  });

  it('hears a II major in a major key as Lydian', () => {
    const p = plan(['C', 'D', 'C', 'D'], 'C', 'major');
    expect(p.global.type.id).toBe('lydian');
    expect(p.exceptions).toEqual([]);
  });

  it('keeps the key′s own scale when no mode covers more', () => {
    expect(plan(['C', 'Am', 'F', 'G'], 'C', 'major').global.type.id).toBe('major');
    expect(plan(['Am', 'Dm', 'Em', 'Am'], 'A', 'minor').global.type.id).toBe('minor');
  });

  // Harmonic minor covers Am–Dm–E7–Am outright, and is still the wrong headline:
  // the raised 7th belongs to the dominant, not to the tune. Only the modes of
  // the major scale can carry a whole progression; a leading tone is an event,
  // and events stay in the spans.
  it('leaves a raised leading tone as an exception rather than a global colour', () => {
    const p = plan(['Am', 'Dm', 'E7', 'Am'], 'A', 'minor');
    expect(p.global.type.id).toBe('minor');
    expect(p.exceptions).toHaveLength(1);
  });

  it('never picks a mode whose tonic triad contradicts the key', () => {
    const major = ['major', 'mixolydian', 'lydian'];
    const minor = ['minor', 'dorian', 'phrygian'];
    for (const symbols of [
      ['C', 'D', 'C', 'D'],
      ['C', 'Bb', 'F', 'C'],
      ['C', 'Fm', 'C', 'G'],
      ['C7', 'F7', 'G7', 'C7'],
    ]) {
      expect(major, symbols.join(' ')).toContain(plan(symbols, 'C', 'major').global.type.id);
    }
    for (const symbols of [
      ['Am', 'D', 'Am', 'D'],
      ['Am', 'Bb', 'Am', 'Bb'],
      ['Am', 'Dm', 'E7', 'Am'],
    ]) {
      expect(minor, symbols.join(' ')).toContain(plan(symbols, 'A', 'minor').global.type.id);
    }
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
  // A span is advice about the chords inside it — the line the player reads is
  // "over E7, do this" — so it is named from a chord root inside the span when
  // the dictionary has such a name, and only otherwise from the key's frame.
  // The same seven notes are A harmonic minor; E Phrygian dominant is the one
  // you can act on without transposing the thought first.
  it('hears a secondary dominant as one raised note: V/vi means G→G♯', () => {
    const p = plan(['C', 'E7', 'Am', 'F'], 'C', 'major');
    expect(p.exceptions).toHaveLength(1);

    const span = p.exceptions[0];
    expect(span.start).toBe(1);
    expect(span.end).toBe(1);
    expect(span.deltas).toHaveLength(1);
    expect(span.deltas[0]).toMatchObject({ fromPc: 7, toPc: 8, fromName: 'G' });
    expect(span.scale?.root).toBe('E');
    expect(span.scale?.type.id).toBe('phrygian-dominant');
  });

  it('names a span from the chord it bends around, not from the tonic', () => {
    // The IV7 of a blues bends C Mixolydian by one note, and the result carries
    // a name on both degrees: F Mixolydian and C Dorian are the same seven
    // notes. Only the F name answers "what do I play over this F7?".
    const p = plan(['C7', 'F7', 'C7', 'C7'], 'C', 'major');
    const span = p.exceptions.find((s) => s.start === 1);
    expect(span?.deltas).toEqual([{ fromPc: 4, toPc: 3, fromName: 'E', toName: 'Eb' }]);
    expect(span?.scale?.root).toBe('F');
    expect(span?.scale?.type.id).toBe('mixolydian');
  });

  it('names a merged span from one of its own chord roots', () => {
    const p = plan(['C', 'Fm', 'Bb7', 'C'], 'C', 'major');
    expect(p.exceptions[0].scale?.root).toBe('F');
    expect(p.exceptions[0].scale?.type.id).toBe('melodic-minor');
  });

  // Several chord roots in a merged span can each name the set — the IV7–V7 of a
  // blues is F Lydian dominant and G Mixolydian ♭6 at once. The tie goes to the
  // name a player is likelier to already own.
  it('breaks a tie between chord roots on how well known the name is', () => {
    const p = plan(['C7', 'F7', 'G7', 'C7'], 'C', 'major');
    const span = p.exceptions.find((s) => s.start === 1);
    expect(span?.end).toBe(2);
    expect(span?.scale?.root).toBe('F');
    expect(span?.scale?.type.id).toBe('lydian-dominant');
  });

  it('leaves a span the catalogue has no name for unnamed, and still spells it', () => {
    const p = plan(['G', 'Gdim7', 'D7', 'G'], 'G', 'major');
    const span = p.exceptions[0];
    expect(span.deltas.map((d) => `${d.fromName}→${d.toName}`)).toEqual(['B→Bb', 'D→Db']);
    expect(span.scale).toBeNull();
    expect(span.tones.map((t) => t.name)).toEqual(['G', 'A', 'Bb', 'C', 'Db', 'E', 'F#']);
  });

  it('hears a borrowed iv as one lowered note: Fm means A→A♭', () => {
    const p = plan(['C', 'Fm', 'C', 'G'], 'C', 'major');
    expect(p.exceptions).toHaveLength(1);

    const span = p.exceptions[0];
    expect(span.start).toBe(1);
    expect(span.end).toBe(1);
    expect(span.deltas).toEqual([{ fromPc: 9, toPc: 8, fromName: 'A', toName: 'Ab' }]);
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

  it('splits contradictory neighbours: E7 raises G, Fm lowers A onto the same tone', () => {
    const p = plan(['C', 'E7', 'Fm', 'C'], 'C', 'major');
    const spans = p.exceptions.map((s) => [s.start, s.end]);
    expect(spans).toEqual([
      [1, 1],
      [2, 2],
    ]);
    expect(p.exceptions[0].deltas).toEqual([{ fromPc: 7, toPc: 8, fromName: 'G', toName: 'G#' }]);
    expect(p.exceptions[1].deltas).toEqual([{ fromPc: 9, toPc: 8, fromName: 'A', toName: 'Ab' }]);
  });

  it('does not span across a covered chord', () => {
    const p = plan(['C', 'Fm', 'C', 'Bb7'], 'C', 'major');
    expect(p.exceptions).toHaveLength(2);
    expect(p.exceptions[0].start).toBe(1);
    expect(p.exceptions[1].start).toBe(3);
  });

  it('raises the minor leading tone: E7 in A minor means G→G♯', () => {
    const p = plan(['Am', 'Dm', 'E7', 'Am'], 'A', 'minor');
    expect(p.exceptions).toHaveLength(1);

    const span = p.exceptions[0];
    expect(span.deltas[0]).toMatchObject({ fromPc: 7, toPc: 8 });
    expect(span.scale?.root).toBe('E');
    expect(span.scale?.type.id).toBe('phrygian-dominant');
    // The A harmonic minor spelling of the same seven notes, tonic-framed.
    expect(span.tones.map((t) => t.name)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G#']);
  });

  it('names a borrowed iv in a major key as harmonic major', () => {
    const p = plan(['C', 'Fm', 'C', 'G'], 'C', 'major');
    const span = p.exceptions[0];
    // C D E F G A♭ B. No chord root in the span names it, so the key's own
    // frame takes over — which is the right one for a borrowed chord.
    expect(span.scale?.root).toBe('C');
    expect(span.scale?.type.id).toBe('harmonic-major');
    expect(span.tones.map((t) => t.name)).toEqual(['C', 'D', 'E', 'F', 'G', 'Ab', 'B']);
  });

  it('names the scale over a secondary dominant from that dominant', () => {
    const p = plan(['C', 'A7', 'Dm', 'G7', 'C'], 'C', 'major');
    const span = p.exceptions[0];
    expect(span.start).toBe(1);
    expect(span.deltas).toEqual([{ fromPc: 0, toPc: 1, fromName: 'C', toName: 'C#' }]);
    expect(span.scale?.root).toBe('A');
    expect(span.scale?.type.id).toBe('mixolydian-b6');
  });

  // The ♭7 a I7 carries is the tune's colour, not a swerve away from it, so it
  // belongs to the global scale rather than to a span the player is warned about.
  it('carries the I7 colour in the global scale instead of an exception', () => {
    const p = plan(['C7', 'F7', 'G7', 'C7'], 'C', 'major');
    expect(p.global.type.id).toBe('mixolydian');
    expect(p.covered[0]).toBe(true);
    expect(p.exceptions.some((span) => span.start === 0)).toBe(false);
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

  // A dom7 on V is a cadence, not a blues, and half the chords of a short
  // progression being one is not evidence of an idiom. Firing here handed a
  // plain V–I the tonic *minor* pentatonic over a major key.
  it('does not fire on a perfect cadence', () => {
    const p = plan(['G7', 'C'], 'C', 'major');
    expect(p.blues).toBeNull();
    expect(p.pentatonic.scale.root).toBe('A');
  });

  it('does not fire on a ii–V vamp', () => {
    const p = plan(['Am7', 'D7', 'Am7', 'D7'], 'G', 'major');
    expect(p.blues).toBeNull();
    expect(p.pentatonic.scale.root).toBe('E');
  });

  // "The key scale covers this chord" is only a reason to skip the clash test
  // while the pentatonic sits inside the key scale. The blues pentatonic does
  // not — it brings its own ♭3 and ♭7 — so a chord the major scale covers can
  // still grind against it, and the skip was reporting those as clean.
  it('still tests chords the key scale covers against the blues pentatonic', () => {
    const p = plan(['C7', 'F7', 'G7', 'Am'], 'C', 'major');
    expect(p.blues).not.toBeNull();
    expect(p.covered[3]).toBe(true);
    expect(p.pentatonic.clashes).toEqual([3]);
    expect(p.pentatonic.survives).toBe(false);
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
