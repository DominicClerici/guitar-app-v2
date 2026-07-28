import { noteToSemitone, type ChordResult } from '@/lib/chord-analysis';

import { chromaticName } from './tuning';

// Spelling the engine resolves enharmonics with. There is no user preference in
// this app yet; flats are the convention chord symbols are usually written in.
export const ACCIDENTAL = 'flat' as const;

/**
 * Pitch class → spelled note, taken from the reading's own chord tones so the
 * fretboard dots use the spelling the engine chose (Bb, not A#, under a Bb root).
 * Anything the reading doesn't cover falls back to a neutral chromatic name.
 */
export function nameForPitchClassFrom(reading: ChordResult | undefined): (pc: number) => string {
  const map = new Map<number, string>();

  if (reading) {
    const tones = reading.chordTones;
    const add = (name: string | null) => {
      if (name) map.set(noteToSemitone(name), name);
    };
    add(tones.root);
    add(tones.bass);
    for (const row of [tones.triad, tones.seventh, tones.extensions]) {
      for (const slot of row) add(slot.note);
    }
  }

  return (pc: number) => map.get(pc) ?? chromaticName(pc, ACCIDENTAL);
}
