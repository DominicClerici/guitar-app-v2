import { describe, expect, it } from 'vitest';

import { buildChord } from '../chord-library/build';
import { CHORD_TYPES } from '../chord-library/catalog';
import { ROOTS } from '../chord-library/roots';
import { noteToSemitone, OPEN_PITCHES_MIDI } from '../theory';
import { STANDARD } from '../tuning';

import { analyzeChord } from './index';
import type { FretboardNote } from './types';

/**
 * Lay a bass-first list of pitch classes across the neck, one note per string
 * from the low E up, keeping the pitches strictly ascending. The engine reads
 * the lowest sounding pitch as the bass, so the order here is what decides
 * whether a reading renders as a slash chord. Returns null when the set needs
 * more strings than the guitar has.
 */
function place(pitchClasses: number[]): FretboardNote[] | null {
  const notes: FretboardNote[] = [];
  let previous = -1;
  let string = OPEN_PITCHES_MIDI.length - 1;

  for (const pitchClass of pitchClasses) {
    let placed = false;
    while (string >= 0 && !placed) {
      for (let fret = 0; fret <= 18; fret += 1) {
        const midi = OPEN_PITCHES_MIDI[string] + fret;
        if (midi % 12 === pitchClass && midi > previous) {
          notes.push({ string, fret });
          previous = midi;
          placed = true;
          break;
        }
      }
      string -= 1;
    }
    if (!placed) return null;
  }
  return notes;
}

function namesOf(notes: string[]): string[] {
  const dots = place(notes.map(noteToSemitone));
  if (!dots) throw new Error(`too many notes to place: ${notes.join(' ')}`);
  return analyzeChord(STANDARD, dots)?.chordNames.map((chord) => chord.name) ?? [];
}

function nameOf(notes: string[]): string {
  return namesOf(notes)[0] ?? 'null';
}

describe('analyzeChord', () => {
  it('needs three notes', () => {
    expect(
      analyzeChord(STANDARD, [
        { string: 5, fret: 3 },
        { string: 4, fret: 2 },
      ]),
    ).toBeNull();
  });

  it.each([
    [['C', 'E', 'G'], 'C'],
    [['C', 'Eb', 'G'], 'Cm'],
    [['C', 'Eb', 'Gb'], 'Cdim'],
    [['C', 'E', 'Ab'], 'Caug'],
    [['C', 'E', 'G', 'Bb'], 'C7'],
    [['C', 'E', 'G', 'B'], 'Cmaj7'],
    [['C', 'Eb', 'G', 'Bb'], 'Cm7'],
    [['C', 'Eb', 'G', 'B'], 'Cm(maj7)'],
    [['C', 'Eb', 'Gb', 'A'], 'Cdim7'],
    [['C', 'E', 'G', 'A'], 'C6'],
    [['C', 'E', 'G', 'Bb', 'D'], 'C9'],
    [['C', 'E', 'G', 'Bb', 'D', 'A'], 'C13'],
    [['C', 'E', 'G', 'D'], 'C(add9)'],
    [['C', 'E', 'G', 'F'], 'C(add11)'],
  ])('names %s as %s', (notes, expected) => {
    expect(nameOf(notes)).toBe(expected);
  });

  it('renders a non-bass root as a slash chord', () => {
    expect(nameOf(['E', 'G', 'C'])).toBe('C/E');
    expect(nameOf(['G', 'C', 'E'])).toBe('C/G');
    expect(nameOf(['E', 'G', 'Bb', 'C'])).toBe('C7/E');
  });

  it('reads the six open strings as Em11', () => {
    expect(nameOf(['E', 'A', 'D', 'G', 'B', 'E'])).toBe('Em11');
  });

  // Ranking regressions. Each of these lost to a slash reading built on one of
  // its own upper notes until the scoring in ranking.ts was corrected: the b5
  // was being charged as a tension, and the bass-root preference only broke
  // exact ties.
  it('keeps a half-diminished chord rooted where it is spelled', () => {
    expect(nameOf(['C', 'Eb', 'Gb', 'Bb'])).toBe('Cm7(b5)'); // not Ebm6/C
    expect(nameOf(['B', 'D', 'F', 'A'])).toBe('Bm7(b5)'); // not Dm6/B
  });

  it('keeps a suspended dominant rooted on its bass', () => {
    expect(nameOf(['C', 'F', 'G', 'Bb'])).toBe('C7sus'); // not Gm11/C
  });

  // An altered 5th used to be labelled as the tension a fifth above it, which
  // made the name ambiguous as well as wrong: C E Gb Bb and C E G Bb Gb both
  // printed C7(#11).
  it('spells an altered 5th as a 5th when no perfect 5th is voiced', () => {
    expect(nameOf(['C', 'E', 'Gb', 'Bb'])).toBe('C7(b5)');
    expect(nameOf(['C', 'E', 'Ab', 'Bb'])).toBe('C7(#5)');
    expect(nameOf(['C', 'E', 'Gb', 'B'])).toBe('Cmaj7(b5)');
    expect(nameOf(['C', 'E', 'Ab', 'B'])).toBe('Cmaj7(#5)');
    expect(nameOf(['C', 'E', 'Gb', 'Bb', 'D'])).toBe('C9(b5)');
    expect(nameOf(['C', 'Eb', 'Gb', 'B'])).toBe('Cm(maj7,b5)');
    expect(nameOf(['C', 'E', 'Gb'])).toBe('C(b5)');
  });

  it('keeps #11 / b13 where a perfect 5th is there to reach past', () => {
    expect(nameOf(['C', 'E', 'G', 'Bb', 'Gb'])).toBe('C7(#11)');
    expect(nameOf(['C', 'E', 'G', 'Bb', 'Ab'])).toBe('C7(b13)');
    expect(nameOf(['C', 'E', 'G', 'B', 'Gb'])).toBe('Cmaj7(#11)');
    // A diminished triad carries its own b5, so this rule leaves it alone.
    expect(nameOf(['C', 'Eb', 'Gb', 'Bb'])).toBe('Cm7(b5)');
    expect(nameOf(['C', 'Eb', 'Gb', 'A'])).toBe('Cdim7');
  });

  // The abbreviation pass used to splice all of 9/11/13 out of the tensions
  // while printing only the highest, so a voiced 11 vanished from the name.
  it('keeps a natural 11 that the extension number does not imply', () => {
    expect(nameOf(['C', 'E', 'G', 'Bb', 'D', 'A'])).toBe('C13');
    expect(nameOf(['C', 'E', 'G', 'Bb', 'F', 'A'])).toBe('C13(11)');
    expect(nameOf(['C', 'Eb', 'G', 'Bb', 'D', 'F'])).toBe('Cm11');
  });

  // susPostExt was matched against a token list after the abbreviation pass had
  // already rewritten "7" as "9"/"11"/"13", so C9sus4 printed as "Csus9" — which
  // also collides with the chord library's `sus9` alias for sus2.
  it('puts sus after an abbreviated extension number', () => {
    expect(nameOf(['C', 'F', 'G', 'Bb'])).toBe('C7sus');
    expect(nameOf(['C', 'F', 'G', 'B'])).toBe('Cmaj7sus');
    expect(namesOf(['C', 'F', 'G', 'Bb', 'D'])).toContain('C9sus');
    expect(namesOf(['C', 'F', 'G', 'Bb', 'D', 'A'])).toContain('C13sus');
    expect(namesOf(['C', 'F', 'G', 'A', 'D'])).toContain('C6/9sus');
    // With no extension the sus stays last, and b6 stays behind it so that
    // "Cb6sus" can never be misread as a Cb chord.
    expect(nameOf(['C', 'F', 'G'])).toBe('Csus');
    expect(nameOf(['C', 'D', 'G'])).toBe('Csus2');
    expect(namesOf(['C', 'Eb', 'G', 'Ab'])).toContain('Gsusb6(b9)/C');
  });

  // getChordInfo encodes "holds both sevenths" as the extension "7,maj7"; the
  // formatter used to print that pair verbatim.
  it('does not leak the "7,maj7" extension token', () => {
    expect(nameOf(['C', 'E', 'G', 'Bb', 'B'])).toBe('C7(maj7)');
    expect(nameOf(['C', 'E', 'G', 'Bb', 'B', 'D'])).toBe('C9(maj7)');
    expect(nameOf(['C', 'Eb', 'G', 'Bb', 'B'])).toBe('Cm7(maj7)');
  });
});

