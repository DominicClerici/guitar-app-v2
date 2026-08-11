// Boxes defined as a fret window, then filled with whatever the scale actually
// puts inside it.
//
// This is the only tabulated data in the module, and it is small on purpose: five
// windows, written as offsets from the fret where the root sits on the low E
// string. Everything else — which notes are in a box, how many boxes a neck has
// room for — is derived. The offsets are what to change if a box feels a fret out.
//
// The windows repeat every octave, so the anchors are tried a fret-twelve below
// and above as well. That is what turns five shapes into a ladder covering the
// whole neck, which is how a player actually moves: C form at the nut, A form at
// 3, G form at 5, E form at 8, D form at 10.

import { FRET_COUNT, OPEN_PITCHES } from '@/lib/theory';

import { CAGED_FORM_OFFSETS } from './caged';
import { scaleKeysInSpan } from './neck';
import type { Position } from './types';

interface Window {
  name: string;
  /** Fret offsets from the root's position on the low E string, inclusive. */
  from: number;
  to: number;
}

// The offsets themselves live in `caged.ts`, which reads them to answer "where is
// this chord's C form" for an article diagram. One table, two questions.
const CAGED_WINDOWS: readonly Window[] = CAGED_FORM_OFFSETS.map(({ form, from, to }) => ({
  name: `${form} form`,
  from,
  to,
}));

const PENTATONIC_WINDOWS: readonly Window[] = [
  { name: 'Box 1', from: 0, to: 3 },
  { name: 'Box 2', from: 3, to: 5 },
  { name: 'Box 3', from: 5, to: 7 },
  { name: 'Box 4', from: 7, to: 10 },
  { name: 'Box 5', from: 10, to: 12 },
];

/** Narrowest a clamped window may be before it stops being a shape. */
const MIN_SPAN = 3;
/** Fewest notes a box has to hold to be worth paging to. */
const MIN_NOTES = 5;

function windowPositions(
  windows: readonly Window[],
  rootPitchClass: number,
  pitchClasses: readonly number[],
): Position[] {
  const base = (((rootPitchClass - OPEN_PITCHES[5]) % 12) + 12) % 12;

  const found: Position[] = [];
  const seen = new Set<string>();

  for (const anchor of [base - 12, base, base + 12]) {
    for (const window of windows) {
      const from = Math.max(0, anchor + window.from);
      const to = Math.min(FRET_COUNT, anchor + window.to);
      if (to - from + 1 < MIN_SPAN) continue;

      const span = `${from}-${to}`;
      if (seen.has(span)) continue;

      const keys = scaleKeysInSpan(pitchClasses, from, to);
      if (keys.size < MIN_NOTES) continue;

      seen.add(span);
      found.push({ id: `${window.name}-${from}`, label: window.name, from, to, keys });
    }
  }

  found.sort((a, b) => a.from - b.from);

  // The windows only line up with the neck where the root happens to put them, so
  // the ladder can start a fret or two above the nut and leave open strings in no
  // box at all. The boxes at either end therefore own the neck's ends — which is
  // what a player does anyway, reaching back to an open string rather than
  // treating it as outside the shape.
  const first = found[0];
  const last = found[found.length - 1];
  if (first) stretch(first, 0, first.to, pitchClasses);
  if (last) stretch(last, last.from, FRET_COUNT, pitchClasses);

  return found;
}

function stretch(position: Position, from: number, to: number, pitchClasses: readonly number[]) {
  if (from === position.from && to === position.to) return;
  position.from = from;
  position.to = to;
  position.keys = scaleKeysInSpan(pitchClasses, from, to);
}

export function cagedPositions(
  rootPitchClass: number,
  pitchClasses: readonly number[],
): Position[] {
  return windowPositions(CAGED_WINDOWS, rootPitchClass, pitchClasses);
}

export function boxPositions(rootPitchClass: number, pitchClasses: readonly number[]): Position[] {
  return windowPositions(PENTATONIC_WINDOWS, rootPitchClass, pitchClasses);
}
