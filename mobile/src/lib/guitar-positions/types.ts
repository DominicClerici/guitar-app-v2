/**
 * How a neck is carved into boxes.
 *
 *   caged — five windows named after the chord forms they sit around, repeating
 *           up the neck. Reaches for chord shapes the player already holds.
 *   nps   — seven shapes, three notes on every string, one starting on each
 *           scale degree. Even and mechanical; only defined for 7-note scales.
 *   boxes — the five pentatonic boxes. What `caged` becomes for a scale with
 *           too few notes for either of the above to mean anything.
 */
export type PositionSystem = 'caged' | 'nps' | 'boxes';

export interface Position {
  id: string;
  /** What the pager calls it: 'E form', 'Position 3', 'Box 2'. */
  label: string;
  /** Lowest and highest fret the box occupies, inclusive. */
  from: number;
  to: number;
  /** `${string}-${fret}` for every scale tone inside the box. */
  keys: ReadonlySet<string>;
}
