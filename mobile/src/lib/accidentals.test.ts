import { describe, expect, it } from 'vitest';

import {
  accidentalSide,
  chromaticName,
  noteName,
  pitchName,
  toAccidentalGlyphs,
} from './accidentals';

describe('accidentalSide', () => {
  it('takes the side the user chose', () => {
    expect(accidentalSide('sharp', 'flat')).toBe('sharp');
    expect(accidentalSide('flat', 'sharp')).toBe('flat');
  });

  // `auto` is the absence of an instruction, so the surface's own convention stands: a tuning
  // reads E flat standard, a chromatic drill counts F, F sharp, G.
  it('leaves the surface its own convention under auto', () => {
    expect(accidentalSide('auto', 'flat')).toBe('flat');
    expect(accidentalSide('auto', 'sharp')).toBe('sharp');
  });
});

describe('naming', () => {
  it('spells a black key on the side it is given', () => {
    expect(chromaticName(6, 'sharp')).toBe('F#');
    expect(chromaticName(6, 'flat')).toBe('Gb');
  });

  it('leaves a white key alone whichever side is asked for', () => {
    expect(chromaticName(4, 'sharp')).toBe('E');
    expect(chromaticName(4, 'flat')).toBe('E');
  });

  it('names a MIDI pitch with and without its octave', () => {
    expect(noteName(58, 'flat')).toBe('Bb');
    expect(pitchName(58, 'flat')).toBe('Bb3');
    expect(pitchName(60, 'sharp')).toBe('C4');
  });

  // Below MIDI 0 is off any instrument, but the modulo must not go negative on the way past.
  it('wraps a pitch class from either direction', () => {
    expect(noteName(-2, 'sharp')).toBe('A#');
  });
});

describe('toAccidentalGlyphs', () => {
  it('rewrites both accidentals and leaves the note B alone', () => {
    expect(toAccidentalGlyphs('Bb')).toBe('B♭');
    expect(toAccidentalGlyphs('C#m7')).toBe('C♯m7');
    expect(toAccidentalGlyphs('B')).toBe('B');
  });
});
