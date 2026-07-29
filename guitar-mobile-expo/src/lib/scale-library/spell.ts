// Spelling a scale, generated rather than tabulated.
//
// The rule is the one a musician uses: a scale takes one letter per degree
// number, in order, and the accidental is whatever it takes to land on the
// right pitch. That is why the catalogue writes degrees out as labels — the
// letter comes from the number, the accidental from the arithmetic. Eighteen
// scales across seventeen roots therefore needs no data at all, and double
// accidentals fall out correctly (A♯ Lydian really does contain D♯♯).
//
// A degree number may repeat inside one scale: the blues scale is 1 ♭3 4 ♭5 5
// ♭7, and both of its fifths correctly land on the same letter, a G♭ and a G.

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const LETTER_PITCH = [0, 2, 4, 5, 7, 9, 11] as const;

interface ParsedNote {
  letter: number;
  /** Semitones the accidentals move the letter by. */
  alter: number;
}

function parseNote(name: string): ParsedNote {
  const letter = LETTERS.indexOf(name[0]?.toUpperCase() as (typeof LETTERS)[number]);
  if (letter < 0) throw new Error(`parseNote: unknown note "${name}"`);

  let alter = 0;
  for (const char of name.slice(1)) {
    if (char === '#') alter += 1;
    else if (char === 'b') alter -= 1;
  }
  return { letter, alter };
}

/** Pitch class (0–11) of a note name, for any number of accidentals. */
export function noteToPitchClass(name: string): number {
  const { letter, alter } = parseNote(name);
  return (((LETTER_PITCH[letter] + alter) % 12) + 12) % 12;
}

/** The digits of a degree label: 'b3' → 3, '#11' → 11. */
export function degreeNumber(label: string): number {
  const digits = label.replace(/[^0-9]/g, '');
  const value = Number.parseInt(digits, 10);
  if (!Number.isFinite(value)) throw new Error(`degreeNumber: no number in "${label}"`);
  return value;
}

function accidentals(alter: number): string {
  if (alter > 0) return '#'.repeat(alter);
  if (alter < 0) return 'b'.repeat(-alter);
  return '';
}

/**
 * Spell one scale tone: the letter `degree` steps above the root's letter,
 * accidentalised to sound at `semitone` above the root.
 */
export function spellDegree(root: string, degree: string, semitone: number): string {
  const { letter, alter } = parseNote(root);
  const rootPc = (((LETTER_PITCH[letter] + alter) % 12) + 12) % 12;

  const step = degreeNumber(degree) - 1;
  const targetLetter = (letter + step) % 7;
  const natural = LETTER_PITCH[targetLetter];
  const target = (rootPc + semitone) % 12;

  // Centre the gap on zero so a note a semitone *below* its letter reads as one
  // flat rather than eleven sharps.
  let diff = (((target - natural) % 12) + 12) % 12;
  if (diff > 6) diff -= 12;

  return LETTERS[targetLetter] + accidentals(diff);
}

/** Every tone of a scale, ascending, spelled against `root`. */
export function spellScale(
  root: string,
  type: { degrees: readonly string[]; semitones: readonly number[] },
): string[] {
  return type.degrees.map((degree, index) => spellDegree(root, degree, type.semitones[index]));
}

/** How many accidental characters a spelling carries — a proxy for how odd it looks. */
export function accidentalWeight(notes: readonly string[]): number {
  let singles = 0;
  let doubles = 0;
  for (const note of notes) {
    const marks = note.length - 1;
    singles += marks;
    if (marks > 1) doubles += 1;
  }
  // A double accidental is what makes a spelling unreadable, so it outweighs any
  // number of singles.
  return doubles * 100 + singles;
}
