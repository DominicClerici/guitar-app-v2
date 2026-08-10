// Maps a Variation into the fixed ChordTones slot grid the UI renders:
// three rows (triad / seventh / extensions), each slot holding the spelled
// note when that interval is present, or null when it isn't.

import { noteToSemitone, notesFlat, notesSharp } from '../theory';
import type { ChordTones, IntervalSlot, Variation } from './types';

const TRIAD_SLOTS = ['sus2', 'm3', '3', 'sus4', 'b5', '5', '#5'] as const;
const SEVENTH_SLOTS = ['b6', 'dim7', '6', '7', 'maj7'] as const;
const EXTENSION_SLOTS = ['b9', '#9', '9', '#11', '11', 'b13', '13'] as const;

const ALTERED_INTERVALS = new Set<string>(['b5', '#5', 'b9', '#9', '#11', 'b13']);

const INTERVAL_TO_PC: Record<string, number> = {
  '1': 0,
  b9: 1,
  b2: 1,
  '9': 2,
  '2': 2,
  sus2: 2,
  m3: 3,
  '#9': 3,
  '3': 4,
  sus4: 5,
  '11': 5,
  '4': 5,
  b5: 6,
  '#11': 6,
  '5': 7,
  '#5': 8,
  b13: 8,
  b6: 8,
  '6': 9,
  '13': 9,
  dim7: 9,
  '7': 10,
  maj7: 11,
};

// The grid with nothing in it. A UI that draws the slots as a fixed panel needs
// the same rows in the same order before there is a chord to fill them, and this
// keeps the slot tables above the single source of that order.
export const EMPTY_CHORD_TONES: ChordTones = {
  root: '',
  bass: null,
  triad: TRIAD_SLOTS.map(emptySlot),
  seventh: SEVENTH_SLOTS.map(emptySlot),
  extensions: EXTENSION_SLOTS.map(emptySlot),
};

function emptySlot(interval: string): IntervalSlot {
  return { interval, note: null, altered: ALTERED_INTERVALS.has(interval) };
}

function pickRootSpelling(v: Variation): string {
  return v.autoRootMode === 'sharp' ? v.rootToneSharp : v.rootToneFlat;
}

// Look up the per-spot spelled note for an interval label that the variation
// actually played. Falls back to the chromatic table if the label is missing
// from `intervals` (defensive — should not happen when the slot is active).
function spelledNoteForInterval(v: Variation, interval: string, pc: number): string {
  const spelled = v.autoRootMode === 'sharp' ? v.notesSharpRoot : v.notesFlatRoot;
  const idx = v.intervals.indexOf(interval);
  if (idx >= 0 && spelled[idx]) return spelled[idx];
  return v.autoRootMode === 'sharp' ? notesSharp[pc] : notesFlat[pc];
}

function slotIsActive(slot: string, v: Variation): boolean {
  const pc = INTERVAL_TO_PC[slot];
  if (pc === undefined) return false;
  if (v.intervalNames[pc] !== slot) return false;
  return v.uniqueIntervals.includes(slot);
}

function makeSlot(slot: string, v: Variation): IntervalSlot {
  const active = slotIsActive(slot, v);
  return {
    interval: slot,
    note: active ? spelledNoteForInterval(v, slot, INTERVAL_TO_PC[slot]) : null,
    altered: ALTERED_INTERVALS.has(slot),
  };
}

export function buildChordTones(primary: Variation, bassPitchClass: number): ChordTones {
  const root = pickRootSpelling(primary);
  const rootPc = noteToSemitone(root);

  const bass =
    bassPitchClass === rootPc
      ? null
      : primary.autoRootMode === 'sharp'
        ? notesSharp[bassPitchClass]
        : notesFlat[bassPitchClass];

  return {
    root,
    bass,
    triad: TRIAD_SLOTS.map((s) => makeSlot(s, primary)),
    seventh: SEVENTH_SLOTS.map((s) => makeSlot(s, primary)),
    extensions: EXTENSION_SLOTS.map((s) => makeSlot(s, primary)),
  };
}
