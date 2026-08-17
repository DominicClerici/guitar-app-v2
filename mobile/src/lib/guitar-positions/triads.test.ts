import { describe, expect, it } from 'vitest';

import { noteToPitchClass } from '@/lib/scale-library';
import { FRET_COUNT, midiAt } from '@/lib/theory';

import {
  STRING_SET_INDICES,
  STRING_SETS,
  TRIAD_INVERSIONS,
  TRIAD_QUALITIES,
  triadLadder,
  triadLadderLanes,
  triadVoicing,
  triadVoicings,
  type StringSet,
  type TriadInversion,
  type TriadQuality,
} from './triads';

const pc = (note: string) => noteToPitchClass(note);

/** Frets low string first — the shorthand every lesson in the triads pathway writes. */
const grip = (
  root: string,
  quality: TriadQuality,
  set: StringSet,
  inversion: TriadInversion,
  minFret = 0,
) => {
  const voicing = triadVoicing(pc(root), quality, set, inversion, minFret);
  return voicing?.notes.map((note) => note.fret).join(' ');
};

/** Frets relative to the bass — the grip with its position on the neck divided out. */
const shape = (set: StringSet, inversion: TriadInversion, quality: TriadQuality = 'major') => {
  const voicing = triadVoicing(pc('C'), quality, set, inversion);
  return voicing?.notes.map((note) => note.fret - voicing.notes[0].fret).join(' ');
};

const mustVoice = (
  root: string,
  quality: TriadQuality,
  set: StringSet,
  inversion: TriadInversion,
) => {
  const voicing = triadVoicing(pc(root), quality, set, inversion);
  if (!voicing) throw new Error(`no ${root} ${quality} on ${set}, ${inversion} inversion`);
  return voicing;
};

