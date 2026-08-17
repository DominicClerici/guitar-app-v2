/**
 * Where a sliding pill sits: how the run is divided between the options, and
 * where the pill lands given where it is being taken. Kept apart from the
 * component because it is the part with the arithmetic in it — and because every
 * one of these runs inside a worklet, where a mistake shows up as a shape that
 * drifts rather than as a stack trace.
 */

/** One option's share of the run. */
export interface Slot {
  /** Offset from the start of the run to the slot's leading edge. */
  left: number;
  width: number;
}

export interface PillFrame {
  /** Offset from the start of the run to the pill's leading edge. */
  left: number;
  width: number;
  height: number;
}

export interface PillSlide {
  /** Where the pill's centre wants to be, before the walls are taken into account. */
  centre: number;
  width: number;
  height: number;
  /** The run the pill's edges have to stay inside. */
  from: number;
  to: number;
  /** Overshoot that squeezes the pill halfway to its limit. */
  travel: number;
  /** Fraction of its width a fully pressed pill gives up. */
  squeezeX: number;
  /** Fraction of its height a fully pressed pill gains. */
  squeezeY: number;
}

/**
 * `available` divided between options that each asked for a width. Equal shares
 * are the answer whenever they are wide enough: a row of options that all fit
 * should look like a row of equal options, and each is then as big a target as
 * every other.
 *
 * An option too wide for an equal share is given exactly what it asked for
 * instead, and the rest divide what is left equally — so one long label costs
 * every other option the same amount rather than costing its neighbours alone.
 * Where even that cannot be paid — every option wanting more than its share —
 * they all give up the same fraction of what they asked for, which at least
 * fills the run exactly once instead of overflowing it.
 */
export function shareOut(wants: number[], available: number): number[] {
  'worklet';
  const count = wants.length;
  if (count === 0) return [];

  const equal = available / count;
  let taken = 0;
  let sharing = 0;
  for (let i = 0; i < count; i++) {
    if (wants[i] > equal) taken += wants[i];
    else sharing += 1;
  }

  const left = available - taken;
  if (sharing > 0 && left >= 0) {
    const share = left / sharing;
    return wants.map((want) => (want > equal ? want : share));
  }

  let total = 0;
  for (let i = 0; i < count; i++) total += wants[i];
  if (total <= 0) return wants.map(() => equal);
  return wants.map((want) => (available * want) / total);
}

/** The options laid out end to end along the run, starting at `from`. */
export function slotsIn(wants: number[], available: number, from: number): Slot[] {
  'worklet';
  const widths = shareOut(wants, available);
  const slots: Slot[] = [];
  let left = from;
  for (let i = 0; i < widths.length; i++) {
    slots.push({ left, width: widths[i] });
    left += widths[i];
  }
  return slots;
}

/** The centre of a slot, which is where a pill filling it sits. */
export function centreOf(slot: Slot): number {
  'worklet';
  return slot.left + slot.width / 2;
}

/** Which slot the point `x` is over — the nearer end, past either end. */
export function slotAt(x: number, slots: Slot[]): number {
  'worklet';
  for (let i = 0; i < slots.length - 1; i++) {
    if (x < slots[i].left + slots[i].width) return i;
  }
  return Math.max(0, slots.length - 1);
}

/**
 * How hard the pill is pressed against a wall, 0…1, for `over` points of
 * overshoot past it. Asymptotic rather than clamped: resistance builds and never
 * quite arrives, so there is no distance at which the pill stops answering the
 * finger and the drag goes dead.
 */
export function squeezeAt(over: number, travel: number): number {
  'worklet';
  const past = Math.max(0, over);
  if (travel <= 0) return past > 0 ? 1 : 0;
  return past / (past + travel);
}

/**
 * The pill's box. Anything past either end of the run is spent squeezing rather
 * than travelling: the pill stays against the wall, loses width and gains
 * height, and keeps the edge it is pressing on exactly where the wall is — so it
 * reads as being pushed up against something rather than as leaving the tray.
 */
export function pillFrame(slide: PillSlide): PillFrame {
  'worklet';
  const half = slide.width / 2;
  const low = slide.from + half;
  const high = slide.to - half;

  // A run no wider than the pill has nowhere to travel and no wall to press on.
  if (high <= low) {
    return {
      left: (slide.from + slide.to) / 2 - half,
      width: slide.width,
      height: slide.height,
    };
  }

  const centre = Math.max(low, Math.min(high, slide.centre));
  const past = slide.centre < low ? low - slide.centre : Math.max(0, slide.centre - high);
  const squeeze = squeezeAt(past, slide.travel);

  const width = slide.width * (1 - slide.squeezeX * squeeze);
  // The width it gave up comes off the free side, which is what pins the pressed
  // edge to the wall.
  const lost = slide.width - width;

  return {
    left: centre - half + (slide.centre > high ? lost : 0),
    width,
    height: slide.height * (1 + slide.squeezeY * squeeze),
  };
}
