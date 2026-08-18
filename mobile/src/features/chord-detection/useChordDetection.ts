import { useCallback, useMemo, useState } from 'react';

import { analyzeChord, type FretboardNote } from '@/lib/chord-analysis';
import { useAccidentalSide } from '@/lib/preferences';
import { noteToSemitone } from '@/lib/theory';

import { DETECTOR_FALLBACK, nameForPitchClassFrom } from './spelling';

export type PlacedNote = FretboardNote;

/**
 * A voicing being built on the fretboard and the engine's best reading of it.
 * Only the top-ranked name is surfaced — alternate readings, the interval grid
 * and the engine's warnings stay unused here. The key detector builds on
 * useChordBuilder instead, which keeps the full ranked list.
 */
export function useChordDetection() {
  const [placed, setPlaced] = useState<PlacedNote[]>([]);
  // The engine's tie-break, not an override: it decides an F#/Gb root the accidental count leaves
  // level, and nothing else. A shape that reads cleanest as Bb is still Bb under sharps.
  const side = useAccidentalSide(DETECTOR_FALLBACK);

  // A string sounds one note at a time, so fretting a string moves its note
  // rather than adding a second one. Tapping a note again lifts it.
  const toggle = useCallback((string: number, fret: number) => {
    setPlaced((prev) =>
      prev.some((n) => n.string === string && n.fret === fret)
        ? prev.filter((n) => !(n.string === string && n.fret === fret))
        : [...prev.filter((n) => n.string !== string), { string, fret }],
    );
  }, []);

  const chord = useMemo(() => analyzeChord(placed, side)?.chordNames[0], [placed, side]);
  const rootPitchClass = chord ? noteToSemitone(chord.chordTones.root) : null;
  const nameForPitchClass = useMemo(() => nameForPitchClassFrom(chord, side), [chord, side]);

  return { placed, chord, rootPitchClass, nameForPitchClass, toggle };
}
