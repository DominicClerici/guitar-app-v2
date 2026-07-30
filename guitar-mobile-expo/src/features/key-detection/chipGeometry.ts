/**
 * Geometry for the chip row and the menu that hangs off a held chip. Every
 * function here runs on the UI thread inside the row's pan, and `menuFrame` also
 * runs on the JS thread to lay the menu out — one source of truth for where the
 * card sits, so what the finger is tested against is exactly what was drawn.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Band at each end of the row where a held chip starts pulling the list along. */
export const EDGE_BAND = 64;
/** Travel with the finger pinned to the very edge, in points per second. */
export const EDGE_SPEED = 1000;
/** How far into a gutter still counts as being over the neighbouring slot. */
export const HOVER_SLACK = 20;

// Menu card geometry. The card is drawn by ChipMenu and hit-tested here, so these
// numbers have to describe the same box in both places:
//   MENU_PAD  = the card's 1px border plus its 5px vertical padding
//   MENU_ITEM_H = one row's h-[44px]
//   MENU_ITEMS  = how many rows CHIP_MENU_ITEMS holds
export const MENU_W = 184;
export const MENU_ITEM_H = 44;
export const MENU_ITEMS = 3;
export const MENU_PAD = 6;
export const MENU_H = MENU_PAD * 2 + MENU_ITEM_H * MENU_ITEMS;
/** Gap between the held chip and the card below it. */
export const MENU_GAP = 8;
/** Page margin the card is clamped inside, matching the screen's px-[18px]. */
const MENU_MARGIN = 18;
/** How far outside the card still counts as being over it. */
const MENU_SLACK = 24;
/**
 * How far above the card the focus band starts. Covers the gap, so committing to
 * the menu with a short downward drag lands on the first item rather than in a
 * dead zone between the chip and the card.
 */
const MENU_LEAD = 16;

/** Dead zone before a drag out of a held chip commits to a direction. */
const INTENT_DEAD = 10;
/**
 * How wide the downward cone is: `dy > |dx| × INTENT_CONE` is a half-angle of
 * about 50° either side of straight down.
 */
const INTENT_CONE = 0.85;

export function distanceToRect(r: Rect, x: number, y: number): number {
  'worklet';
  const dx = Math.max(r.x - x, 0, x - (r.x + r.w));
  const dy = Math.max(r.y - y, 0, y - (r.y + r.h));
  return Math.sqrt(dx * dx + dy * dy);
}

/** Nearest slot to a point, or -1 if the point is further away than `slack`. */
export function slotNear(
  rects: Rect[],
  count: number,
  x: number,
  y: number,
  slack: number,
): number {
  'worklet';
  let nearest = -1;
  let best = Infinity;

  for (let i = 0; i < count; i += 1) {
    const r = rects[i];
    if (!r) continue;
    const d = distanceToRect(r, x, y);
    if (d < best) {
      best = d;
      nearest = i;
    }
  }

  return best <= slack ? nearest : -1;
}

/**
 * How hard the row is being pulled at `x`, from -1 (hard left) to 1 (hard right),
 * and 0 anywhere in the middle. Squared at the call site so the pull comes on
 * gently at the edge of the band and only runs away in the last few points.
 */
export function edgePull(x: number, width: number): number {
  'worklet';
  if (x < EDGE_BAND) return Math.max(-1, (x - EDGE_BAND) / EDGE_BAND);
  if (x > width - EDGE_BAND) return Math.min(1, (x - (width - EDGE_BAND)) / EDGE_BAND);
  return 0;
}

export type DragIntent = 'none' | 'menu' | 'reorder';

/**
 * What a drag out of a held chip is asking for. Down into the menu is a cone
 * rather than a half-plane: anything shallower than about 50° off vertical reads
 * as pulling the chip out of the row, which is what makes sideways-and-slightly-
 * down — the natural shape of a reorder — land on reorder rather than the menu.
 */
export function dragIntent(dx: number, dy: number): DragIntent {
  'worklet';
  if (dx * dx + dy * dy < INTENT_DEAD * INTENT_DEAD) return 'none';
  return dy > 0 && dy > Math.abs(dx) * INTENT_CONE ? 'menu' : 'reorder';
}

/**
 * Where the menu card sits for a chip at `anchor`, in window coordinates. Always
 * below the chip — the downward drag is the whole interaction, so a card that
 * flipped above would invert it. When there is not enough room it slides up to
 * fit instead, never past the chip's own bottom edge.
 */
export function menuFrame(
  anchor: Rect,
  screenW: number,
  screenH: number,
  safeBottom: number,
): Rect {
  'worklet';
  const rightmost = Math.max(MENU_MARGIN, screenW - MENU_MARGIN - MENU_W);
  const x = Math.min(Math.max(anchor.x, MENU_MARGIN), rightmost);

  const below = anchor.y + anchor.h + MENU_GAP;
  const lowest = screenH - safeBottom - MENU_MARGIN - MENU_H;
  const y = Math.max(anchor.y + anchor.h + 2, Math.min(below, lowest));

  return { x, y, w: MENU_W, h: MENU_H };
}

/** Which menu item the finger is over, or -1 for none. */
export function menuItemAt(
  anchor: Rect,
  x: number,
  y: number,
  screenW: number,
  screenH: number,
  safeBottom: number,
): number {
  'worklet';
  const f = menuFrame(anchor, screenW, screenH, safeBottom);
  if (x < f.x - MENU_SLACK || x > f.x + f.w + MENU_SLACK) return -1;

  const local = y - (f.y + MENU_PAD);
  const span = MENU_ITEM_H * MENU_ITEMS;
  if (local < -MENU_LEAD || local > span + MENU_SLACK) return -1;

  return Math.min(MENU_ITEMS - 1, Math.floor(Math.max(0, local) / MENU_ITEM_H));
}
