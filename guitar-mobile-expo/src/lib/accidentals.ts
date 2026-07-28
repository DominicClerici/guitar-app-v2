// Display-only: rewrite ASCII accidentals to typographic music glyphs at the UI
// boundary. The analysis engine keeps ASCII spellings internally because it parses
// and keys on note names (e.g. noteToSemitone); converting here leaves that
// machinery untouched.
//
// Input is assumed to be a musical token — a note name ("Bb", "C#"), chord symbol
// ("C#m7", "Bbmaj7") or interval label ("b5", "#9"). Within those tokens every '#'
// is a sharp and every lowercase 'b' is a flat: none of the words that appear
// (maj, min, m, sus, dim, aug, add) contain a literal lowercase 'b', so a blanket
// swap is safe. Uppercase 'B' (the note) is deliberately left alone.
const SHARP = '♯'; // ♯ MUSIC SHARP SIGN
const FLAT = '♭'; // ♭ MUSIC FLAT SIGN

export function toAccidentalGlyphs(label: string): string {
  return label.replace(/#/g, SHARP).replace(/b/g, FLAT);
}
