import type { ChordResult } from '@/lib/chord-analysis';
import { noteToSemitone } from '@/lib/theory';

import { ACCIDENTAL } from './spelling';
import { chromaticName } from './tuning';

const ROOT_LABEL = 'R';

/**
 * Pitch class → the degree it plays in a reading ("R", "3", "b7"), the counterpart
 * to `nameForPitchClassFrom`. Built from the reading's own chord tones, so
 * re-reading the same shape as a different chord re-letters the whole neck.
 *
 * Every note the user placed is by definition one the analysis saw, so a placed
 * dot always resolves; the chromatic fallback covers positions the reading
 * doesn't reach.
 */
export function degreeForPitchClassFrom(reading: ChordResult | undefined): (pc: number) => string {
  const map = new Map<number, string>();

  if (reading) {
    const tones = reading.chordTones;
    for (const row of [tones.triad, tones.seventh, tones.extensions]) {
      for (const slot of row) {
        if (slot.note) map.set(noteToSemitone(slot.note), slot.interval);
      }
    }
    map.set(noteToSemitone(tones.root), ROOT_LABEL);
  }

  return (pc: number) => map.get(pc) ?? chromaticName(pc, ACCIDENTAL);
}
