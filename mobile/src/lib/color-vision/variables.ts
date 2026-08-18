import type { ColorVision } from '@guitar/shared';

import { parseColor } from '@/lib/color';

import { huePalette, type HueRole } from './palettes';

/**
 * A palette as the Aurora tokens it overwrites.
 *
 * `global.css` declares the tokens with `@theme inline`, which leaves every colour utility a live
 * reference to its variable rather than a baked value. Rewriting the variable therefore reaches
 * everything at once — `text-amber` on a scale degree, `useToken('--rose')` in the tuner's colour
 * ramp, the token names held as strings in `buttonFace` and the ear trainer's face table — without
 * a single call site knowing this setting exists. That is the whole reason the setting is
 * expressible at all: the alternative was threading a palette through some thirty features and
 * hoping the thirty-first remembered.
 *
 * Only the three jewels are here. The accent is the app's primary rather than a code, and the
 * palettes are built so it never has to move (see `palettes.ts`), so a mode leaves `--accent` and
 * everything derived from it exactly as authored.
 *
 * The washes are not separate choices. `global.css` writes each as its own hue at
 * {@link WASH_ALPHA}, so they are derived here on the same terms rather than restated — a wash
 * left behind would tint a chip in the old hue behind ink in the new one.
 */

/** The alpha `global.css` mixes each `-wash` token at. */
export const WASH_ALPHA = 0.12;

/** The roles a mode actually rewrites — the coded hues, not the accent. */
const CODED: readonly HueRole[] = ['amber', 'rose', 'violet'];

/** A hue as the translucent wash drawn behind ink of the same colour. */
export function washOf(color: string): string {
  const rgba = parseColor(color);

  // Unreachable for the palettes in this module, which are all opaque hex, and a fallback rather
  // than a throw because a wash that comes back as its own base tints a chip too strongly — which
  // is legible and wrong — where a crash is neither.
  if (!rgba) return color;

  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${WASH_ALPHA})`;
}

/**
 * The CSS variables a mode sets, ready for `Uniwind.updateCSSVariables`.
 *
 * `normal` is not a special case: it restates the values `global.css` already holds, so switching
 * back off writes the app's own colours rather than having to undo anything.
 */
export function paletteVariables(mode: ColorVision): Record<string, string> {
  const palette = huePalette(mode);

  return Object.fromEntries(
    CODED.flatMap((role) => [
      [`--${role}`, palette[role]],
      [`--${role}-wash`, washOf(palette[role])],
    ]),
  );
}
