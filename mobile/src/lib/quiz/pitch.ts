// Scientific pitch notation → MIDI, for the `listen` question's AudioSpec.
//
// The app's own note vocabulary (lib/theory) is octave-less — it works in pitch classes, because
// everything built on it is about spelling rather than register. A quiz has to sound an actual
// note, so it needs the octave the author wrote.

const NATURAL: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const NAME = /^([A-Ga-g])([#b♯♭]*)(-?\d+)$/;

/**
 * `"A3"` → 57, `"C4"` → 60 (middle C), `"F#2"` → 42.
 *
 * The accidental shifts the pitch off its letter rather than off a pitch class, so `Cb4` is the
 * semitone below `C4` (59) and not `B4` — the register follows the letter, which is what an author
 * writing `Cb4` means.
 *
 * Returns null rather than throwing for a name this build can't read. A `listen` question whose
 * audio names one impossible note should lose that note, not the whole quiz.
 */
export function midiFromPitchName(name: string): number | null {
  const match = NAME.exec(name.trim());
  if (!match) return null;

  const natural = NATURAL[match[1].toUpperCase()];

  let offset = 0;
  for (const accidental of match[2]) offset += accidental === '#' || accidental === '♯' ? 1 : -1;

  return (Number(match[3]) + 1) * 12 + natural + offset;
}

/** Every readable note of a spec, in the order written. Unreadable ones are dropped. */
export function midisFromPitchNames(names: readonly string[]): number[] {
  return names
    .map(midiFromPitchName)
    .filter((midi): midi is number => midi !== null && midi >= 0 && midi <= 127);
}
