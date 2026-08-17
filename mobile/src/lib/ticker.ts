/**
 * The arithmetic behind a `Ticker` — where a value lands when it is stepped, and
 * what a typed one comes out as. Kept apart from the component because a range
 * with a fractional step is where a stepper goes wrong, and a wrong number is
 * something you have to read off the screen to notice.
 */

export interface Range {
  min: number;
  max: number;
  step: number;
}

export function clampTo(value: number, { min, max }: Range): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * `delta` steps along, held inside the range. A value already off the grid —
 * which is what typing one leaves you with — moves by the same amount rather
 * than being pulled onto it: the key says how far, and answering with a
 * different distance because of where you started reads as a missed press.
 */
export function stepTo(value: number, delta: number, range: Range): number {
  return clampTo(tidy(value + delta * range.step, range.step), range);
}

/**
 * What was typed, clamped into the range, or `null` for anything that is not a
 * number — which is the field's cue to go back to the value it had.
 *
 * Not snapped to the step: the keys are the way onto the grid, and a typed 43
 * that answered 45 would look like the field had ignored you.
 */
export function parseTyped(text: string, range: Range): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;

  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;

  return clampTo(value, range);
}

/**
 * Rounded to as many decimals as the step itself has, so a run of fractional
 * steps reads as the numbers it passed through rather than as float drift —
 * 0.2 and 0.1 make 0.30000000000000004, and the ticker would show all of it.
 */
function tidy(value: number, step: number): number {
  const text = String(step);
  // An exponent means a step far finer than anything a ticker is read at;
  // rounding on the digits of `1e-7` would land on a whole number.
  if (text.includes('e')) return value;

  const point = text.indexOf('.');
  if (point === -1) return value;

  const decimals = text.length - point - 1;
  return Number(value.toFixed(decimals));
}