/**
 * Qualities the engine cannot currently name, pinned to what it does say so the
 * round-trip below can cover everything else. These are naming-convention gaps
 * in getChordInfo, not ranking ones:
 *
 *   dom11 — with no third the 11 is absorbed into `sus4`, so the C-rooted
 *     reading prints `C9sus` and loses to the m11 a fifth up.
 *
 * Fixing one of these should delete its entry, not update it.
 */
const KNOWN_GAPS: Record<string, RegExp> = {
  dom11: /^m11\/[A-G](##?|bb?)?$/,
};

describe('chord-library round-trip', () => {
  // Every catalogue quality on every root, played root-position bass-first,
  // has to come back naming the same quality. The root may come back spelled as
  // its enharmonic partner (Db7sus4 → C#7sus) — that is the documented
  // accidental tiebreak, so compare on the quality alone.
  const cases = ROOTS.flatMap((root) => CHORD_TYPES.map((type) => ({ root, type }))).filter(
    ({ root, type }) => {
      const chord = buildChord(root, type, { spelling: 'collapsed' });
      // Power chords are two notes, and m13 is seven — neither is nameable here.
      return chord.tones.length >= 3 && place(chord.tones.map((t) => t.pitchClass)) !== null;
    },
  );

  it.each(cases)('names $root $type.id', ({ root, type }) => {
    const chord = buildChord(root, type, { spelling: 'collapsed' });
    const name = nameOf(chord.tones.map((tone) => tone.note));
    const quality = name.replace(/^[A-G](##?|bb?)?/, '');
    // The engine abbreviates sus4 to sus and brackets tensions; the catalogue
    // symbols do neither.
    const normalise = (symbol: string) => symbol.replace(/[()]/g, '').replace(/sus4/g, 'sus');

    const gap = KNOWN_GAPS[type.id];
    if (gap) expect(normalise(quality)).toMatch(gap);
    else expect(normalise(quality)).toBe(normalise(type.symbol));
  });
});
