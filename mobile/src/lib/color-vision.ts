import type { ColorVision } from '@guitar/shared';

/**
 * The key-coded hues, redrawn for the colour vision the user actually has.
 *
 * Aurora tells four things apart by hue: the accent a root is lit in, and the three jewel hues a
 * scale, a key or a warning is coded by. Four hues is exactly where colour blindness starts to
 * cost information — under the common forms at least two of them land on the same perceived
 * colour — so each mode below is a set of four that stay apart under *that* form, rather than a
 * filter applied to the originals.
 *
 * Two rules held every set together:
 *
 *   - Move along the axis the eye still has. Protanopia and deuteranopia lose the red–green axis
 *     and keep blue–yellow, so those palettes spread across blue and yellow. Tritanopia is the
 *     other way round, so that one spreads across red and green.
 *   - Where the axis runs out, separate by lightness. Two colours that read as the same hue are
 *     still two colours if one is plainly lighter than the other.
 *
 * None of this makes hue load-bearing on its own: a dot on the neck carries its note name, a chip
 * carries its label, and the palette is what makes those groupings *quick* to read rather than
 * what makes them readable at all. That is why a mode changes only these four values and leaves
 * ink, surfaces and hairlines alone.
 *
 * Keys name the role each hue plays in the normal palette, not the colour it comes out as: under
 * tritanopia `violet` is a dusty pink, and it is still the hue the third jewel role is drawn in.
 */

export type HueRole = 'accent' | 'amber' | 'rose' | 'violet';

export type HuePalette = Record<HueRole, string>;

export const COLOR_VISION_PALETTES: Record<ColorVision, HuePalette> = {
  /** The Aurora tokens themselves — `--accent`, `--amber`, `--rose`, `--violet` in `global.css`. */
  normal: {
    accent: '#5ec8c2',
    amber: '#e0a84e',
    rose: '#e0788f',
    violet: '#9b8cf0',
  },

  /**
   * Red-blind: red and green collapse, and anything red-leaning also loses lightness, so it goes
   * dark rather than merely muddy. Aqua is already on the blue end and stays; amber goes to a
   * plain yellow rather than an orange, which would drift towards the green it can no longer be
   * told from; and the pink is lifted brighter than its deuteranopic counterpart to buy back the
   * lightness a protan eye takes off it.
   */
  protanopia: {
    accent: '#5ec8c2',
    amber: '#f0c256',
    rose: '#f5a3d0',
    violet: '#6b78e0',
  },

  /**
   * Green-blind: the same collapse without the lightness penalty, so the pink can sit a step
   * deeper and gain contrast against the yellow. Rose and violet are the pair that would otherwise
   * merge — both read as blue-pink here — and they are kept apart by lightness, the light pink
   * against the deep blue.
   */
  deuteranopia: {
    accent: '#5ec8c2',
    amber: '#f2c14e',
    rose: '#f28fc4',
    violet: '#6f7ae8',
  },

  /**
   * Blue-blind: blue reads as green and yellow reads as pink, which is the one form where the
   * accent's aqua is not safe to leave alone — it is stated as the green it will be seen as. The
   * other three give up the blue–yellow axis entirely and spread down the red end instead: a pale
   * warm, a strong red, and a dusty pink between them, three lightnesses of the one hue this eye
   * can still read.
   */
  tritanopia: {
    accent: '#4ec8ad',
    amber: '#f2b49e',
    rose: '#d94a63',
    violet: '#a878c8',
  },
};

/** The four hues to draw in, for a stored colour vision mode. */
export function huePalette(mode: ColorVision): HuePalette {
  return COLOR_VISION_PALETTES[mode];
}
