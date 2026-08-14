import { z } from 'zod';

import { MAX_BPM, MIN_BPM } from '@/features/metronome/patterns';

import { NOTE_VALUES, type NoteValue } from './patternGenerator';
import { DEFAULT_PRESET_ID } from './presets';

/**
 * What the rhythm trainer remembers, and the one place that decides what a stored body means.
 *
 * Pure, and deliberately reaches nothing that reads or writes: the row it goes in is
 * `trainerSettingsStore`'s business. That is what lets every degradation rule below be pinned down
 * in a test rather than on a device.
 *
 * Everything is parsed rather than trusted. The row is device-local, but it still outlives the
 * build that wrote it: a settings body naming a note value or a preset this build has never heard
 * of must open the tool at its defaults, not crash it. `catch` on each field rather than on the
 * whole object, so one unrecognised value costs you that field and not your tempo.
 */

/** The pattern is this long however it was arrived at — not a control, just the shape of a pass. */
export const PATTERN_BARS = 2;
/** Bars of click before the pattern, every pass. */
export const COUNT_IN_BARS = 1;

export const RAMP_STEPS = [2, 4, 8] as const;
export type RampStep = (typeof RAMP_STEPS)[number];

export const METERS = [2, 3, 4, 6] as const;
export type Meter = (typeof METERS)[number];

const noteValue = z.enum(NOTE_VALUES as [NoteValue, ...NoteValue[]]);

const generateSource = z.object({
  mode: z.literal('generate'),
  values: z.array(noteValue).catch([]),
  rests: z.boolean().catch(true),
});

const presetSource = z.object({
  mode: z.literal('preset'),
  id: z.string().catch(DEFAULT_PRESET_ID),
});

export const trainerSettings = z.object({
  input: z.enum(['mic', 'tap']).catch('mic'),
  source: z.discriminatedUnion('mode', [generateSource, presetSource]).catch({
    mode: 'preset',
    id: DEFAULT_PRESET_ID,
  }),
  bpm: z.number().int().min(MIN_BPM).max(MAX_BPM).catch(90),
  /** Only consulted while generating: a preset brings its own meter. */
  beatsPerBar: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(6)]).catch(4),
  ramp: z
    .object({
      enabled: z.boolean().catch(false),
      step: z.union([z.literal(2), z.literal(4), z.literal(8)]).catch(4),
    })
    .catch({ enabled: false, step: 4 }),
});

export type TrainerSettings = z.infer<typeof trainerSettings>;
export type PatternSource = TrainerSettings['source'];

export const DEFAULT_SETTINGS: TrainerSettings = Object.freeze({
  input: 'mic' as const,
  source: { mode: 'preset' as const, id: DEFAULT_PRESET_ID },
  bpm: 90,
  beatsPerBar: 4 as const,
  ramp: { enabled: false, step: 4 as const },
});

/** The values a fresh Generate mode opens on: enough to make a rhythm, not enough to be a wall. */
export const DEFAULT_VALUES: NoteValue[] = ['quarter', 'eighth'];

export function decodeSettings(body: string | null): TrainerSettings {
  if (body === null) return DEFAULT_SETTINGS;

  try {
    const parsed = trainerSettings.safeParse(JSON.parse(body) as unknown);
    return parsed.success ? parsed.data : DEFAULT_SETTINGS;
  } catch {
    // Not JSON at all. Same answer: this build cannot read it, so it opens at its defaults.
    return DEFAULT_SETTINGS;
  }
}
