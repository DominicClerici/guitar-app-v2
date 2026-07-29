import { describe, expect, it } from 'vitest';

import { ROOTS } from '@/lib/chord-library';

import { SCALE_TYPES, scaleTypeById } from './catalog';
import { intervalLabel, stepFormula } from './intervals';
import { relatedScales } from './neighbours';
import { buildScale } from './scale';
import { noteToPitchClass, spellScale } from './spell';

const LETTERS = 'CDEFGAB';

function typeOf(id: string) {
  const type = scaleTypeById(id);
  if (!type) throw new Error(`no scale type "${id}"`);
  return type;
}

describe('catalog', () => {
  it('has ascending semitones starting at the root, with one degree label each', () => {
    for (const type of SCALE_TYPES) {
      expect(type.semitones[0], type.id).toBe(0);
      expect(type.degrees.length, type.id).toBe(type.semitones.length);

      for (let i = 1; i < type.semitones.length; i += 1) {
        expect(type.semitones[i], `${type.id} tone ${i}`).toBeGreaterThan(type.semitones[i - 1]);
        expect(type.semitones[i], `${type.id} tone ${i}`).toBeLessThan(12);
      }
    }
  });

  it('gives every accent a degree the scale actually contains', () => {
    for (const type of SCALE_TYPES) {
      if (!type.accent) continue;
      expect(type.degrees, type.id).toContain(type.accent.degree);
    }
  });

  it('has unique ids', () => {
    expect(new Set(SCALE_TYPES.map((t) => t.id)).size).toBe(SCALE_TYPES.length);
  });
});

describe('spellScale', () => {
  it('spells the modes of C major', () => {
    expect(spellScale('C', typeOf('major'))).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(spellScale('D', typeOf('dorian'))).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C']);
    expect(spellScale('E', typeOf('phrygian'))).toEqual(['E', 'F', 'G', 'A', 'B', 'C', 'D']);
    expect(spellScale('F', typeOf('lydian'))).toEqual(['F', 'G', 'A', 'B', 'C', 'D', 'E']);
    expect(spellScale('G', typeOf('mixolydian'))).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F']);
    expect(spellScale('A', typeOf('minor'))).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    expect(spellScale('B', typeOf('locrian'))).toEqual(['B', 'C', 'D', 'E', 'F', 'G', 'A']);
  });

  it('spells flat and sharp roots the way they are written', () => {
    expect(spellScale('Bb', typeOf('dorian'))).toEqual(['Bb', 'C', 'Db', 'Eb', 'F', 'G', 'Ab']);
    expect(spellScale('A#', typeOf('locrian'))).toEqual(['A#', 'B', 'C#', 'D#', 'E', 'F#', 'G#']);
    expect(spellScale('Gb', typeOf('lydian-sharp2'))).toEqual([
      'Gb',
      'A',
      'Bb',
      'C',
      'Db',
      'Eb',
      'F',
    ]);
  });

  it('keeps both fifths of the blues scale on the same letter', () => {
    expect(spellScale('C', typeOf('blues'))).toEqual(['C', 'Eb', 'F', 'Gb', 'G', 'Bb']);
    expect(spellScale('C', typeOf('major-blues'))).toEqual(['C', 'D', 'Eb', 'E', 'G', 'A']);
  });

  it('uses double accidentals where the spelling demands them', () => {
    // Which is exactly why relatedScales reaches for Bb over A# — see below.
    expect(spellScale('A#', typeOf('lydian'))).toEqual([
      'A#',
      'B#',
      'C##',
      'D##',
      'E#',
      'F##',
      'G##',
    ]);
  });

  it('gives one letter per degree number, in order, for every scale and root', () => {
    for (const root of ROOTS) {
      for (const type of SCALE_TYPES) {
        const notes = spellScale(root, type);
        const rootPc = noteToPitchClass(root);

        notes.forEach((note, index) => {
          const where = `${root} ${type.id} tone ${index}`;

          // The letter is fixed by the degree number, counted from the root's letter.
          const step = Number.parseInt(type.degrees[index].replace(/[^0-9]/g, ''), 10) - 1;
          const expected = LETTERS[(LETTERS.indexOf(root[0]) + step) % 7];
          expect(note[0], where).toBe(expected);

          // And the accidentals have to land it on the right pitch.
          expect(noteToPitchClass(note), where).toBe((rootPc + type.semitones[index]) % 12);
        });
      }
    }
  });
});

