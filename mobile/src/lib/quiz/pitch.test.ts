import { describe, expect, it } from 'vitest';

import { midiFromPitchName, midisFromPitchNames } from './pitch';

describe('midiFromPitchName', () => {
  it('reads the anchors', () => {
    expect(midiFromPitchName('C4')).toBe(60);
    expect(midiFromPitchName('A4')).toBe(69);
    expect(midiFromPitchName('A3')).toBe(57);
    expect(midiFromPitchName('E2')).toBe(40);
  });

  it('reads accidentals, in ASCII and in glyphs', () => {
    expect(midiFromPitchName('F#2')).toBe(42);
    expect(midiFromPitchName('Gb2')).toBe(42);
    expect(midiFromPitchName('F♯2')).toBe(42);
    expect(midiFromPitchName('G♭2')).toBe(42);
    expect(midiFromPitchName('F##2')).toBe(43);
  });

  it('shifts off the letter, so the octave follows the letter name', () => {
    // Cb4 is the semitone below C4, not B4 — an author writing Cb4 means that register.
    expect(midiFromPitchName('Cb4')).toBe(59);
    expect(midiFromPitchName('B#3')).toBe(60);
  });

  it('accepts a lower-case letter and surrounding space', () => {
    expect(midiFromPitchName(' a3 ')).toBe(57);
  });

  it('returns null for a name it cannot read', () => {
    expect(midiFromPitchName('H4')).toBeNull();
    expect(midiFromPitchName('A')).toBeNull();
    expect(midiFromPitchName('')).toBeNull();
    expect(midiFromPitchName('440hz')).toBeNull();
  });
});

describe('midisFromPitchNames', () => {
  it('keeps order and drops what it cannot read', () => {
    expect(midisFromPitchNames(['A3', 'nonsense', 'C4'])).toEqual([57, 60]);
  });

  it('drops notes outside the MIDI range rather than sounding nothing', () => {
    expect(midisFromPitchNames(['C-2', 'C4', 'C11'])).toEqual([60]);
  });
});
