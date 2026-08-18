/**
 * Putting a theme on, which is one call and reaches everything.
 *
 * `global.css` declares its colours twice, once per theme, and bridges them into the utilities with
 * `@theme inline` — so each utility class and each `useToken` is a live reference to a variable
 * rather than a baked value, and swapping the bag under them repaints the app without a single
 * component knowing there is a setting at all. It is the same reach the colour vision palettes use
 * (`lib/color-vision`), for the same reason.
 *
 * What it costs is a re-render of everything that is styled, which is most of the app. Nothing is
 * done about that here: the switch photographs the screen and holds the photograph up while this
 * runs, so the work happens where it cannot be seen (see `switch.ts`).
 */
import type { ThemePreference } from '@guitar/shared';
import * as SystemUI from 'expo-system-ui';
import { Uniwind } from 'uniwind';

/** Mirrors `--bg` in the dark half of `global.css`, for a read before uniwind has resolved. */
const FALLBACK_BG = '#0c0d10';

/**
 * The current theme's page colour, as a plain string.
 *
 * For the two places that take a colour rather than a class and are read once rather than
 * subscribed to — the navigator's `contentStyle`, which is evaluated as a screen is built, and the
 * native root behind the whole app.
 */
export function themeBackground(): string {
  const value = Uniwind.getCSSVariable('--bg');

  return typeof value === 'string' ? value : FALLBACK_BG;
}

/**
 * Holds the stored preference against uniwind.
 *
 * `system` is not resolved here into one theme or the other: handed the word itself, uniwind drops
 * whatever override is in force, follows the device, and keeps following it — so a phone that
 * turns dark at sunset takes the app with it. Resolving it here would answer the question once and
 * leave the app on whatever the device happened to be saying at that moment.
 *
 * The native root is painted to match. It is behind everything the app draws and is therefore
 * almost never seen — but "almost" is a stack transition and an over-scroll, which are exactly the
 * moments a strip of the other palette would show through.
 */
export function applyTheme(preference: ThemePreference): void {
  Uniwind.setTheme(preference);

  // Deliberately unawaited and unreported: nothing on screen depends on it, and a platform that
  // does not do this is a platform where the root was never visible anyway.
  void SystemUI.setBackgroundColorAsync(themeBackground()).catch(() => {});
}
