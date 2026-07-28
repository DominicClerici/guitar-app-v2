const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export type NoteInfo = {
  name: NoteName;
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
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { name, octave, cents, midi, inTune: Math.abs(cents) < IN_TUNE_CENTS };
}
