import { useCallback, useMemo, useState } from 'react';

import { ACCIDENTAL, nameForPitchClassFrom } from '@/features/chord-detection/spelling';
import type { PlacedNote } from '@/features/chord-detection/useChordDetection';
import { analyzeChord, noteToSemitone } from '@/lib/chord-analysis';

// The voicing and the chosen reading of it move together: fretting a note
// invalidates the old choice, and restoring a stored chord has to set both at
// once. Keeping them in one state value makes those transitions atomic.
interface Board {
  placed: PlacedNote[];
  selected: number;
}

const EMPTY: Board = { placed: [], selected: 0 };

/**
 * A voicing being built on the neck, with the engine's *ranked* readings of it
 * and which one the user has accepted. The accepted reading is what the key
 * engine scores, so an ambiguous shape (Am7 vs C6) is the user's call, not the
 * ranker's.
 */
export function useChordBuilder() {
  const [board, setBoard] = useState<Board>(EMPTY);

  // A string sounds one note at a time, so fretting a string moves its note
  // rather than adding a second one. Tapping a note again lifts it.
  const toggle = useCallback((string: number, fret: number) => {
    setBoard((prev) => {
      const held = prev.placed.some((n) => n.string === string && n.fret === fret);
      const placed = held
        ? prev.placed.filter((n) => !(n.string === string && n.fret === fret))
        : [...prev.placed.filter((n) => n.string !== string), { string, fret }];
      return { placed, selected: 0 };
    });
  }, []);

  const clear = useCallback(() => setBoard(EMPTY), []);

  const select = useCallback(
    (index: number) => setBoard((prev) => ({ ...prev, selected: index })),
    [],
  );

  /**
   * Put a stored voicing back on the neck. `rootPc` is the root of the reading
   * that was accepted when the chord was added, so the board comes back showing
   * that interpretation rather than re-ranking to a different one.
   */
  const load = useCallback((voicing: PlacedNote[], rootPc?: number) => {
    const readings = analyzeChord(voicing, ACCIDENTAL)?.chordNames ?? [];
    const match =
      rootPc === undefined
        ? -1
        : readings.findIndex((r) => noteToSemitone(r.chordTones.root) === rootPc);
    setBoard({ placed: voicing, selected: Math.max(0, match) });
  }, []);

  const readings = useMemo(
    () => analyzeChord(board.placed, ACCIDENTAL)?.chordNames ?? [],
    [board.placed],
  );

  const selectedIndex = Math.min(board.selected, Math.max(0, readings.length - 1));
  const chord = readings[selectedIndex];
  const rootPitchClass = chord ? noteToSemitone(chord.chordTones.root) : null;
  const nameForPitchClass = useMemo(() => nameForPitchClassFrom(chord), [chord]);

  return {
    placed: board.placed,
    readings,
    chord,
    selectedIndex,
    rootPitchClass,
    nameForPitchClass,
    toggle,
    select,
    clear,
    load,
  };
}
