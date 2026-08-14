import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS, decodeSettings } from './trainerSettings';

/** A body that is valid in every field, to change one at a time from. */
const GOOD = {
  input: 'tap',
  source: { mode: 'generate', values: ['quarter', 'eighth'], rests: false },
  bpm: 120,
  beatsPerBar: 3,
  ramp: { enabled: true, step: 8 },
};

function decode(body: unknown) {
  return decodeSettings(JSON.stringify(body));
}

describe('decodeSettings', () => {
  it('opens at the defaults when nothing has been saved', () => {
    expect(decodeSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it('reads back what was written', () => {
    expect(decode(GOOD)).toEqual(GOOD);
  });

  it('falls back to the defaults on a body that is not JSON at all', () => {
    expect(decodeSettings('{ this is not')).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps the fields it understands when one is from a newer build', () => {
    // The forward-compatibility rule: an unrecognised input mode costs you the input mode, not the
    // tempo you had set.
    const settings = decode({ ...GOOD, input: 'foot-pedal' });

    expect(settings.input).toBe('mic');
    expect(settings.bpm).toBe(120);
    expect(settings.ramp).toEqual({ enabled: true, step: 8 });
  });

  it('drops a note value it does not know and keeps the rest of the selection', () => {
    const settings = decode({
      ...GOOD,
      source: { mode: 'generate', values: ['quarter', 'quintuplet'], rests: true },
    });

    // The whole array is what failed to parse, so the pattern source falls back rather than
    // silently composing from half a selection the user never chose.
    expect(settings.source).toEqual({ mode: 'generate', values: [], rests: true });
  });

  it('refuses a tempo outside the range the rail can reach', () => {
    expect(decode({ ...GOOD, bpm: 4000 }).bpm).toBe(90);
    expect(decode({ ...GOOD, bpm: 1 }).bpm).toBe(90);
  });

  it('refuses a meter that is not one of the four offered', () => {
    expect(decode({ ...GOOD, beatsPerBar: 7 }).beatsPerBar).toBe(4);
  });

  it('refuses a ramp step that is not one of the three offered, and keeps the switch', () => {
    // Field by field rather than object by object: an unreadable step costs you the step, not the
    // fact that you had asked for the tempo to move at all.
    expect(decode({ ...GOOD, ramp: { enabled: true, step: 37 } }).ramp).toEqual({
      enabled: true,
      step: 4,
    });
  });

  it('keeps a preset id it does not recognise, because the library decides what to do with it', () => {
    // Dropping it here would lose the user's choice on a build that has the preset; `presetFor` is
    // where an unknown id becomes a real pattern.
    expect(decode({ ...GOOD, source: { mode: 'preset', id: 'clave' } }).source).toEqual({
      mode: 'preset',
      id: 'clave',
    });
  });
});
