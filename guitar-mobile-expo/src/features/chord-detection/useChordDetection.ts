import { useCallback, useMemo, useState } from 'react';

import { analyzeChord, noteToSemitone, type ChordResult, type FretboardNote } from '@/lib/chord-analysis';

import { chromaticName } from './tuning';

// Spelling the engine resolves enharmonics with. There is no user preference in
// this app yet; flats are the convention chord symbols are usually written in.
const ACCIDENTAL = 'flat' as const;

export type PlacedNote = FretboardNote;

/**
 * Pitch class → spelled note, taken from the reading's own chord tones so the
 * fretboard dots use the spelling the engine chose (Bb, not A#, under a Bb root).
 * Anything the reading doesn't cover falls back to a neutral chromatic name.
 */
function nameForPitchClassFrom(reading: ChordResult | undefined): (pc: number) => string {
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

/**
 * A voicing being built on the fretboard and the engine's best reading of it.
 * Only the top-ranked name is surfaced — alternate readings, the interval grid
 * and the engine's warnings stay unused here.
 */
export function useChordDetection() {
  const [placed, setPlaced] = useState<PlacedNote[]>([]);

  // A string sounds one note at a time, so fretting a string moves its note
  // rather than adding a second one. Tapping a note again lifts it.
  const toggle = useCallback((string: number, fret: number) => {
    setPlaced((prev) =>
      prev.some((n) => n.string === string && n.fret === fret)
        ? prev.filter((n) => !(n.string === string && n.fret === fret))
        : [...prev.filter((n) => n.string !== string), { string, fret }],
    );
  }, []);

  const chord = useMemo(() => analyzeChord(placed, ACCIDENTAL)?.chordNames[0], [placed]);
  const rootPitchClass = chord ? noteToSemitone(chord.chordTones.root) : null;
  const nameForPitchClass = useMemo(() => nameForPitchClassFrom(chord), [chord]);

  return { placed, chord, rootPitchClass, nameForPitchClass, toggle };
}
