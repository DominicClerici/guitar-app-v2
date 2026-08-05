import { describe, expect, it } from 'vitest';

import { estimateKey } from './estimate';
import { romanLabelsFor } from './roman';
import type {
  ChordFeature,
  KeyCandidate,
  ProgressionChord,
  SeventhQuality,
  TriadQuality,
} from './types';

// ---------------------------------------------------------------------------
// Chord-symbol fixtures. These build a ChordFeature by hand rather than going
// through extractFeature + the fretboard, so a case reads as the progression a
// player would type rather than as six fret positions.
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
  aug: { triad: 'aug', seventh: 'none', intervals: [0, 4, 8] },
  '7': { triad: 'maj', seventh: 'min7', intervals: [0, 4, 7, 10] },
  maj7: { triad: 'maj', seventh: 'maj7', intervals: [0, 4, 7, 11] },
  m7: { triad: 'min', seventh: 'min7', intervals: [0, 3, 7, 10] },
  m7b5: { triad: 'dim', seventh: 'min7', intervals: [0, 3, 6, 10] },
  dim7: { triad: 'dim', seventh: 'dim7', intervals: [0, 3, 6, 9] },
  mMaj7: { triad: 'min', seventh: 'maj7', intervals: [0, 3, 7, 11] },
  sus4: { triad: 'sus', seventh: 'none', intervals: [0, 5, 7] },
  sus2: { triad: 'sus', seventh: 'none', intervals: [0, 2, 7] },
  '5': { triad: 'power', seventh: 'none', intervals: [0, 7] },
};

let nextId = 0;

