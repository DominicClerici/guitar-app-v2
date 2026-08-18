import type { ColorVision } from '@guitar/shared';

/**
 * The key-coded hues, redrawn for the colour vision the user actually has.
 *
 * Aurora tells four things apart by hue: the accent a root is lit in, and the three jewel hues a
 * scale, a key or a warning is coded by. Four hues is exactly where colour blindness starts to
 * cost information — under the common forms at least two of them land on the same perceived
 * colour — so each mode below is a set that stays apart under *that* form, rather than a filter
 * applied to the originals.
 *
 * Three rules held every set together:
 *
 *   - **The accent never moves.** It is the app's one primary, on every button and tab, and the
 *     measurements said it did not have to: holding it at the Aurora aqua and moving only the
 *     three jewels still clears the separation floor in all three modes. A mode therefore recolours
 *     what is colour-*coded* and leaves the app looking like itself.
 *   - **Move along the axis the eye still has.** Protanopia and deuteranopia lose red–green and
 *     keep blue–yellow; tritanopia is the other way round.
 *   - **Where the axis runs out, separate by lightness.** Two colours that read as the same hue are
 *     still two colours if one is plainly lighter than the other.
 *
 * The trap here, and the reason the first draft of this table was worse than no table at all, is
 * that the fourth rule is *not* "make the confusable one lighter and pinker". A protan or deutan
 * eye takes the red out of a light pink and leaves a pale blue-grey — which is precisely where the
 * aqua accent already sits. A rose lightened away from violet lands on accent instead. It has to
 * go **darker and redder**, buying its separation from the accent in lightness while it gives up
 * hue. Every rose below is deeper than the Aurora one; that is not a stylistic preference.
 *
 * None of this makes hue load-bearing on its own: a dot on the neck carries its note name, a chip
 * carries its label, and the palette is what makes those groupings *quick* to read rather than
 * what makes them readable at all. That is why a mode changes only these values and leaves ink,
 * surfaces and hairlines alone.
 *
 * Keys name the role each hue plays in the normal palette, not the colour it comes out as: under
 * tritanopia `amber` is a soft apricot, and it is still the hue the first jewel role is drawn in.
 *
 * The numbers behind the sets are checked rather than asserted — `palettes.test.ts` simulates each
 * one under two independent models of dichromacy and fails if any two roles come within the floor
 * documented there. Edit a value here and that test is the thing that tells you whether you
 * improved it.
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
   * dark rather than merely muddy. The pair at risk is rose against the accent — both drain
   * towards the same pale grey — and rose settles the argument by dropping a step in lightness and
   * holding its red. Amber is left at the Aurora value exactly: it sits on the blue–yellow axis
   * this eye keeps, and nothing it has to be told apart from is near it.
   */
  protanopia: {
    accent: '#5ec8c2',
    amber: '#e0a84e',
    rose: '#d3637c',
    violet: '#9889e6',
  },

  /**
   * Green-blind: the same collapse without the lightness penalty, which makes it the harder of the
   * two — a deutan eye keeps more of the light end, so a pale rose lands even more squarely on the
   * accent than it does for a protan. Rose deepens as it does above, violet goes bluer and darker
   * to clear it, and amber is pushed up into a fuller yellow to stay clear of the deepened rose.
   */
  deuteranopia: {
    accent: '#5ec8c2',
    amber: '#f2b039',
    rose: '#d56d7b',
    violet: '#8c7bf3',
  },

  /**
   * Blue-blind: blue reads as green and yellow reads as pink, so the danger here is the opposite
   * pair — amber and rose, which unaided are the closest two colours any of these eyes are asked
   * to separate. They are pulled apart in lightness rather than hue, the amber lifted to a soft
   * apricot and the rose held deep, while violet keeps enough red to stay off both. The accent's
   * aqua is read as a blue-green and is nowhere near the other three, so it stays put here too.
   */
  tritanopia: {
    accent: '#5ec8c2',
    amber: '#f4c26e',
    rose: '#d36079',
    violet: '#a884e8',
  },
};

/** The four hues to draw in, for a stored colour vision mode. */
export function huePalette(mode: ColorVision): HuePalette {
  return COLOR_VISION_PALETTES[mode];
}
