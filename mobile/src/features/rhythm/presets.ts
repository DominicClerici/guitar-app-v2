import type { RhythmSlot } from '@/lib/content';

/**
 * The rhythms worth drilling that no draw would reliably hand you.
 *
 * A preset carries its own meter and subdivision, so choosing one sets the shape of the bar as
 * well as its contents — "Waltz" is not a 4/4 pattern that happens to be in three, and the meter
 * control has nothing to say while a preset is selected.
 *
 * Each is one bar, repeated for as long as the pattern runs. A preset that needed two bars to make
 * its point would be a phrase rather than a figure, and a figure is what you drill.
 */

export interface RhythmPreset {
  id: string;
  name: string;
  /** What it teaches, in the practising musician's terms. */
  hint: string;
  beatsPerBar: number;
  subdivision: number;
  /** One bar of slots. Its length is `beatsPerBar * subdivision`. */
  bar: RhythmSlot[];
}

export const PRESETS: RhythmPreset[] = [
  {
    id: 'quarters',
    name: 'Quarter notes',
    hint: 'One pick per click',
    beatsPerBar: 4,
    subdivision: 1,
    bar: ['accent', 'hit', 'hit', 'hit'],
  },
  {
    id: 'eighths',
    name: 'Eighth notes',
    hint: 'Down on the numbers, up on the ands',
    beatsPerBar: 4,
    subdivision: 2,
    bar: ['accent', 'hit', 'hit', 'hit', 'hit', 'hit', 'hit', 'hit'],
  },
  {
    id: 'upbeats',
    name: 'Upbeats only',
    hint: 'Nothing on the click, everything between',
    beatsPerBar: 4,
    subdivision: 2,
    bar: ['rest', 'accent', 'rest', 'hit', 'rest', 'hit', 'rest', 'hit'],
  },
  {
    id: 'gallop',
    name: 'Gallop',
    hint: 'Eighth, two sixteenths, on every beat',
    beatsPerBar: 4,
    subdivision: 4,
    bar: [
      'accent',
      'rest',
      'hit',
      'hit',
      'hit',
      'rest',
      'hit',
      'hit',
      'hit',
      'rest',
      'hit',
      'hit',
      'hit',
      'rest',
      'hit',
      'hit',
    ],
  },
  {
    id: 'dotted-push',
    name: 'Dotted-quarter push',
    hint: 'Three eighths apart, so the bar keeps moving under you',
    beatsPerBar: 4,
    subdivision: 2,
    bar: ['accent', 'rest', 'rest', 'hit', 'rest', 'rest', 'hit', 'rest'],
  },
  {
    id: 'syncopation',
    name: 'Syncopation',
    hint: 'Weight thrown onto the offbeats',
    beatsPerBar: 4,
    subdivision: 2,
    bar: ['accent', 'rest', 'rest', 'hit', 'hit', 'rest', 'rest', 'hit'],
  },
  {
    id: 'sixteenths',
    name: 'Sixteenth run',
    hint: 'Four to a beat, evenly',
    beatsPerBar: 4,
    subdivision: 4,
    bar: [
      'accent',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
      'hit',
    ],
  },
  {
    id: 'waltz',
    name: 'Waltz',
    hint: 'Three to a bar, and the one has to be felt',
    beatsPerBar: 3,
    subdivision: 1,
    bar: ['accent', 'hit', 'hit'],
  },
];

export const DEFAULT_PRESET_ID = 'eighths';

/**
 * A preset by id, falling back to the default rather than answering null. The id is stored on the
 * device and may have been written by a build whose library held a preset this one has since
 * dropped; opening on eighth notes is a better answer to that than an empty screen.
 */
export function presetFor(id: string): RhythmPreset {
  return (
    PRESETS.find((preset) => preset.id === id) ??
    PRESETS.find((preset) => preset.id === DEFAULT_PRESET_ID) ??
    PRESETS[0]
  );
}

/** The preset's bar, repeated to fill `bars`. */
export function presetSlots(preset: RhythmPreset, bars: number): RhythmSlot[] {
  const slots: RhythmSlot[] = [];
  for (let bar = 0; bar < bars; bar += 1) slots.push(...preset.bar);
  return slots;
}
