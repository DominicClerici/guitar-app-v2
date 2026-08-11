// The five CAGED forms as concrete places on a neck.
//
// `windows.ts` carves a *scale* into CAGED boxes and is what the scale visualizer
// pages through. This asks the same five windows a narrower question — "where does
// the C form of an A chord actually sit, and what is inside it" — which is what a
// lesson diagram needs and what the paged position list cannot answer: that list
// stretches its end boxes to own the ends of the neck, which is right for playing
// and wrong for teaching a shape.
//
// The offsets live here rather than in `windows.ts` so there is one table, read by
// both. String indices are @/lib/theory's throughout: 0 = high e, 5 = low E.

import { FRET_COUNT, OPEN_PITCHES, pitchClassAt, STRING_COUNT } from '@/lib/theory';

export const CAGED_FORMS = ['C', 'A', 'G', 'E', 'D'] as const;

export type CagedForm = (typeof CAGED_FORMS)[number];

export interface FormOffsets {
  form: CagedForm;
  /** Fret offsets from the root's position on the low E string, inclusive. */
  from: number;
  to: number;
}

/**
 * In ascending offset order, which is the order `windows.ts` iterates them in —
 * it dedupes by span, so the order decides which form claims a span two of them
 * clamp onto.
 */
export const CAGED_FORM_OFFSETS: readonly FormOffsets[] = [
  { form: 'E', from: -1, to: 3 },
  { form: 'D', from: 1, to: 5 },
  { form: 'C', from: 4, to: 8 },
  { form: 'A', from: 6, to: 10 },
  { form: 'G', from: 8, to: 12 },
];

/** Narrowest a clamped window may be before it stops being a shape — `windows.ts`'s rule. */
const MIN_SPAN = 3;

export interface CagedWindow {
  form: CagedForm;
  /** Lowest and highest fret the form occupies, inclusive. */
  from: number;
  to: number;
}

/** Fret at which the root sits on the low E string, 0–11. */
function baseFret(rootPitchClass: number): number {
  return (((rootPitchClass - OPEN_PITCHES[5]) % 12) + 12) % 12;
}

/**
 * Where each of the five forms sits for this root, in neck order.
 *
 * A form is taken at its lowest occurrence that fits — the octave above is the
 * same shape and a lesson wants the one nearest the nut. `from` clamps at the nut
 * rather than disqualifying the window, because a form reaching a fret below the
 * barre simply starts at the nut when the barre is the nut: that is what makes A
 * major's A form the open chord instead of the barre at fret 12.
 */
export function cagedFormWindows(rootPitchClass: number): CagedWindow[] {
  const base = baseFret(rootPitchClass);
  const found: CagedWindow[] = [];

  for (const offsets of CAGED_FORM_OFFSETS) {
    for (const anchor of [base - 12, base, base + 12]) {
      const from = Math.max(0, anchor + offsets.from);
      const to = anchor + offsets.to;
      if (to > FRET_COUNT || to - from + 1 < MIN_SPAN) continue;

      found.push({ form: offsets.form, from, to });
      break;
    }
  }

  return found.sort((a, b) => a.from - b.from);
}

export function cagedFormWindow(
  rootPitchClass: number,
  form: CagedForm,
): CagedWindow | undefined {
  return cagedFormWindows(rootPitchClass).find((window) => window.form === form);
}

/**
 * How much of the chord a diagram shows. The four nest — each adds notes to the
 * window the one before it drew, which is the spine of the CAGED pathway.
 */
export type CagedLayer = 'roots' | 'triad' | 'pentatonic' | 'scale';

const LAYER_SEMITONES: Record<CagedLayer, readonly number[]> = {
  roots: [0],
  triad: [0, 4, 7],
  pentatonic: [0, 2, 4, 7, 9],
  scale: [0, 2, 4, 5, 7, 9, 11],
};

/** Major-scale degree names, by semitones above the root. */
const DEGREE_BY_SEMITONE: Record<number, string> = {
  0: '1',
  2: '2',
  4: '3',
  5: '4',
  7: '5',
  9: '6',
  11: '7',
};

export interface CagedMark {
  /** 0 = high e … 5 = low E. */
  string: number;
  fret: number;
  /** '1', '3', '5' … — what the dot says. */
  degree: string;
  isRoot: boolean;
}

/**
 * Every position inside a window belonging to a layer, in reading order (high e
 * first, then up the neck).
 *
 * This is deliberately "everything in the window", not one playable voicing: the
 * point of a CAGED diagram is the shape the window holds, and which of those notes
 * a hand can reach at once is a different question that `/chord-shapes` answers.
 */
export function cagedMarks(
  rootPitchClass: number,
  window: CagedWindow,
  layer: CagedLayer,
): CagedMark[] {
  const wanted = new Set(LAYER_SEMITONES[layer]);
  const marks: CagedMark[] = [];

  for (let string = 0; string < STRING_COUNT; string += 1) {
    for (let fret = window.from; fret <= window.to; fret += 1) {
      const semitones = (((pitchClassAt(string, fret) - rootPitchClass) % 12) + 12) % 12;
      if (!wanted.has(semitones)) continue;

      marks.push({
        string,
        fret,
        degree: DEGREE_BY_SEMITONE[semitones],
        isRoot: semitones === 0,
      });
    }
  }

  return marks;
}
