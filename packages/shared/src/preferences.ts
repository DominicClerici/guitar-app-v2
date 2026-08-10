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

export const preferenceKey = z.enum(['theme', 'accidentalPreference']);
export type PreferenceKey = z.infer<typeof preferenceKey>;

export const preferenceSchemas = {
  theme: themePreference,
  accidentalPreference,
} satisfies Record<PreferenceKey, z.ZodType>;

/** The full preference set, as the app consumes it once rows have been folded together. */
export const preferences = z.object(preferenceSchemas);
export type Preferences = z.infer<typeof preferences>;

export const DEFAULT_PREFERENCES: Preferences = Object.freeze({
  theme: 'system',
  accidentalPreference: 'auto',
});

/**
 * One stored row's worth of preference, key and value validated together. The discriminated union
 * is what rejects `{ key: 'theme', value: 'sharp' }` — a plain `z.string()` value could not.
 */
export const preferenceEntry = z.discriminatedUnion('key', [
  z.object({ key: z.literal('theme'), value: themePreference }),
  z.object({ key: z.literal('accidentalPreference'), value: accidentalPreference }),
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
