// What a drawn neck looks like, as opposed to what it sounds like — the string
// names down the side, the inlay dots, and how thick each string is drawn. The
// pitch math lives next door in fretboard.ts; this is the part three boards were
// each keeping their own copy of (the quiz board, the chord detector's board, and
// the activity board), which is how they drifted apart in the first place.
//
// STRING INDEX CONVENTION — the one thing to get right before using these arrays.
//
// Every array here is indexed 0 = high e … 5 = low E, top row down, matching
// fretboard.ts and the app's internal convention.
//
// The *content wire format* counts the other way up from one: in a quiz's
// `FretPosition` and an activity's targets, string 1 is the high e and string 6
// is the low E (see `midiForTarget` in the shared activity schema). The two only
// ever meet where a board draws a wire position, so the conversion is named
// rather than written inline as `± 1` — an off-by-one here draws the right note
// on the wrong string, which looks like a working board.

/** Top row down: index 0 is the high e. */
export const STRING_LABELS = ['e', 'B', 'G', 'D', 'A', 'E'] as const;

/**
 * Tailwind height per string. The wound strings are visibly thicker than the
 * plain trebles, which is the one piece of styling that belongs to the strings
 * themselves rather than to any one board's look.
 */
export const STRING_GAUGE_CLASS = [
  'h-px',
  'h-px',
  'h-[1.25px]',
  'h-[1.5px]',
  'h-[1.75px]',
  'h-[2px]',
] as const;

/** Frets carrying one inlay dot. A board drawing fewer frets simply never reaches the later ones. */
export const SINGLE_INLAY_FRETS: readonly number[] = [3, 5, 7, 9, 15, 17, 19, 21];

/** The octave, marked with a pair of dots on every guitar worth the name. */
export const DOUBLE_INLAY_FRET = 12;

/** Wire string number (1 = high e) → array index (0 = high e). */
export function stringIndexFromWire(stringNumber: number): number {
  return stringNumber - 1;
}

/** Array index (0 = high e) → wire string number (1 = high e). */
export function wireStringFromIndex(index: number): number {
  return index + 1;
}
