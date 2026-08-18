/**
 * How this tuner spells what it just heard.
 *
 * A tuner hears a pitch, not a note: there is no key, no chord and no scale to letter it against,
 * so a black key is a genuinely open choice and the user's is the one that settles it. `sharp` is
 * what `auto` means here — the way a chromatic tuner has always been printed, and the way the neck
 * is counted going up (F, F♯, G).
 */
import { useCallback } from 'react';

import { noteName, toAccidentalGlyphs, type AccidentalSide } from '@/lib/accidentals';
import { useAccidentalSide } from '@/lib/preferences';

export const TUNER_FALLBACK: AccidentalSide = 'sharp';

/** A MIDI pitch as this readout writes it — no octave; the readouts set that beside it. */
export function useNoteName(): (midi: number) => string {
  const side = useAccidentalSide(TUNER_FALLBACK);

  return useCallback((midi: number) => toAccidentalGlyphs(noteName(midi, side)), [side]);
}
