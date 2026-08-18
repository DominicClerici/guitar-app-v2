import { formatTuning } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import { STANDARD, tuningFor } from '@/lib/tuning';

import { guitarStrings, instruction, misfireMessage, stringForOpenMidi } from './strings';

const DROP_D = tuningFor(formatTuning([64, 59, 55, 50, 45, 38]));

describe('guitarStrings', () => {
  it('runs thickest first, the order a saddle is worked through', () => {
    expect(guitarStrings(STANDARD, 'flat').map((s) => s.openMidi)).toEqual([40, 45, 50, 55, 59, 64]);
  });

  it('names a standard guitar the way this screen always named it', () => {
    const strings = guitarStrings(STANDARD, 'flat');

    expect(strings.map((s) => s.glyph)).toEqual(['E', 'A', 'D', 'G', 'B', 'e']);
    expect(strings.map((s) => s.label)).toEqual(['low E', 'A', 'D', 'G', 'B', 'high e']);
  });

  it('renames the string the user actually dropped, and only that one', () => {
    const strings = guitarStrings(DROP_D, 'flat');

    expect(strings[0].label).toBe('low D');
    expect(strings.slice(1).map((s) => s.glyph)).toEqual(['A', 'D', 'G', 'B', 'e']);
  });

  it('keeps ids positional, so readings survive a retune mid-check', () => {
    expect(guitarStrings(DROP_D, 'flat').map((s) => s.id)).toEqual(
      guitarStrings(STANDARD, 'flat').map((s) => s.id),
    );
  });

  it('targets the octave above whatever the string is tuned to', () => {
    expect(guitarStrings(DROP_D, 'flat')[0].targetMidi).toBe(50);
  });

  it('hands back the same array for the same tuning and spelling', () => {
    expect(guitarStrings(STANDARD, 'flat')).toBe(guitarStrings(STANDARD, 'flat'));
  });
});

describe('the copy the screen reads out', () => {
  it('asks for the string the guitar actually has', () => {
    const [low] = guitarStrings(DROP_D, 'flat');

    expect(instruction(low, 'fretted')).toContain('low D string');
  });

  it('names the open string it heard instead', () => {
    const [low] = guitarStrings(DROP_D, 'flat');

    expect(misfireMessage(38, low, 'fretted', 'flat')).toContain('open low D string');
  });
});

describe('stringForOpenMidi', () => {
  it('recognises the dropped string, and no longer the E it used to be', () => {
    const strings = guitarStrings(DROP_D, 'flat');

    expect(stringForOpenMidi(strings, 38)?.id).toBe('string-6');
    expect(stringForOpenMidi(strings, 40)).toBeUndefined();
  });
});
