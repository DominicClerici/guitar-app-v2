import { useState } from 'react';

import { haptics } from '@/lib/haptics';

import type { Rect } from './chipGeometry';

export interface ChipMenuTarget {
  id: string;
  /** The chip's rect in window coordinates, which the card hangs off. */
  anchor: Rect;
}

interface Actions {
  onSelect: (id: string) => void;
  onAnalyze: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * The menu's side of the held-chip interaction: which chip it belongs to, whether
 * the finger has let go of it, and which item is under the finger.
 *
 * This lives above both the chip row and the menu because the two are in different
 * parts of the tree — the row is buried in a scroll view, the menu has to be drawn
 * at the screen's root to escape it. The row's pan reports what the finger is
 * doing; the menu renders it.
 *
 * Everything here is plain React state rather than shared values. Focus only
 * changes when the finger crosses an item boundary — a handful of times per drag,
 * each of which fires a haptic on the JS thread anyway — so there is nothing to
 * win by keeping it on the UI thread, and a great deal of plumbing to lose.
 */
export function useChipMenu({ onSelect, onAnalyze, onDelete }: Actions) {
  const [target, setTarget] = useState<ChipMenuTarget | null>(null);
  const [latched, setLatched] = useState(false);
  const [focused, setFocused] = useState(-1);

  function close() {
    setTarget(null);
    setLatched(false);
    setFocused(-1);
  }

  /**
   * Open on a chip, or — when it is the chip already showing a menu — just take
   * the fresh anchor. A second touch on a menu that is already up is the start of
   * a drag into it, not a new opening, so it must not re-announce itself.
   */
  function open(id: string, anchor: Rect) {
    const reopening = target?.id === id;
    setTarget({ id, anchor });
    if (reopening) return;

    setLatched(false);
    setFocused(-1);
    haptics.medium();
  }

  function focus(index: number) {
    setFocused(index);
    if (index >= 0) haptics.selection();
  }

  function activate(index: number) {
    const id = target?.id;
    close();
    if (id === undefined) return;

    const item = CHIP_MENU_ACTIONS[index];
    if (!item) return;

    if (item === 'delete') {
      haptics.warning();
      onDelete(id);
      return;
    }

    haptics.light();
    if (item === 'select') onSelect(id);
    else onAnalyze(id);
  }

  /**
   * The finger has come off the chip without committing to a reorder. Landing on
   * an item fires it; landing nowhere leaves the menu up so it can be worked with
   * a second touch — unless it was already up, in which case coming off it with
   * nothing chosen is how you put it away.
   */
  function release(index: number, wasLatched: boolean) {
    if (index >= 0) {
      activate(index);
      return;
    }
    if (wasLatched) {
      close();
      return;
    }
    setLatched(true);
    setFocused(-1);
  }

  return { target, latched, focused, open, focus, release, activate, close };
}

/** Matches the order of `CHIP_MENU_ITEMS` in ChipMenu. */
const CHIP_MENU_ACTIONS = ['select', 'analyze', 'delete'] as const;
