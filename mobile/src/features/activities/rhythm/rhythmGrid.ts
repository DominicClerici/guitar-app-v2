import type { RhythmSlot } from '@/lib/content';

/**
 * A written rhythm, expanded into the two things the rest of the drill needs: where every
 * slot falls in time, and where every click falls in time.
 *
 * One time origin serves both — millisecond zero is the pattern's downbeat, the first slot
 * of the first bar. The count-in therefore lives at negative offsets rather than in a second
 * coordinate system, which is what lets the runner hand a single anchor epoch to the grader
 * and to the playhead and have them agree.
 *
 * Offsets are `index * slotMs` against that fixed zero rather than a running sum, so a grid
 * cannot accumulate rounding error across sixteen bars of sixteenths.
 */

/** Bars of click before the pattern when the round does not say. */
export const DEFAULT_COUNT_IN_BARS = 1;

export interface GridSlot {
  index: number;
  kind: RhythmSlot;
  /** Accents count as hits — the drill grades when a string was picked, not how hard. */
  expectsHit: boolean;
  /** Milliseconds from the downbeat. */
  atMs: number;
  /** Zero-based bar this slot belongs to. */
  bar: number;
  /** Zero-based beat within its bar. */
  beat: number;
  /** Zero-based subdivision within its beat. */
  sub: number;
}

export interface ClickBeat {
  /** Milliseconds from the downbeat. Negative through the count-in. */
  atMs: number;
  /** The bar's first beat, sounded harder so the meter is audible. */
  accent: boolean;
}

export interface RhythmGrid {
  slots: GridSlot[];
  /**
   * The click, beat by beat. It is a steady pacer rather than the pattern: sounding the
   * written rhythm would play the exercise for the learner.
   */
  clicks: ClickBeat[];
  slotMs: number;
  beatMs: number;
  barMs: number;
  slotsPerBar: number;
  beatsPerBar: number;
  subdivision: number;
  bars: number;
  countInBars: number;
  /** Milliseconds of click before the downbeat. */
  countInMs: number;
  /** Milliseconds from the downbeat to the end of the last bar. */
  patternMs: number;
}

/**
 * What building a grid needs, structurally rather than by name, so the pure core and its
 * tests never have to reach through the content parser to describe a rhythm.
 * `RhythmRound` satisfies it.
 */
export interface GridSpec {
  bpm: number;
  beatsPerBar: number;
  subdivision: number;
  bars: number;
  slots: readonly RhythmSlot[];
  countInBars?: number;
}

/** Remainder that stays non-negative, so a count-in beat still knows where the bar line is. */
function wrap(value: number, size: number): number {
  return ((value % size) + size) % size;
}

export function buildGrid(spec: GridSpec): RhythmGrid {
  const beatMs = 60000 / spec.bpm;
  const slotMs = beatMs / spec.subdivision;
  const slotsPerBar = spec.beatsPerBar * spec.subdivision;
  const barMs = beatMs * spec.beatsPerBar;
  const countInBars = spec.countInBars ?? DEFAULT_COUNT_IN_BARS;

  const slots = spec.slots.map((kind, index) => ({
    index,
    kind,
    expectsHit: kind !== 'rest',
    atMs: index * slotMs,
    bar: Math.floor(index / slotsPerBar),
    beat: Math.floor((index % slotsPerBar) / spec.subdivision),
    sub: index % spec.subdivision,
  }));

  const countInBeats = countInBars * spec.beatsPerBar;
  // One past the last bar: without the downbeat that closes it, the final slot has no beat
  // after it to be heard against, and a hit written there has nothing to land on.
  const totalBeats = countInBeats + spec.bars * spec.beatsPerBar;

  const clicks: ClickBeat[] = [];
  for (let index = 0; index <= totalBeats; index += 1) {
    const beat = index - countInBeats;
    clicks.push({ atMs: beat * beatMs, accent: wrap(beat, spec.beatsPerBar) === 0 });
  }

  return {
    slots,
    clicks,
    slotMs,
    beatMs,
    barMs,
    slotsPerBar,
    beatsPerBar: spec.beatsPerBar,
    subdivision: spec.subdivision,
    bars: spec.bars,
    countInBars,
    countInMs: countInBars * barMs,
    // From the slots rather than from `bars`, so a grid built from a hand-written spec
    // describes the slots it actually holds.
    patternMs: spec.slots.length * slotMs,
  };
}

/**
 * The bars of a grid as slot runs, for drawing. A bar is the unit a rhythm is read in, and
 * sixteen bars of sixteenths will not fit across a phone in one line.
 */
export function barsOf(grid: RhythmGrid): GridSlot[][] {
  const rows: GridSlot[][] = [];
  for (const slot of grid.slots) {
    (rows[slot.bar] ??= []).push(slot);
  }
  return rows;
}

const SLOT_WORD: Record<RhythmSlot, string> = {
  hit: 'play',
  accent: 'play hard',
  rest: 'rest',
};

/**
 * The pattern read aloud. The grid is a field of small circles, which VoiceOver has nothing
 * to say about, so the whole thing carries one label describing what to play instead.
 */
export function describePattern(grid: RhythmGrid): string {
  const bars = barsOf(grid).map(
    (row, index) => `Bar ${index + 1}: ${row.map((slot) => SLOT_WORD[slot.kind]).join(', ')}`,
  );
  return `${grid.bars} bar${grid.bars === 1 ? '' : 's'} at ${Math.round(60000 / grid.beatMs)} beats per minute. ${bars.join('. ')}.`;
}
