import type { RhythmSlot } from '@/lib/content';

/**
 * Composing a rhythm out of the note values you asked for.
 *
 * The grid the rest of the drill runs on is uniform — every slot is the same length — so a note
 * value is not a slot but a RUN of them: a half note at an eighth-note grid is a hit followed by
 * three empty slots. That is also why the subdivision is derived rather than chosen. It is the
 * lowest common denominator of the values in play, so picking halves and quarters gives one slot
 * per beat and four dots to a bar, and only bringing in sixteenths or triplets makes the grid
 * finer. The pattern is drawn as dots, and this is what keeps that drawing legible: the grid is
 * never finer than the rhythm needs it to be.
 *
 * Pure, and takes its randomness as an argument, so what it composes for a given draw is a thing a
 * test can state exactly rather than a thing a test can only describe.
 */

export type NoteValue =
  | 'whole'
  | 'half'
  | 'dotted-quarter'
  | 'quarter'
  | 'dotted-eighth'
  | 'eighth'
  | 'triplet-eighth'
  | 'sixteenth';

/** A note value's length in beats, as an exact fraction — the denominator sets the grid. */
interface Length {
  num: number;
  den: number;
}

const LENGTHS: Record<NoteValue, Length> = {
  whole: { num: 4, den: 1 },
  half: { num: 2, den: 1 },
  'dotted-quarter': { num: 3, den: 2 },
  quarter: { num: 1, den: 1 },
  'dotted-eighth': { num: 3, den: 4 },
  eighth: { num: 1, den: 2 },
  'triplet-eighth': { num: 1, den: 3 },
  sixteenth: { num: 1, den: 4 },
};

/** Longest first, which is the order they are offered in and the order they are drawn in. */
export const NOTE_VALUES: NoteValue[] = [
  'whole',
  'half',
  'dotted-quarter',
  'quarter',
  'dotted-eighth',
  'eighth',
  'triplet-eighth',
  'sixteenth',
];

const NAMES: Record<NoteValue, string> = {
  whole: 'Whole',
  half: 'Half',
  'dotted-quarter': 'Dotted ♩',
  quarter: 'Quarter',
  'dotted-eighth': 'Dotted ♪',
  eighth: 'Eighth',
  'triplet-eighth': 'Triplet',
  sixteenth: 'Sixteenth',
};

/** Spelled out, because the chips are short and a screen reader should not read "Dotted ♩". */
const SPOKEN: Record<NoteValue, string> = {
  whole: 'Whole notes',
  half: 'Half notes',
  'dotted-quarter': 'Dotted quarter notes',
  quarter: 'Quarter notes',
  'dotted-eighth': 'Dotted eighth notes',
  eighth: 'Eighth notes',
  'triplet-eighth': 'Eighth-note triplets',
  sixteenth: 'Sixteenth notes',
};

export function nameOf(value: NoteValue): string {
  return NAMES[value];
}

export function spokenNameOf(value: NoteValue): string {
  return SPOKEN[value];
}

/** How likely a run is spent on silence rather than a hit, when rests are in play. */
export const REST_CHANCE = 0.25;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Slots per beat: fine enough for every value in play to be a whole number of them, and no finer.
 * Empty selections answer 1 rather than throwing — the caller has a bar to fill either way, and it
 * fills it with rests.
 */
export function subdivisionFor(values: readonly NoteValue[]): number {
  let subdivision = 1;
  for (const value of values) {
    const den = LENGTHS[value].den;
    subdivision = (subdivision * den) / gcd(subdivision, den);
  }
  return subdivision;
}

/** A value's length in slots at a given subdivision. Whole by construction of `subdivisionFor`. */
export function slotsFor(value: NoteValue, subdivision: number): number {
  const { num, den } = LENGTHS[value];
  return (num * subdivision) / den;
}

export interface GenerateSpec {
  /** The values that may appear. An empty set produces a bar of rests. */
  values: readonly NoteValue[];
  /** Whether a run may be spent on silence instead of a hit. */
  rests: boolean;
  beatsPerBar: number;
  bars: number;
}

export interface GeneratedPattern {
  slots: RhythmSlot[];
  subdivision: number;
}

/** `Math.random`'s shape, so a test can hand over a sequence it wrote itself. */
export type Rng = () => number;

/**
 * A draw that depends only on its seed.
 *
 * Seeded rather than random because a pattern has to be a function of the settings that asked for
 * it: it is derived during a render, and a render that reached for `Math.random` would compose a
 * different rhythm every time React looked at the screen. So the shuffle button counts, and the
 * count is the seed. (mulberry32 — small, fast, and far better distributed than it needs to be for
 * choosing between eight note values.)
 */
export function seededRng(seed: number): Rng {
  let state = (seed + 0x9e3779b9) >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One bar, filled left to right.
 *
 * Values are drawn only from those that still fit the space left, which is what stops a bar
 * overrunning its own length — and when nothing fits, the remainder becomes rests rather than an
 * error. That case is real: three beats to a bar with only half notes in play leaves one beat
 * over, and a bar that is 2 + 1 silent is a truthful answer to what was asked for.
 */
function generateBar(
  values: readonly NoteValue[],
  subdivision: number,
  beatsPerBar: number,
  rests: boolean,
  rng: Rng,
  /** The very first hit of a pattern, which is never allowed to be silence. */
  forceOpeningHit: boolean,
): RhythmSlot[] {
  const total = beatsPerBar * subdivision;
  const slots: RhythmSlot[] = [];

  while (slots.length < total) {
    const room = total - slots.length;
    const fits = values.filter((value) => slotsFor(value, subdivision) <= room);

    if (fits.length === 0) {
      while (slots.length < total) slots.push('rest');
      break;
    }

    const value = fits[Math.min(fits.length - 1, Math.floor(rng() * fits.length))];
    const length = slotsFor(value, subdivision);
    const opening = forceOpeningHit && slots.length === 0;
    const silent = rests && !opening && rng() < REST_CHANCE;

    slots.push(silent ? 'rest' : 'hit');
    for (let i = 1; i < length; i += 1) slots.push('rest');
  }

  return slots;
}

/**
 * A whole pattern, with the downbeat of each bar accented where a hit falls on it.
 *
 * The accent is placed here rather than left to the generator's draw because it is not part of the
 * rhythm being asked for — it is how the drill makes the bar line audible and visible, the same
 * job the click's accent does.
 */
export function generatePattern(spec: GenerateSpec, rng: Rng): GeneratedPattern {
  const subdivision = subdivisionFor(spec.values);
  const slotsPerBar = spec.beatsPerBar * subdivision;
  const slots: RhythmSlot[] = [];

  for (let bar = 0; bar < spec.bars; bar += 1) {
    slots.push(
      ...generateBar(spec.values, subdivision, spec.beatsPerBar, spec.rests, rng, bar === 0),
    );
  }

  for (let bar = 0; bar < spec.bars; bar += 1) {
    const downbeat = bar * slotsPerBar;
    if (slots[downbeat] === 'hit') slots[downbeat] = 'accent';
  }

  return { slots, subdivision };
}

/** What a pattern is made of, for the line under the tempo. */
export function describeValues(values: readonly NoteValue[]): string {
  if (values.length === 0) return 'no note values';

  const ordered = NOTE_VALUES.filter((value) => values.includes(value)).map((value) =>
    NAMES[value].toLowerCase(),
  );

  if (ordered.length === 1) return ordered[0];
  return `${ordered.slice(0, -1).join(', ')} and ${ordered[ordered.length - 1]}`;
}
