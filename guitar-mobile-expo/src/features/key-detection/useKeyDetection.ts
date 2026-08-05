import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import { ACCIDENTAL } from '@/features/chord-detection/spelling';
import { analyzeChord } from '@/lib/chord-analysis';
import type { ChordResult, FretboardNote } from '@/lib/chord-analysis';
import { accidentalSideFor, estimateKey, extractFeature, romanLabelsFor } from '@/lib/key-analysis';
import type { KeyEstimate, ProgressionChord, RomanLabel } from '@/lib/key-analysis';
import { noteToSemitone } from '@/lib/theory';

export const MAX_CHORDS = 12;

export interface ProgressionState {
  chords: ProgressionChord[];
}

export type ProgressionAction =
  | { type: 'add'; chord: ProgressionChord }
  | { type: 'replace'; id: string; chord: ProgressionChord }
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
    case 'replace': {
      const i = state.chords.findIndex((c) => c.id === action.id);
      if (i === -1) return state;
      const next = [...state.chords];
      // Keep the original id: the chip is the same entry being edited, and its
      // identity is what carries the drag and layout animations across the swap.
      next[i] = { ...action.chord, id: action.id };
      return { chords: next };
    }
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

/**
 * A progression chord as the screen renders it: the stored voicing and readings,
 * plus the name of the reading the displayed key's analysis committed to. The
 * name is derived, not stored — it moves when the estimate (or the user's key
 * choice) moves, which is the point of naming chords in context.
 */
export interface DisplayChord extends ProgressionChord {
  name: string;
  /** Index into `readings` that `name` belongs to. */
  readingIndex: number;
}

let idCounter = 0;

/**
 * Freeze a voicing into a progression entry. Every reading the analyzer offered
 * is kept — the key engine chooses among them in the context of the whole
 * progression — and `pinned` records the one the user explicitly chose, if any,
 * which the engine then never overrides.
 */
export function buildProgressionChord(
  voicing: FretboardNote[],
  readings: ChordResult[],
  pinned: number | null,
): ProgressionChord {
  idCounter += 1;
  return {
    id: `pc-${idCounter}`,
    voicing,
    readings: readings.map(extractFeature),
    pinned: pinned !== null && pinned >= 0 && pinned < readings.length ? pinned : null,
  };
}

// Session cache: the progression survives leaving and re-entering the screen
// within one app run, not across restarts. Mirrors the chord-detection pattern.
let cachedProgression: ProgressionChord[] = [];

/**
 * Owns the progression and runs the key engine over it. Everything shown for a
 * chord — its name, its numeral — tracks the *displayed* key, so choosing an
 * ambiguous runner-up relabels the whole progression as that key's analysis,
 * not just the numerals.
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

  /**
   * Names re-derived per render from the displayed key: each chord takes the
   * reading that key's assignment chose (its pin, when it has one), spelled on
   * the key's side of the accidental fence. With no key yet, the pinned or
   * primary reading in the app's default spelling stands in.
   */
  const chords: DisplayChord[] = useMemo(() => {
    const side = displayedKey
      ? accidentalSideFor(displayedKey.tonicPc, displayedKey.mode, ACCIDENTAL)
      : ACCIDENTAL;
    return state.chords.map((c, i) => {
      const readingIndex = Math.min(
        (displayedKey ? displayedKey.assignment[i] : undefined) ?? c.pinned ?? 0,
        Math.max(0, c.readings.length - 1),
      );
      const rootPc = c.readings[readingIndex]?.rootPc;
      const analysis = analyzeChord(c.voicing, side, displayedKey ? side : undefined);
      // Match by root rather than index: the re-analysis is the same ranked list
      // the readings were extracted from, but the root is the identity that
      // matters if the two ever disagree on order.
      const named =
        analysis?.chordNames.find((r) => noteToSemitone(r.chordTones.root) === rootPc) ??
        analysis?.chordNames[0];
      return { ...c, name: named?.name ?? '—', readingIndex };
    });
  }, [state.chords, displayedKey]);

  const labels: RomanLabel[] = useMemo(
    () => (displayedKey ? romanLabelsFor(state.chords, displayedKey) : []),
    [state.chords, displayedKey],
  );

  const add = useCallback((chord: ProgressionChord) => dispatch({ type: 'add', chord }), []);
  const replace = useCallback(
    (id: string, chord: ProgressionChord) => dispatch({ type: 'replace', id, chord }),
    [],
  );
  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const reorder = useCallback(
    (from: number, to: number) => dispatch({ type: 'reorder', from, to }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);

  return {
    chords,
    estimate,
    labels,
    displayedKey,
    keyChoice,
    setKeyChoice,
    isFull: state.chords.length >= MAX_CHORDS,
    add,
    replace,
    remove,
    reorder,
    clear,
  };
}
