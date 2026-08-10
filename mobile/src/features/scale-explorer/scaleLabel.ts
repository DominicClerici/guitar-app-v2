import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { Scale } from '@/lib/scale-library';

/** "A minor pentatonic", "C major", "F melodic minor" — glyphed for display. */
export function scaleLabel(scale: Scale): string {
  return `${toAccidentalGlyphs(scale.root)} ${scale.type.name.toLowerCase()}`;
}
