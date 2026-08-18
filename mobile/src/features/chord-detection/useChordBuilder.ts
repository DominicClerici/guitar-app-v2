import { useCallback, useMemo, useState } from 'react';

import type { AccidentalSide } from '@/lib/accidentals';
import { analyzeChord } from '@/lib/chord-analysis';
import type { Tuning } from '@/lib/tuning';
import { useAccidentalSide, useTuning } from '@/lib/preferences';
import { noteToSemitone } from '@/lib/theory';

import { DETECTOR_FALLBACK, nameForPitchClassFrom } from './spelling';
import type { PlacedNote } from './useChordDetection';

// The voicing and the chosen reading of it move together: fretting a note
// invalidates the old choice, and restoring a stored chord has to set both at
// once. Keeping them in one state value makes those transitions atomic.
interface Board {
  placed: PlacedNote[];
  selected: number;
}

const EMPTY: Board = { placed: [], selected: 0 };

/**
 * A stored voicing as a board. `rootPc` is the root of the reading that was
 * accepted when the chord was put away, so it comes back showing that
 * interpretation rather than re-ranking to a different one.
 */
function boardFor(
  tuning: Tuning,
  placed: PlacedNote[],
  side: AccidentalSide,
  rootPc?: number,
): Board {
  const readings = analyzeChord(tuning, placed, side)?.chordNames ?? [];
  const match =
    rootPc === undefined
      ? -1
      : readings.findIndex((r) => noteToSemitone(r.chordTones.root) === rootPc);
  return { placed, selected: Math.max(0, match) };
}

/** A shape the board should open on, rather than starting bare. */
export interface InitialVoicing {
  placed: PlacedNote[];
  /** Root of the reading to accept, where the shape has more than one. */
  rootPitchClass?: number;
}

/**
 * A voicing being built on the neck, with the engine's *ranked* readings of it
 * and which one the user has accepted. An ambiguous shape (Am7 vs C6) is the
 * user's call, not the ranker's — the chord detector shows the accepted reading's
 * intervals and warnings, and the key detector scores it against the progression.
 *
 * `initial` seeds the board on mount. A shape handed over from another screen
 * belongs in the first render rather than in an effect after it: the drone reads
 * pitches straight off the board, and a frame of empty neck would be a frame of
 * the wrong chord.
 */
export function useChordBuilder(initial?: InitialVoicing) {
  // The engine's tie-break, not an override: it settles an F#/Gb root the accidental count leaves
  // level, and nothing else. A shape that reads cleanest as Bb is still Bb under sharps.
  const side = useAccidentalSide(DETECTOR_FALLBACK);
  const tuning = useTuning();

  const [board, setBoard] = useState<Board>(() =>
    initial ? boardFor(tuning, initial.placed, side, initial.rootPitchClass) : EMPTY,
  );

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

  /** Put a stored voicing back on the neck. */
  const load = useCallback(
    (voicing: PlacedNote[], rootPc?: number) => {
      setBoard(boardFor(tuning, voicing, side, rootPc));
    },
    [tuning, side],
  );

  const readings = useMemo(
    () => analyzeChord(tuning, board.placed, side)?.chordNames ?? [],
    [tuning, board.placed, side],
  );

  const selectedIndex = Math.min(board.selected, Math.max(0, readings.length - 1));
  const chord = readings[selectedIndex];
  const rootPitchClass = chord ? noteToSemitone(chord.chordTones.root) : null;
  const nameForPitchClass = useMemo(() => nameForPitchClassFrom(chord, side), [chord, side]);

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
