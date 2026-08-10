// Maps a built Chord into the ChordTones slot grid the chord detector already
// renders, so the library screen can reuse IntervalLattice rather than grow a
// second interval display.

import type { ChordTones, IntervalSlot } from '../chord-analysis';
import { ALTERED_DEGREES, type Degree } from '../theory';

import type { Chord } from './types';

// Slot order is fixed by the existing grid — three rows, same labels, same
// sequence. Keep in step with chord-analysis/adapter.ts.
const TRIAD_SLOTS = ['sus2', 'm3', '3', 'sus4', 'b5', '5', '#5'] as const;
const SEVENTH_SLOTS = ['b6', 'dim7', '6', '7', 'maj7'] as const;
const EXTENSION_SLOTS = ['b9', '#9', '9', '#11', '11', 'b13', '13'] as const;

function rowFor(chord: Chord, slots: readonly string[]): IntervalSlot[] {
  return slots.map((slot) => {
    const tone = chord.tones.find((candidate) => candidate.degree === slot);
    return {
      interval: slot,
      note: tone ? tone.note : null,
      altered: ALTERED_DEGREES.has(slot as Degree),
    };
  });
}

/** Library chords are always root position, so `bass` is null. */
export function toChordTones(chord: Chord): ChordTones {
  return {
    root: chord.root,
    bass: null,
    triad: rowFor(chord, TRIAD_SLOTS),
    seventh: rowFor(chord, SEVENTH_SLOTS),
    extensions: rowFor(chord, EXTENSION_SLOTS),
  };
}
