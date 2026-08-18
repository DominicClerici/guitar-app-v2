/**
 * The geometry of the circle a change of appearance opens up.
 *
 * Kept apart from the screen that draws it because it is the one part of the switch that can be
 * decided rather than watched: everything else is a photograph, a native capture and half a second
 * of compositing, none of which a test can hold.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/**
 * How far the circle has to travel from `origin` before the screen is entirely inside it.
 *
 * The furthest corner, which is the far one on both axes — from a control low on the right of a
 * settings screen that is the top left, and from a point near the middle it is barely more than
 * half the diagonal. Measuring to the *nearest* edge instead is the mistake worth naming: the
 * circle would finish while three corners were still showing the palette the user just left.
 */
export function revealRadius(origin: Point, screen: Size): number {
  const across = Math.max(origin.x, screen.width - origin.x);
  const down = Math.max(origin.y, screen.height - origin.y);

  return Math.hypot(across, down);
}
