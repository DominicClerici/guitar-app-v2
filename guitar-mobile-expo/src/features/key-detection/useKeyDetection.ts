import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import { ACCIDENTAL } from '@/features/chord-detection/spelling';
import type { ChordResult, FretboardNote } from '@/lib/chord-analysis';
import { estimateKey, extractFeature, romanLabelsFor } from '@/lib/key-analysis';
import type { KeyEstimate, ProgressionChord, RomanLabel } from '@/lib/key-analysis';

export const MAX_CHORDS = 12;

export interface ProgressionState {
  chords: ProgressionChord[];
}

export type ProgressionAction =
  | { type: 'add'; chord: ProgressionChord }
  | { type: 'remove'; id: string }
  | { type: 'reorder'; from: number; to: number }
  | { type: 'clear' };

export function progressionReducer(
  state: ProgressionState,
  action: ProgressionAction,
): ProgressionState {
  switch (action.type) {
    case 'add':
      if (state.chords.length >= MAX_CHORDS) return state;
      return { chords: [...state.chords, action.chord] };
    case 'remove':
      return { chords: state.chords.filter((c) => c.id !== action.id) };
    case 'reorder': {
      const { from, to } = action;
      const len = state.chords.length;
      if (from === to || from < 0 || to < 0 || from >= len || to >= len) return state;
      const next = [...state.chords];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { chords: next };
    }
    case 'clear':
      return { chords: [] };
    default:
      return state;
  }
}

let idCounter = 0;

/**
 * Freeze an accepted reading into a progression entry. Capturing the reading
 * here matters: re-analysing the voicing later would hand back the engine's
 * primary name, not the one the user chose.
 */
export function buildProgressionChord(
  name: string,
  voicing: FretboardNote[],
  chord: ChordResult,
): ProgressionChord {
  idCounter += 1;
  return { id: `pc-${idCounter}`, name, voicing, feature: extractFeature(chord) };
}

// Session cache: the progression survives leaving and re-entering the screen
// within one app run, not across restarts. Mirrors the chord-detection pattern.
let cachedProgression: ProgressionChord[] = [];

/**
 * Owns the progression and runs the key engine over it. `labels` track the
 * *displayed* key, so choosing an ambiguous runner-up relabels every numeral.
 */
export function useKeyDetection() {
  const [state, dispatch] = useReducer(progressionReducer, undefined, () => ({
    chords: cachedProgression,
  }));

  useEffect(() => {
    cachedProgression = state.chords;
  }, [state.chords]);

  const estimate: KeyEstimate = useMemo(
    () => estimateKey(state.chords, ACCIDENTAL),
    [state.chords],
  );

  // Which candidate the readout is showing. A stale index would point at a
  // different key once the progression changes, so it resets alongside it.
  const [keyChoice, setKeyChoice] = useState(0);
  const [choiceFor, setChoiceFor] = useState(state.chords);
  if (choiceFor !== state.chords) {
    setChoiceFor(state.chords);
    setKeyChoice(0);
  }

  const displayedKey = estimate.candidates[keyChoice] ?? estimate.best;
  const labels: RomanLabel[] = useMemo(
    () => (displayedKey ? romanLabelsFor(state.chords, displayedKey) : []),
    [state.chords, displayedKey],
  );

  const add = useCallback((chord: ProgressionChord) => dispatch({ type: 'add', chord }), []);
  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const reorder = useCallback(
    (from: number, to: number) => dispatch({ type: 'reorder', from, to }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  return {
    chords: state.chords,
    estimate,
    labels,
    displayedKey,
    keyChoice,
    setKeyChoice,
    isFull: state.chords.length >= MAX_CHORDS,
    add,
    remove,
    reorder,
    clear,
  };
}
