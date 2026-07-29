// Three notes per string, computed rather than tabulated.
//
// Shape n starts on the nth scale tone available on the low E string and then
// just keeps climbing: three consecutive scale tones on each string, crossing to
// the next string, up to the high e. Because every note's fret is fixed by its
// pitch, the shape is fully determined by where it starts — there is nothing to
// tabulate, and it is exact for any seven-note scale in the catalogue.
//
// A shape that would need a fret past the end of the neck is dropped rather than
// squeezed. Better to page through six honest shapes than seven, one of which
// lies about where the neck ends.

import { FRET_COUNT, OPEN_PITCHES_MIDI, STRING_COUNT } from '@/lib/theory';

import { nextScalePitch, positionKey, stringPitches } from './neck';
import type { Position } from './types';

const NOTES_PER_STRING = 3;
/** Only a seven-note scale divides evenly into three-per-string shapes. */
export const NPS_SCALE_SIZE = 7;

export function npsPositions(pitchClasses: readonly number[]): Position[] {
  if (pitchClasses.length !== NPS_SCALE_SIZE) return [];

  const lowString = STRING_COUNT - 1;
  const starts = stringPitches(pitchClasses, lowString).slice(0, NPS_SCALE_SIZE);

  const found: Position[] = [];

  starts.forEach((start, index) => {
    const keys = new Set<string>();
    let pitch = start;
    let from = FRET_COUNT;
    let to = 0;

    for (let string = lowString; string >= 0; string -= 1) {
      for (let note = 0; note < NOTES_PER_STRING; note += 1) {
        const fret = pitch - OPEN_PITCHES_MIDI[string];
        if (fret < 0 || fret > FRET_COUNT) return;

        keys.add(positionKey(string, fret));
        from = Math.min(from, fret);
        to = Math.max(to, fret);
        pitch = nextScalePitch(pitchClasses, pitch);
      }
    }

    found.push({
      id: `nps-${index}`,
      label: `Position ${index + 1}`,
      from,
      to,
      keys,
    });
  });

  return found;
}
