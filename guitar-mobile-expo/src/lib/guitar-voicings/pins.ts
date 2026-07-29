// The shapes a player expects to see first.
//
// These are ordering hints, never content: a pin is matched against what the
// generator produced and hoisted to the front of its group. A pin the generator
// did **not** produce is a bug in the generator, not a missing chord, and
// scripts/verify-guitar-voicings.ts fails on it. That constraint is the whole
// point — the pin list can never be used to paper over a filter that is throwing
// away real voicings.
//
// Every entry here was found by dumping the generator's own ranking and keeping
// only the cases where it disagreed with the canonical open shape; the verify
// script reports any pin that has since become redundant. The list is short
// because the scorer does the work — when it first ran, fourteen of fifteen
// candidate pins turned out to be unnecessary.
//
// What survives is one family of disagreement: open shapes that drop the fifth.
// The generator charges for an omitted tone in proportion to the chord's size,
// which is right in general and slightly too harsh for the open C shapes every
// guitarist learns first.
//
// Keys are `${root}:${chordTypeId}`; patterns are written the way charts are,
// low E first.

export const PINNED_SHAPES: Record<string, string[]> = {
  'C:dom7': ['x 3 2 3 1 0'],
  'C:maj6': ['x 3 2 2 1 0'],
  'C:sus4': ['x 3 3 0 1 1'],
  'C:sus2': ['x 3 0 0 1 3'],
  'C:add9': ['x 3 2 0 3 0'],
  'C:dom9': ['x 3 2 3 3 x'],
  'A:min9': ['x 0 5 5 0 0'],
};
