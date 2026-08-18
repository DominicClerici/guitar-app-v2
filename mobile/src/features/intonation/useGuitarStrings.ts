import { useAccidentalSide, useTuning } from '@/lib/preferences';
import { TUNING_FALLBACK } from '@/lib/tuning';

import { guitarStrings, type GuitarString } from './strings';

/**
 * The strings on the guitar, named the way the user has them tuned.
 *
 * `TUNING_FALLBACK` rather than the tuner's: this names open strings, and a slackened one is E flat
 * and never D sharp. It is only the tie-break — someone who has asked for sharps still gets them.
 *
 * `guitarStrings` memoises on the pair, so every reader on the screen shares one array and the rail
 * does not rebuild six objects because the readout re-rendered.
 */
export function useGuitarStrings(): GuitarString[] {
  return guitarStrings(useTuning(), useAccidentalSide(TUNING_FALLBACK));
}
