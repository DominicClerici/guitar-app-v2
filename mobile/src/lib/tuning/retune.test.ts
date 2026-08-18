import { formatTuning } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import { analyzeChord } from '../chord-analysis';
import { buildChord } from '../chord-library';
import { positionsFor, scaleKeys } from '../guitar-positions';
import { generateVoicings } from '../guitar-voicings';
import { buildScale } from '../scale-library';

import { STANDARD, tuningFor } from './tuning';

/**
 * What the tuning setting is actually for, checked through the engines it reaches rather than on
 * the parser it comes out of. Each of these is a thing that would be *wrong on screen* — a chord
 * named for a note the guitar cannot make, a scale dot on a fret that does not hold it — rather
 * than merely differently computed.
 */

const DROP_D = tuningFor(formatTuning([64, 59, 55, 50, 45, 38]));

describe('a chord is named for what it sounds', () => {
  // An open sixth string with the A-string second fret and D-string second fret: E-B-E on a
  // standard neck, D-B-E once the sixth is dropped.
  const shape = [
    { string: 5, fret: 0 },
    { string: 4, fret: 2 },
    { string: 3, fret: 2 },
  ];

  it('reads the standard neck as the chord that neck makes', () => {
    expect(analyzeChord(STANDARD, shape)?.chordNames[0]?.name).toContain('E');
  });

  it('does not keep calling it that once the string is dropped', () => {
    const standard = analyzeChord(STANDARD, shape)?.chordNames[0]?.name;
    const dropped = analyzeChord(DROP_D, shape)?.chordNames[0]?.name;

    expect(dropped).not.toBe(standard);
  });

  it('hears the dropped string as the D it now is', () => {
    // Sixth string open, fourth fret: the E the shape used to start on, two frets up.
    const moved = [
      { string: 5, fret: 2 },
      { string: 4, fret: 2 },
      { string: 3, fret: 2 },
    ];

    expect(analyzeChord(DROP_D, moved)?.chordNames[0]?.name).toBe(
      analyzeChord(STANDARD, shape)?.chordNames[0]?.name,
    );
  });
});

describe('a scale falls where the strings put it', () => {
  const scale = buildScale('C', 'major');

  it('puts a tone on the dropped string two frets higher than standard would', () => {
    const standard = scaleKeys(STANDARD, scale.pitchClasses);
    const dropped = scaleKeys(DROP_D, scale.pitchClasses);

    // C on the sixth string: fret 8 standard, fret 10 once it is a D string.
    expect(standard.has('5-8')).toBe(true);
    expect(dropped.has('5-8')).toBe(false);
    expect(dropped.has('5-10')).toBe(true);
  });

  it('leaves the five untouched strings exactly where they were', () => {
    const standard = scaleKeys(STANDARD, scale.pitchClasses);
    const dropped = scaleKeys(DROP_D, scale.pitchClasses);

    for (const key of standard) {
      if (!key.startsWith('5-')) expect(dropped.has(key)).toBe(true);
    }
  });

  it('still carves the neck into boxes', () => {
    expect(positionsFor(DROP_D, scale, 'caged').length).toBeGreaterThan(0);
  });
});

describe('a chord shape is generated for the neck it will be held on', () => {
  const chord = buildChord('D', 'maj');

  it('spells the chord on every string it uses', () => {
    const wanted = new Set(chord.tones.map((tone) => tone.pitchClass));

    for (const voicing of generateVoicings(DROP_D, chord)) {
      voicing.frets.forEach((fret, string) => {
        if (fret === null) return;
        expect(wanted.has((DROP_D.open[string] + fret) % 12)).toBe(true);
      });
    }
  });

  it('offers a shape that standard tuning could not hold', () => {
    const standard = new Set(generateVoicings(STANDARD, chord).map((v) => v.id));
    const dropped = generateVoicings(DROP_D, chord).map((v) => v.id);

    expect(dropped.some((id) => !standard.has(id))).toBe(true);
  });
});