/** One chord symbol ("Cmaj7", "F#m7b5", "A5") as the engine's input feature. */
function chord(symbol: string, transpose = 0): ProgressionChord {
  const parsed = /^([A-G][#b]?)(.*)$/.exec(symbol);
  if (!parsed) throw new Error(`unparseable chord symbol: ${symbol}`);
  const spec = QUALITIES[parsed[2]];
  if (!spec) throw new Error(`unsupported quality "${parsed[2]}" in ${symbol}`);

  const rootPc = (PITCH_CLASS[parsed[1]] + transpose + 12) % 12;
  const feature: ChordFeature = {
    rootPc,
    bassPc: null,
    triad: spec.triad,
    seventh: spec.seventh,
    pitchClasses: spec.intervals.map((i) => (rootPc + i) % 12),
  };
  nextId += 1;
  return { id: `fixture-${nextId}`, name: symbol, voicing: [], feature };
}

/** A whole progression from a space-separated string of chord symbols. */
function progression(symbols: string, transpose = 0): ProgressionChord[] {
  return symbols.split(/\s+/).map((s) => chord(s, transpose));
}

function bestKey(symbols: string): string {
  return estimateKey(progression(symbols), 'flat').best!.name;
}

function candidateFor(symbols: string, keyName: string): KeyCandidate {
  const found = estimateKey(progression(symbols), 'flat').candidates.find(
    (c) => c.name === keyName,
  );
  if (!found) throw new Error(`${keyName} is not a top-4 candidate for "${symbols}"`);
  return found;
}

function keyOf(tonicPc: number, mode: 'major' | 'minor'): KeyCandidate {
  return { tonicPc, mode, name: `${tonicPc} ${mode}`, score: 0, confidence: 0 };
}

const A_MINOR = keyOf(9, 'minor');

// ---------------------------------------------------------------------------

interface Case {
  chords: string;
  /** Several entries where the progression is genuinely ambiguous. */
  expect: string | string[];
}

const CORPUS: Case[] = [
  // Textbook major
  { chords: 'C F G C', expect: 'C major' },
  { chords: 'C Am F G', expect: 'C major' },
  { chords: 'C G Am F', expect: 'C major' },
  { chords: 'G D Em C', expect: 'G major' },
  { chords: 'D A Bm G', expect: 'D major' },
  { chords: 'F Bb C F', expect: 'F major' },
  { chords: 'E A B E', expect: 'E major' },
  { chords: 'A D E A', expect: 'A major' },
  { chords: 'Bb Eb F Bb', expect: 'B♭ major' },
  { chords: 'Eb Ab Bb Eb', expect: 'E♭ major' },
  { chords: 'C Em F G C', expect: 'C major' },
  { chords: 'G C D G', expect: 'G major' },

  // Jazz ii-V-I
  { chords: 'Dm7 G7 Cmaj7', expect: 'C major' },
  { chords: 'Cmaj7 Am7 Dm7 G7', expect: 'C major' },
  { chords: 'Gm7 C7 Fmaj7', expect: 'F major' },
  { chords: 'Am7 D7 Gmaj7', expect: 'G major' },
  { chords: 'Fmaj7 Bm7b5 E7 Am7', expect: 'A minor' },
  { chords: 'Bm7b5 E7 Am', expect: 'A minor' },

  // Textbook minor
  { chords: 'Am Dm E7 Am', expect: 'A minor' },
  { chords: 'Em Am B7 Em', expect: 'E minor' },
  { chords: 'Dm Gm A7 Dm', expect: 'D minor' },
  { chords: 'Cm Fm G7 Cm', expect: 'C minor' },
  { chords: 'Am G F E7', expect: 'A minor' },
  { chords: 'Am Em Dm Am', expect: 'A minor' },
  { chords: 'Em D C B7', expect: 'E minor' },
  { chords: 'Am Am Dm Dm E7 E7 Am Am', expect: 'A minor' },

  // Relative-key discrimination — same seven notes, different tonic
  { chords: 'C F G Am F G C', expect: 'C major' },
  { chords: 'Am Dm Em Am', expect: 'A minor' },
  { chords: 'G Em C D G', expect: 'G major' },
  { chords: 'Em C Am Bm Em', expect: 'E minor' },
  { chords: 'C Dm Em F G Am C', expect: 'C major' },
  { chords: 'Am Dm Em F G C Am', expect: 'A minor' },

  // Modal colour and modal mixture
  { chords: 'C Bb F C', expect: 'C major' },
  { chords: 'C C7 F Fm C', expect: 'C major' },
  { chords: 'C Ab Bb C', expect: 'C major' },
  { chords: 'D C G D', expect: 'D major' },
  { chords: 'C F Fm C', expect: 'C major' },
  { chords: 'Am F G Am', expect: 'A minor' },
  { chords: 'Am F C G', expect: ['A minor', 'C major'] },

  // Blues
  { chords: 'C7 F7 C7 C7 F7 F7 C7 C7 G7 F7 C7 G7', expect: 'C major' },
  { chords: 'A7 D7 A7 E7 D7 A7', expect: 'A major' },
  { chords: 'E7 A7 E7 B7 A7 E7', expect: 'E major' },
  { chords: 'C7 F7 C7 G7 F7 C7', expect: 'C major' },
  { chords: 'Am7 Dm7 Am7 E7 Dm7 Am7', expect: 'A minor' },

  // Secondary dominants and chromatic harmony
  { chords: 'C E7 Am D7 G7 C', expect: 'C major' },
  { chords: 'G B7 Em A7 D7 G', expect: 'G major' },
  { chords: 'C A7 Dm G7 C', expect: 'C major' },
  { chords: 'Cmaj7 A7 Dm7 G7 Cmaj7 A7 Dm7 G7', expect: 'C major' },
  { chords: 'Am Dm Bb E7 Am', expect: 'A minor' },
  { chords: 'C F Db G7 C', expect: 'C major' },
  { chords: 'C C#dim7 Dm G7 C', expect: 'C major' },
  { chords: 'G Gdim7 D7 G', expect: 'G major' },
  { chords: 'Cmaj7 Fm7 Bb7 Cmaj7', expect: 'C major' },
  { chords: 'C D7 G7 C', expect: 'C major' },
  { chords: 'Dm7 Db7 Cmaj7', expect: 'C major' },

  // Guitar idioms
  { chords: 'Dsus4 D G A D', expect: 'D major' },
  { chords: 'G D Em7 Cmaj7', expect: 'G major' },
  { chords: 'Csus2 G Am F', expect: 'C major' },
  { chords: 'A5 D5 E5 A5', expect: ['A major', 'A minor'] },
  { chords: 'E5 G5 A5 E5', expect: ['E minor', 'E major'] },

  // Short inputs
  { chords: 'G7 C', expect: 'C major' },
  { chords: 'G C', expect: 'C major' },
  { chords: 'Em Am', expect: 'A minor' },
];

describe('estimateKey', () => {
  it.each(CORPUS)('hears $chords in $expect', ({ chords, expect: want }) => {
    const acceptable = Array.isArray(want) ? want : [want];
    expect(acceptable).toContain(bestKey(chords));
  });

  it('needs at least two chords', () => {
    expect(estimateKey([], 'flat').status).toBe('insufficient');
    expect(estimateKey(progression('C'), 'flat').status).toBe('insufficient');
    expect(estimateKey(progression('C'), 'flat').best).toBeNull();
  });

  it('scores identically under transposition', () => {
    const seeds = ['C F G C', 'Dm7 G7 Cmaj7', 'Am G F E7', 'C7 F7 C7 G7', 'C Bb F C'];
    for (const seed of seeds) {
      const base = estimateKey(progression(seed), 'flat').best!;
      for (let semitones = 1; semitones < 12; semitones += 1) {
        const moved = estimateKey(progression(seed, semitones), 'flat').best!;
        expect(moved.tonicPc, `${seed} +${semitones}`).toBe((base.tonicPc + semitones) % 12);
        expect(moved.mode, `${seed} +${semitones}`).toBe(base.mode);
        expect(moved.score, `${seed} +${semitones}`).toBeCloseTo(base.score, 10);
      }
    }
  });

  it('reports ambiguity rather than a confident guess on atonal input', () => {
    expect(estimateKey(progression('C D E F# G# Bb'), 'flat').status).toBe('ambiguous');
    expect(estimateKey(progression('C F#'), 'flat').status).toBe('ambiguous');
  });
});

// ---------------------------------------------------------------------------
// Minor has two chords on scale degree 7 — the natural-minor subtonic a whole
// step below the tonic and the harmonic-minor leading tone a half step below.
// They take different qualities, so a table indexed by degree cannot tell them
// apart and lets a major triad on the leading tone pass as the subtonic's VII.
// ---------------------------------------------------------------------------

describe('degree 7 in a minor key', () => {
  it('hears a major triad on the subtonic as a diatonic VII', () => {
    const labels = romanLabelsFor(progression('Am Dm G Am'), A_MINOR);
    expect(labels[2].roman).toBe('VII');
    expect(labels[2].isDiatonic).toBe(true);
  });

  it('hears a diminished seventh on the leading tone as a diatonic vii°7', () => {
    const labels = romanLabelsFor(progression('Am Dm G#dim7 Am'), A_MINOR);
    expect(labels[2].roman).toBe('vii°7');
    expect(labels[2].isDiatonic).toBe(true);
  });

  it('spells a major triad on the leading tone as a chromatic ♯VII', () => {
    const labels = romanLabelsFor(progression('Am Dm G# Am'), A_MINOR);
    expect(labels[2].roman).toBe('♯VII');
    expect(labels[2].isDiatonic).toBe(false);
  });

  it('scores ♯VII as a chromatic root rather than a free one', () => {
    const subtonic = candidateFor('Am Dm G Am', 'A minor').score;
    const leadingTone = candidateFor('Am Dm G# Am', 'A minor').score;
    const sharpSix = candidateFor('Am Dm F# Am', 'A minor').score;

    // Swapping the diatonic VII for ♯VII used to cost A minor 0.008, against
    // 0.353 for the comparably foreign ♯VI. The two need not cost the same —
    // ♯VII keeps two of its three notes inside A harmonic minor where ♯VI keeps
    // one, so the out-of-key penalty rightly separates them — but ♯VII must not
    // go on collecting a diatonic chord's reward.
    expect(subtonic - leadingTone).toBeGreaterThan((subtonic - sharpSix) / 2);
  });
});

// ---------------------------------------------------------------------------
// The blues allowance lets a dom7 stand on I and IV without reading as a V7 of
// somewhere else. What marks the idiom is *where* the dom7s sit, not how many
// there are: a descending-fifths chain is dom7-saturated too, and it is exactly
// the case where every dom7 really does point at the next chord.
// ---------------------------------------------------------------------------

describe('the blues dominant-seventh allowance', () => {
  it('does not apply to a descending-fifths chain of secondary dominants', () => {
    expect(bestKey('E7 A7 D7 G7 C')).toBe('C major');
  });

  it('still applies to a twelve-bar blues', () => {
    expect(bestKey('C7 F7 C7 C7 F7 F7 C7 C7 G7 F7 C7 G7')).toBe('C major');
  });

  it('still applies to a quick-change blues', () => {
    expect(bestKey('A7 D7 A7 E7 D7 A7')).toBe('A major');
  });
});

// ---------------------------------------------------------------------------
// Sus and power chords have no third. That makes them mode-neutral, not
// key-neutral: they still name a tonic, and on a diatonic root they contradict
// nothing. Treating them as unrecognised threw away both signals.
// ---------------------------------------------------------------------------

describe('chords with no third', () => {
  it('lets a sus chord anchor the tonic', () => {
    expect(bestKey('Csus4 C Gsus4 G')).toBe('C major');
  });

  it('lets a power chord anchor the tonic', () => {
    expect(estimateKey(progression('E5 A5 B5 E5'), 'flat').best!.tonicPc).toBe(4);
  });

  it('leaves the mode to the rest of the progression', () => {
    expect(bestKey('E5 A5 B5 E5 G B5 E5')).toBe('E minor');
    expect(bestKey('E5 A5 B5 E5 G# B5 E5')).toBe('E major');
  });

  it('does not treat a diatonic sus as evidence against its key', () => {
    const plain = candidateFor('D G A D', 'D major').score;
    const sus = candidateFor('Dsus4 G A Dsus4', 'D major').score;
    // Some gap is honest — a sus4 really does swap the third for a fourth, so
    // the pitch-class correlation moves. What it must not do is cost the tonic
    // its position bonus and its chord fit on top: that gap was 0.66.
    expect(plain - sus).toBeLessThan(0.15);
  });
});
