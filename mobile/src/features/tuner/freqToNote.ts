/**
 * Frequency → pitch, and nothing about how that pitch is spelled.
 *
 * The name used to live on `NoteInfo`, which meant the audio path held a spelling and every screen
 * showing it printed sharps whatever the user had chosen. A pitch is a number; naming it is the
 * view's job, so a readout takes `note.midi` to `noteName` with the side it wants (see
 * `@/lib/accidentals`). The engine is left with only what it can actually know.
 */

export type NoteInfo = {
  octave: number;
  cents: number;
  midi: number;
  inTune: boolean;
};

const A4_HZ = 440;
const A4_MIDI = 69;

export const IN_TUNE_CENTS = 5;

export function freqToNote(f: number): NoteInfo {
  const midiF = A4_MIDI + 12 * Math.log2(f / A4_HZ);
  const midi = Math.round(midiF);
  const target = A4_HZ * Math.pow(2, (midi - A4_MIDI) / 12);
  const cents = 1200 * Math.log2(f / target);
  const octave = Math.floor(midi / 12) - 1;
  return { octave, cents, midi, inTune: Math.abs(cents) < IN_TUNE_CENTS };
}
