/**
 * The geometry of the shape a change of appearance opens up.
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

export interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * How far past the screen the finished hole has to reach for its soft edge to be off the screen.
 *
 * A blurred edge is not an edge but a band, and it eats inward as far as it spreads outward — about
 * two sigma each way. So the shape has to finish beyond the screen, and it is the corners that
 * decide by how much: a rounded corner's arc cuts the diagonal, leaving the screen's own square
 * corner only `corner − √2(corner − bleed)` inside the outline where a straight edge would leave it
 * the whole `bleed`. Setting that depth to two sigma and solving for the bleed is the second term.
 *
 * The first is what a straight edge needs on its own, and it wins wherever the rounding is slight
 * enough that no corner ever cuts as deep as the blur does — below which the arc has stopped being
 * the thing that decides and taking it as the answer would leave the sides still fading.
 *
 * Which between them answer the question the shape is actually asked: reach far enough that nothing
 * of the old screen is still fading anywhere, and not one point further.
 */
export function revealBleed(corner: number, feather: number): number {
  return Math.max(2 * feather, corner - (corner - 2 * feather) / Math.SQRT2);
}

/**
 * The rectangle the hole fills `progress` of the way through, from a square on the press to the
 * screen with `bleed` to spare all round.
 *
 * Every edge travels on its own, and that is what lets the shape change proportion without ever
 * being stretched: a rectangle drawn to these numbers has true round corners at every moment, where
 * the same outline reached by scaling one axis would have oval ones.
 *
 * Where it stops is the point of it. A screen-shaped hole grown about the press until the furthest
 * corner fell inside would have to reach most of twice the screen across, and every bit of that
 * last stretch happens after there is anything left to uncover — the shape carries on travelling
 * where nobody can see it, and the animation spends its final stretch finishing nothing. Ending on
 * the screen instead means the last thing anyone watches is the edge leaving.
 */
export function revealFrame(
  origin: Point,
  screen: Size,
  seed: number,
  bleed: number,
  progress: number,
): Frame {
  'worklet';

  const held = 1 - progress;

  const left = (origin.x - seed / 2) * held - bleed * progress;
  const top = (origin.y - seed / 2) * held - bleed * progress;
  const right = (origin.x + seed / 2) * held + (screen.width + bleed) * progress;
  const bottom = (origin.y + seed / 2) * held + (screen.height + bleed) * progress;

  return { x: left, y: top, width: right - left, height: bottom - top };
}
