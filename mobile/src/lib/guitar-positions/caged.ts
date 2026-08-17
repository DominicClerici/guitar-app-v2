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
 * The five windows packed into rows, none of which holds two that overlap.
 *
 * Drawing the ladder means drawing five bands over one fret axis, and neighbouring
 * forms share frets by design — that overlap is the thing a learner has to see. So
 * each window goes in the first row whose previous band has already ended, and the
 * shared frets read as two bands stacked over one span.
 *
 * Alternating between two fixed rows is not enough, which is worth stating because
 * it looks like it should be: in C the C form (0–4) and the G form (4–8) both cover
 * fret 4 while the A form (2–6) sits between them, so three windows share a fret and
 * two rows would silently drop a band.
 */
export function cagedLadderLanes(rootPitchClass: number): CagedWindow[][] {
  const lanes: CagedWindow[][] = [];

  for (const window of cagedFormWindows(rootPitchClass)) {
    const lane = lanes.find((row) => (row[row.length - 1]?.to ?? -1) < window.from);
    if (lane) lane.push(window);
    else lanes.push([window]);
  }

  return lanes;
}

/**
 * How much of the chord a diagram shows. The four nest — each adds notes to the
 * window the one before it drew, which is the spine of the CAGED pathway.
 */
export type CagedLayer = 'roots' | 'triad' | 'pentatonic' | 'scale';

export const CAGED_QUALITIES = ['major', 'minor'] as const;

/**
 * Which family of degrees fills the window.
 *
 * The window itself does not know about quality — it is a fret span anchored on
 * the root, so A minor's five forms sit exactly where A major's do. What changes
 * is the notes marked inside them, and the layers nest for minor exactly as they
 * do for major, which is what lets one component teach both pathways.
 */
export type CagedQuality = (typeof CAGED_QUALITIES)[number];

const LAYER_SEMITONES: Record<CagedQuality, Record<CagedLayer, readonly number[]>> = {
  major: {
    roots: [0],
    triad: [0, 4, 7],
    pentatonic: [0, 2, 4, 7, 9],
    scale: [0, 2, 4, 5, 7, 9, 11],
  },
  minor: {
    roots: [0],
    triad: [0, 3, 7],
    pentatonic: [0, 3, 5, 7, 10],
    scale: [0, 2, 3, 5, 7, 8, 10],
  },
};

/** Degree names, by semitones above the root, spelled against the parent scale. */
const DEGREE_BY_SEMITONE: Record<CagedQuality, Record<number, string>> = {
  major: {
    0: '1',
    2: '2',
    4: '3',
    5: '4',
    7: '5',
    9: '6',
    11: '7',
  },
  minor: {
    0: '1',
    2: '2',
    3: 'b3',
    5: '4',
    7: '5',
    8: 'b6',
    10: 'b7',
  },
};

export interface CagedMark {
  /** 0 = high e … 5 = low E. */
  string: number;
  fret: number;
  /** '1', '3', '5' … — what the dot says. */
  degree: string;
  isRoot: boolean;
  /** The tone a scale is named for, when the fill nominated one. */
  isAccent: boolean;
}

/**
 * What fills a window, as semitones above the root and the label each one wears.
 *
 * The quality tables above are two instances of this; a scale from the catalogue
 * is any other. Keeping it a plain pair of arrays is what stops `guitar-positions`
 * having to know about `scale-library`, the same trade `windows.ts` makes when it
 * takes pitch classes rather than a `Scale`.
 */
export interface CagedFill {
  /** Semitones above the root, ascending from 0. */
  semitones: readonly number[];
  /** One label per semitone, parallel to it. */
  degrees: readonly string[];
  /** Label of the tone the scale is named for, if it has one. */
  accentDegree?: string;
}

/**
 * Every position inside a window belonging to a fill, in reading order (high e
 * first, then up the neck).
 *
 * This is deliberately "everything in the window", not one playable voicing: the
 * point of a CAGED diagram is the shape the window holds, and which of those notes
 * a hand can reach at once is a different question that `/chord-shapes` answers.
 */
export function cagedFillMarks(
  rootPitchClass: number,
  window: CagedWindow,
  fill: CagedFill,
): CagedMark[] {
  const degrees = new Map<number, string>();
  fill.semitones.forEach((semitone, index) => {
    if (!degrees.has(semitone % 12)) degrees.set(semitone % 12, fill.degrees[index]);
  });

  const marks: CagedMark[] = [];

  for (let string = 0; string < STRING_COUNT; string += 1) {
    for (let fret = window.from; fret <= window.to; fret += 1) {
      const semitones = (((pitchClassAt(string, fret) - rootPitchClass) % 12) + 12) % 12;
      const degree = degrees.get(semitones);
      if (degree === undefined) continue;

      marks.push({
        string,
        fret,
        degree,
        isRoot: semitones === 0,
        isAccent: fill.accentDegree !== undefined && degree === fill.accentDegree,
      });
    }
  }

  return marks;
}

/** The same question asked of one of the two built-in chord layers. */
export function cagedMarks(
  rootPitchClass: number,
  window: CagedWindow,
  layer: CagedLayer,
  quality: CagedQuality = 'major',
): CagedMark[] {
  const semitones = LAYER_SEMITONES[quality][layer];
  const names = DEGREE_BY_SEMITONE[quality];

  return cagedFillMarks(rootPitchClass, window, {
    semitones,
    degrees: semitones.map((semitone) => names[semitone]),
  });
}
