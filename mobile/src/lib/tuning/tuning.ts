/**
 * The tuning in force, as everything downstream of the setting reads it.
 *
 * The setting stores six MIDI pitches and almost nothing wants them in that form: a board wants
 * pitch classes, a player wants MIDI, a row of labels wants note names, and none of them wants to
 * re-derive it per fret per frame. So a stored value is read into this once and the derivations
 * hang off it.
 *
 * `sounding` is the deliberate word, and the distinction the rest of the app turns on. A shape and
 * a sound stop being the same thing the moment a string moves. The CAGED grips, the triad voicings
 * and the pathway lessons are all authored in standard tuning and stay there — `midiAt` and
 * `pitchClassAt` in `@/lib/theory` are still exactly right for them — while what a fret actually
 * sounds under the user's own strings is this.
 */
import { formatTuning, parseTuning, STANDARD_TUNING } from '@guitar/shared';

export interface Tuning {
  /** The stored value this was read from, and the identity everything downstream keys on. */
  readonly stored: string;
  /** Open-string MIDI pitches, indexed 0 = high e … 5 = low E, like every other array on a neck. */
  readonly open: readonly number[];
  /** The same six strings as pitch classes, for a board that only ever draws names. */
  readonly openPitchClasses: readonly number[];
  /** Half steps from standard, per string — what each string was moved by, and which way. */
  readonly offsets: readonly number[];
  /** Whether every string is at its standard pitch. */
  readonly isStandard: boolean;
}

function build(stored: string): Tuning {
  // An unreadable value folds to standard rather than throwing, for the reason `parseTuning` gives:
  // a tuning written by a newer client version must not leave an older one with no neck at all.
  const open = parseTuning(stored) ?? [...STANDARD_TUNING];

  return Object.freeze({
    stored,
    open: Object.freeze(open),
    openPitchClasses: Object.freeze(open.map((midi) => midi % 12)),
    offsets: Object.freeze(open.map((midi, index) => midi - STANDARD_TUNING[index])),
    isStandard: open.every((midi, index) => midi === STANDARD_TUNING[index]),
  });
}

/** Six strings at rest. What an account that has never opened the setting plays on. */
export const STANDARD: Tuning = build(formatTuning(STANDARD_TUNING));

let cached: Tuning = STANDARD;

/**
 * The tuning a stored value describes, as the same object every time until the value changes.
 *
 * One slot, because there is only ever one tuning in force: this is read from a store snapshot, and
 * a second distinct value existing at all would mean the user moved a string. Referential stability
 * is the whole point — `useSyncExternalStore` compares what a selector returns, so returning a
 * freshly parsed array per read would wake every neck in the app on every unrelated preference
 * write, and defeat the memo on every table derived from it.
 */
export function tuningFor(stored: string): Tuning {
  if (stored !== cached.stored) cached = build(stored);

  return cached;
}

/** The MIDI pitch a position actually sounds under this tuning. Fret 0 is open. */
export function soundingMidi(tuning: Tuning, string: number, fret: number): number {
  return tuning.open[string] + fret;
}

/** The pitch class (0–11, C = 0) a position actually sounds under this tuning. */
export function soundingPitchClass(tuning: Tuning, string: number, fret: number): number {
  return (tuning.openPitchClasses[string] + fret) % 12;
}
