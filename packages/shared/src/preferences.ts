import { z } from 'zod';

/**
 * User preferences (BACKEND_PLAN.md §7, §8).
 *
 * Storage is one row per `(user_id, key)` so each preference merges on its own client timestamp —
 * changing the theme on one device and the accidental spelling on another, both offline, converges
 * instead of one clobbering the other. That makes the stored `value` an opaque string in both
 * dialects, so this module is the only thing that knows what a preference is allowed to hold.
 * Neither database enforces it; every write must go through `preferenceEntry`.
 */

export const themePreference = z.enum(['light', 'dark', 'system']);
export type ThemePreference = z.infer<typeof themePreference>;

/** How accidentals are spelled. `auto` defers to the key's own spelling. */
export const accidentalPreference = z.enum(['sharp', 'flat', 'auto']);
export type AccidentalPreference = z.infer<typeof accidentalPreference>;

/**
 * A setting that is only on or off. Shared rather than declared twice, because a toggle whose two
 * values were spelled differently from the next one's would be two vocabularies for one idea.
 */
export const togglePreference = z.enum(['on', 'off']);
export type TogglePreference = z.infer<typeof togglePreference>;

/**
 * Which colours the app draws its key-coded hues in.
 *
 * Named for the condition rather than for what it does to the palette: someone reaching for this
 * setting knows the word for their own vision, and "warmer" or "high contrast" would leave them
 * guessing which one to try. `normal` is the palette everyone else sees.
 */
export const colorVision = z.enum(['normal', 'protanopia', 'deuteranopia', 'tritanopia']);
export type ColorVision = z.infer<typeof colorVision>;

/**
 * Standard tuning as MIDI pitches, indexed **0 = high e … 5 = low E** — the app's own string
 * convention (`STRING_LABELS`, `OPEN_PITCHES_MIDI`), so a stored tuning indexes the way every
 * other six-element array about a neck does and nothing has to reverse it to look a string up.
 * Only something *printing* a tuning reads it the other way round, which is the same boundary a
 * chord chart already reverses at.
 */
export const STANDARD_TUNING = [64, 59, 55, 50, 45, 40] as const;

/**
 * How far one string may be moved from its standard pitch, in half steps either way.
 *
 * Four covers what a guitar is actually tuned to — drop D, E flat and D standard, open G, DADGAD —
 * while staying inside what the string can hold. It is not a display limit: a sixth string a fifth
 * below its nut pitch is a slack string, and offering it would be offering a tuning that does not
 * sound.
 */
export const TUNING_SPREAD = 4;

/** The pitches one string may hold: its standard pitch, give or take `TUNING_SPREAD`. */
export function tuningRangeFor(index: number): { min: number; max: number } {
  const standard = STANDARD_TUNING[index];
  if (standard === undefined) throw new RangeError(`no string at index ${index}`);

  return { min: standard - TUNING_SPREAD, max: standard + TUNING_SPREAD };
}

/**
 * Six MIDI pitches from a stored value, or `null` for anything that is not one — a count that is
 * not six, a part that is not a whole number, or a string tuned outside its own range.
 *
 * Every rejection folds to standard tuning rather than throwing (see `foldPreferences`), which is
 * what a value written by a newer client version — a seven-string tuning, say — comes out as on a
 * client that only knows six.
 */
export function parseTuning(value: string): number[] | null {
  const parts = value.split(',');
  if (parts.length !== STANDARD_TUNING.length) return null;

  const pitches: number[] = [];

  for (const [index, part] of parts.entries()) {
    if (!/^\d+$/.test(part)) return null;

    const pitch = Number(part);
    const { min, max } = tuningRangeFor(index);
    if (pitch < min || pitch > max) return null;

    pitches.push(pitch);
  }

  return pitches;
}

/** Six MIDI pitches as the stored value, high e first. */
export function formatTuning(pitches: readonly number[]): string {
  return pitches.join(',');
}

/**
 * A tuning is stored as one value rather than six rows because it is one setting: a string moved
 * on this device and another moved on that one are not two edits to merge, they are two different
 * tunings, and last-write-wins on the whole thing is the only answer that leaves a guitar playable.
 */
export const tuningPreference = z.string().refine((value) => parseTuning(value) !== null, {
  message: 'expected six comma-separated MIDI pitches, each within reach of its standard pitch',
});
export type TuningPreference = z.infer<typeof tuningPreference>;

export const preferenceKey = z.enum([
  'theme',
  'accidentalPreference',
  'tuning',
  'haptics',
  'reduceMotion',
  'colorVision',
]);
export type PreferenceKey = z.infer<typeof preferenceKey>;

export const preferenceSchemas = {
  theme: themePreference,
  accidentalPreference,
  tuning: tuningPreference,
  haptics: togglePreference,
  reduceMotion: togglePreference,
  colorVision,
} satisfies Record<PreferenceKey, z.ZodType>;

/** The full preference set, as the app consumes it once rows have been folded together. */
export const preferences = z.object(preferenceSchemas);
export type Preferences = z.infer<typeof preferences>;

/**
 * What a preference holds until someone chooses otherwise, on every device and on the server.
 *
 * These are constants rather than a reading of the device, because both sides of sync have to agree
 * on what an absent row means — a default that differed by device would make a pulled row and a
 * missing row describe different states. Where a system accessibility setting should have a say
 * (`reduceMotion`), the device overlays it on top of this while the row is still absent; the moment
 * something is actually chosen, the choice is stored and the overlay is done.
 */
export const DEFAULT_PREFERENCES: Preferences = Object.freeze({
  theme: 'system',
  accidentalPreference: 'auto',
  tuning: formatTuning(STANDARD_TUNING),
  haptics: 'on',
  reduceMotion: 'off',
  colorVision: 'normal',
});

/**
 * One stored row's worth of preference, key and value validated together. The discriminated union
 * is what rejects `{ key: 'theme', value: 'sharp' }` — a plain `z.string()` value could not.
 */
export const preferenceEntry = z.discriminatedUnion('key', [
  z.object({ key: z.literal('theme'), value: themePreference }),
  z.object({ key: z.literal('accidentalPreference'), value: accidentalPreference }),
  z.object({ key: z.literal('tuning'), value: tuningPreference }),
  z.object({ key: z.literal('haptics'), value: togglePreference }),
  z.object({ key: z.literal('reduceMotion'), value: togglePreference }),
  z.object({ key: z.literal('colorVision'), value: colorVision }),
]);
export type PreferenceEntry = z.infer<typeof preferenceEntry>;

export function isPreferenceKey(key: string): key is PreferenceKey {
  return preferenceKey.safeParse(key).success;
}

/**
 * Folds stored rows into a complete preference set, filling gaps from `DEFAULT_PREFERENCES`.
 * Unknown keys and values that no longer parse are dropped rather than thrown on: a row written by
 * a newer client version must not break an older one that is still reading the same table.
 */
export function foldPreferences(rows: Iterable<{ key: string; value: string }>): Preferences {
  const result: Preferences = { ...DEFAULT_PREFERENCES };

  for (const row of rows) {
    const parsed = preferenceEntry.safeParse(row);
    if (parsed.success) {
      // Narrowed by the union, so key and value are known to belong together.
      Object.assign(result, { [parsed.data.key]: parsed.data.value });
    }
  }

  return result;
}
