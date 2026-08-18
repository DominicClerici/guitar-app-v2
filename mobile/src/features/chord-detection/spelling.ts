import { chromaticName, type AccidentalSide } from '@/lib/accidentals';
import type { ChordResult } from '@/lib/chord-analysis';
import { noteToSemitone } from '@/lib/theory';

/**
 * How a fretboard dot is spelled when there is no chord to spell it — flats, which is the side
 * chord symbols are usually written on, and so what `auto` means on this screen.
 */
export const DETECTOR_FALLBACK: AccidentalSide = 'flat';

/**
 * Pitch class → spelled note, taken from the reading's own chord tones so the
 * fretboard dots use the spelling the engine chose (Bb, not A#, under a Bb root).
 *
 * `side` is reached only for the pitches the reading doesn't cover. That is the one place on this
 * neck where the choice is genuinely open — with no chord context a black key is a real sharp/flat
 * question — so it is the one place the user's preference answers it.
 */
export function nameForPitchClassFrom(
  reading: ChordResult | undefined,
  side: AccidentalSide,
): (pc: number) => string {
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

  return (pc: number) => map.get(pc) ?? chromaticName(pc, side);
}
