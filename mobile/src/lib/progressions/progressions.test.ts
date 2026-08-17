import { describe, expect, it } from 'vitest';

import { chartFor } from '@/lib/guitar-voicings';
import { midiAt } from '@/lib/theory';

import { readProgression, strumMidis } from './index';

const charts = (symbols: string[]) =>
  readProgression(symbols).map((entry) => `${entry.symbol} ${chartFor(entry.voicing.frets)}`);

describe('readProgression', () => {
  it('gives the open chords a player would reach for', () => {
    // The point of going through `applyPins`: these are the curated shapes, not
    // whatever the generator scores highest in the abstract.
    expect(charts(['Am', 'F', 'C', 'G'])).toEqual([
      'Am x 0 2 2 1 0',
      'F 1 3 3 2 1 1',
      'C x 3 2 0 1 0',
      'G 3 2 0 0 0 3',
    ]);
  });

  it('reads the minor-key chords this pathway is built on', () => {
    expect(readProgression(['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'])).toHaveLength(7);
  });

  it('drops a symbol it cannot parse rather than failing the block', () => {
    expect(charts(['Am', 'wat', 'G'])).toEqual(['Am x 0 2 2 1 0', 'G 3 2 0 0 0 3']);
    expect(readProgression([])).toEqual([]);
  });

  it('keeps the authored symbol, so a caption prints what was written', () => {
    expect(readProgression(['Am']).map((entry) => entry.symbol)).toEqual(['Am']);
  });
});

describe('strumMidis', () => {
  it('sounds low string to high, the order a pick crosses them', () => {
    const [am] = readProgression(['Am']);

    // Open Am is x 0 2 2 1 0 — A2 E3 A3 C4 E4.
    expect(am.midis).toEqual([45, 52, 57, 60, 64]);
    expect([...am.midis].sort((a, b) => a - b)).toEqual(am.midis);
  });

  it('skips a muted string rather than sounding its open pitch', () => {
    const [am] = readProgression(['Am']);

    // The low E is muted in x02210; sounding it would put 40 at the front.
    expect(am.midis).not.toContain(midiAt(5, 0));
    expect(am.midis).toHaveLength(5);
  });

  it('never sounds more pitches than the voicing has strings', () => {
    for (const entry of readProgression(['Am', 'F', 'C', 'G', 'Bdim', 'E'])) {
      expect(entry.midis.length, entry.symbol).toBeLessThanOrEqual(6);
      expect(entry.midis.length, entry.symbol).toBeGreaterThanOrEqual(3);
      expect(strumMidis(entry.voicing), entry.symbol).toEqual(entry.midis);
    }
  });
});