describe('intervalLabel', () => {
  it('names the plain intervals', () => {
    expect(intervalLabel('1', 0)).toBe('R');
    expect(intervalLabel('2', 2)).toBe('M2');
    expect(intervalLabel('b3', 3)).toBe('m3');
    expect(intervalLabel('4', 5)).toBe('P4');
    expect(intervalLabel('5', 7)).toBe('P5');
    expect(intervalLabel('6', 9)).toBe('M6');
    expect(intervalLabel('b7', 10)).toBe('m7');
    expect(intervalLabel('7', 11)).toBe('M7');
  });

  it('separates the enharmonic tritones by the degree they are spelled as', () => {
    expect(intervalLabel('#4', 6)).toBe('A4');
    expect(intervalLabel('b5', 6)).toBe('d5');
  });

  it('names the altered scale′s degrees', () => {
    expect(intervalLabel('b2', 1)).toBe('m2');
    expect(intervalLabel('b4', 4)).toBe('d4');
    expect(intervalLabel('#2', 3)).toBe('A2');
  });
});

describe('stepFormula', () => {
  it('reads the major scale as tones and semitones', () => {
    expect(stepFormula(typeOf('major').semitones)).toEqual(['W', 'W', 'H', 'W', 'W', 'W', 'H']);
  });

  it('writes a three-semitone gap as one and a half', () => {
    expect(stepFormula(typeOf('minor-pentatonic').semitones)).toEqual([
      '1½',
      'W',
      'W',
      '1½',
      'W',
    ]);
  });

  it('always adds up to an octave', () => {
    for (const type of SCALE_TYPES) {
      const total = type.semitones.reduce((sum, semitone, index) => {
        const next = index === type.semitones.length - 1 ? type.semitones[0] + 12 : type.semitones[index + 1];
        return sum + (next - semitone);
      }, 0);
      expect(total, type.id).toBe(12);
    }
  });
});

describe('relatedScales', () => {
  it('finds the other modes of the same parent, walking up from the root', () => {
    const related = relatedScales(buildScale('D', 'dorian'));
    expect(related.sameNotes.map((entry) => `${entry.root} ${entry.type.name}`)).toEqual([
      'E Phrygian',
      'F Lydian',
      'G Mixolydian',
      'A Natural minor',
      'B Locrian',
      'C Major',
    ]);
  });

  it('pairs a pentatonic with its relative', () => {
    const related = relatedScales(buildScale('A', 'minor-pentatonic'));
    expect(related.sameNotes.map((entry) => `${entry.root} ${entry.type.name}`)).toEqual([
      'C Major pentatonic',
    ]);
  });

  it('names what a one-note-away scale swaps', () => {
    const related = relatedScales(buildScale('C', 'major'));
    const lydian = related.oneAway.find(
      (entry) => entry.type.id === 'lydian' && entry.root === 'C',
    );
    expect(lydian?.swap).toEqual({ added: 'F#', removed: 'F' });
  });

  it('only offers swaps, never a scale of a different size', () => {
    for (const root of ROOTS) {
      for (const type of SCALE_TYPES) {
        const scale = buildScale(root, type.id);
        for (const entry of relatedScales(scale).oneAway) {
          expect(entry.type.semitones.length, `${root} ${type.id}`).toBe(type.semitones.length);
          expect(entry.swap?.added, `${root} ${type.id}`).toBeTruthy();
          expect(entry.swap?.removed, `${root} ${type.id}`).toBeTruthy();
        }
      }
    }
  });

  it('prefers the root spelling that avoids double accidentals', () => {
    // Bb Lydian is Bb C D E F G A; A# Lydian needs a D##.
    const related = relatedScales(buildScale('F', 'major'));
    const lydian = related.sameNotes.find((entry) => entry.type.id === 'lydian');
    expect(lydian?.root).toBe('Bb');
  });
});