describe('triadVoicing', () => {
  // The twelve shapes chapter 1 and 2 are built on, computed by hand first and
  // pinned here. A transposed row in this table would be a pathway-wide error.
  it('places C major everywhere the pathway claims it sits', () => {
    expect(grip('C', 'major', '3-4-5', 'root')).toBe('3 2 0');
    expect(grip('C', 'major', '3-4-5', 'first')).toBe('7 5 5');
    expect(grip('C', 'major', '3-4-5', 'second')).toBe('10 10 9');

    expect(grip('C', 'major', '4-5-6', 'root')).toBe('8 7 5');
    expect(grip('C', 'major', '4-5-6', 'first')).toBe('12 10 10');
    expect(grip('C', 'major', '4-5-6', 'second')).toBe('3 3 2');

    expect(grip('C', 'major', '2-3-4', 'root')).toBe('10 9 8');
    expect(grip('C', 'major', '2-3-4', 'first')).toBe('2 0 1');
    expect(grip('C', 'major', '2-3-4', 'second')).toBe('5 5 5');

    expect(grip('C', 'major', '1-2-3', 'root')).toBe('5 5 3');
    expect(grip('C', 'major', '1-2-3', 'first')).toBe('9 8 8');
    expect(grip('C', 'major', '1-2-3', 'second')).toBe('0 1 0');
  });

  /**
   * The open C chord is two of those grips stacked, which is the lesson that
   * makes the whole system feel already-known: x 3 2 0 1 0 is the 3-4-5 root
   * position under the 2-3-4 first inversion.
   */
  it('finds both halves of the open C chord', () => {
    expect(grip('C', 'major', '3-4-5', 'root')).toBe('3 2 0');
    expect(grip('C', 'major', '2-3-4', 'first')).toBe('2 0 1');
  });

  /**
   * The B string, emerging rather than tabulated. The two all-fourths sets share
   * one geometry; crossing the G→B major third lifts every note above the break
   * by a fret, so 2-3-4 differs by one and 1-2-3 by two.
   */
  it('gives the all-fourths sets identical geometry and shifts the rest', () => {
    for (const inversion of TRIAD_INVERSIONS) {
      expect(shape('4-5-6', inversion)).toBe(shape('3-4-5', inversion));
    }

    expect(shape('3-4-5', 'root')).toBe('0 -1 -3');
    expect(shape('2-3-4', 'root')).toBe('0 -1 -2'); // top note is the B string: +1
    expect(shape('1-2-3', 'root')).toBe('0 0 -2'); // top two are above the break: +1 each
  });

  /**
   * E-G-C on strings 6-5-4 cannot be held at the nut: the G above open low E is
   * G2, below the open A string, so the close voicing waits for the octave.
   */
  it('pushes a first inversion up the neck when the close voicing will not fit low', () => {
    expect(grip('C', 'major', '4-5-6', 'first')).toBe('12 10 10');
    expect(triadVoicing(pc('C'), 'major', '4-5-6', 'first')?.from).toBe(10);
  });

  it('takes the copy further up the neck when asked', () => {
    expect(grip('C', 'major', '1-2-3', 'second')).toBe('0 1 0');
    expect(grip('C', 'major', '1-2-3', 'second', 5)).toBe('12 13 12');
  });

  /**
   * Chapter 3's whole claim. Compared octave-for-octave, because the two are not
   * always found in the same one — C minor's second inversion on strings 1-2-3
   * would need a flat third at fret −1, so the grip relocates twelve frets up
   * rather than moving one finger. Divide the octave out and the move is there.
   */
  it('moves exactly one note by one fret from major to minor', () => {
    for (const set of STRING_SETS) {
      for (const inversion of TRIAD_INVERSIONS) {
        const major = mustVoice('C', 'major', set, inversion);
        const minor = mustVoice('C', 'minor', set, inversion);

        const octaves = Math.round((major.notes[0].fret - minor.notes[0].fret) / 12) * 12;
        const moved = major.notes
          .map((note, at) => note.fret - (minor.notes[at].fret + octaves))
          .filter((distance) => distance !== 0);

        expect(moved, `${set} ${inversion}`).toEqual([1]);
      }
    }
  });

  it('labels the degree that changes with each quality', () => {
    const degrees = (quality: TriadQuality) =>
      triadVoicing(pc('C'), quality, '1-2-3', 'root')
        ?.notes.map((note) => note.degree)
        .join(' ');

    expect(degrees('major')).toBe('1 3 5');
    expect(degrees('minor')).toBe('1 b3 5');
    expect(degrees('diminished')).toBe('1 b3 b5');
    expect(degrees('augmented')).toBe('1 3 #5');
  });

  /**
   * The augmented triad is 4 + 4, so rotating it produces the same interval
   * structure every time — the shape simply reappears four frets up. Chapter 4's
   * central claim, asserted rather than asserted-in-prose.
   */
  it('repeats the augmented shape every four frets', () => {
    const shapes = TRIAD_INVERSIONS.map((inversion) => shape('1-2-3', inversion, 'augmented'));
    expect(new Set(shapes).size).toBe(1);

    const bass = TRIAD_INVERSIONS.map(
      (inversion) => mustVoice('C', 'augmented', '1-2-3', inversion).notes[0].fret,
    ).sort((a, b) => a - b);
    expect(bass).toEqual([1, 5, 9]);
  });

  /** The diminished triad is 3 + 3 + 6, which is *not* symmetrical — the trap next door. */
  it('does not repeat the diminished shape, because only two of its gaps are equal', () => {
    const shapes = TRIAD_INVERSIONS.map((inversion) => shape('1-2-3', inversion, 'diminished'));
    expect(new Set(shapes).size).toBe(3);
  });

  it('voices every quality of every root on every set in every inversion', () => {
    for (const root of Array.from({ length: 12 }, (_, index) => index)) {
      for (const quality of TRIAD_QUALITIES) {
        for (const set of STRING_SETS) {
          for (const inversion of TRIAD_INVERSIONS) {
            const voicing = triadVoicing(root, quality, set, inversion);
            expect(voicing, `${root} ${quality} ${set} ${inversion}`).toBeDefined();
          }
        }
      }
    }
  });

  it('ascends, stays on the set, and stays on the neck', () => {
    for (const quality of TRIAD_QUALITIES) {
      for (const set of STRING_SETS) {
        for (const inversion of TRIAD_INVERSIONS) {
          for (const voicing of triadVoicings(pc('A'), quality, set, inversion)) {
            expect(voicing.notes.map((note) => note.string)).toEqual([...STRING_SET_INDICES[set]]);

            const pitches = voicing.notes.map((note) => midiAt(note.string, note.fret));
            expect(pitches[1]).toBeGreaterThan(pitches[0]);
            expect(pitches[2]).toBeGreaterThan(pitches[1]);

            expect(voicing.to).toBeLessThanOrEqual(FRET_COUNT);
            expect(voicing.to - voicing.from).toBeLessThanOrEqual(4);
          }
        }
      }
    }
  });
});

describe('triadLadder', () => {
  it('climbs the set in chord-tone order and wraps at the octave', () => {
    expect(
      triadLadder(pc('C'), 'major', '1-2-3').map(
        (voicing) => `${voicing.inversion} ${voicing.from}-${voicing.to}`,
      ),
    ).toEqual(['second 0-1', 'root 3-5', 'first 8-9', 'second 12-13']);
  });

  it('repeats a shape exactly twelve frets higher', () => {
    const ladder = triadLadder(pc('C'), 'major', '1-2-3');
    const first = ladder[0];
    const wrapped = ladder[ladder.length - 1];

    expect(wrapped.inversion).toBe(first.inversion);
    expect(wrapped.from - first.from).toBe(12);
  });

  it('never puts two overlapping voicings in one lane', () => {
    for (const quality of TRIAD_QUALITIES) {
      for (const set of STRING_SETS) {
        for (const lane of triadLadderLanes(triadLadder(pc('Eb'), quality, set))) {
          for (let at = 1; at < lane.length; at += 1) {
            expect(lane[at].from).toBeGreaterThan(lane[at - 1].to);
          }
        }
      }
    }
  });
});
