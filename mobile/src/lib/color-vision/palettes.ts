import type { ColorVision } from '@guitar/shared';
import type { ThemeName } from 'uniwind';

/**
 * The key-coded hues, redrawn for the colour vision the user actually has — and for the theme they
 * are on.
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
 *     measurements said it did not have to: holding it at the theme's own aqua and moving only the
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
 * hue. Every rose below is deeper than its theme's own; that is not a stylistic preference.
 *
 * ## Why the two themes need two tables
 *
 * A hue picked to stay apart on near-black has no reason to stay apart on paper. It is worse than
 * that: the dark sets live between L\* 56 and 81, which on a white card is a band of pastels that
 * read at under 2:1 — the palette would be inseparable and illegible at the same time. So the light
 * sets are their own work, solved under the same two models against the same floor.
 *
 * Light is the harder half, and it is worth knowing why before editing one of these numbers.
 * Contrast on a bright ground puts a *ceiling* on lightness — nothing above roughly L\* 47 clears
 * 4.5:1 on a card — while the dark half had the whole light end of the scale to spread into. Four
 * hues plus a fixed accent therefore have to fit into about twenty units of lightness rather than
 * thirty, and the three light modes clear the floor with between 0.0 and 1.5 units to spare where
 * the dark ones had room to be chosen for looks as well. That is why a light mode reads as more
 * extreme than its dark counterpart: one hue in each set is driven most of the way to black,
 * because lightness is the only axis with anything left in it.
 *
 * None of this makes hue load-bearing on its own: a dot on the neck carries its note name, a chip
 * carries its label, and the palette is what makes those groupings *quick* to read rather than
 * what makes them readable at all. That is why a mode changes only these values and leaves ink,
 * surfaces and hairlines alone.
 *
 * Keys name the role each hue plays in the normal palette, not the colour it comes out as: under
 * tritanopia `amber` is a soft apricot in the dark theme and an olive-gold in the light one, and it
 * is still the hue the first jewel role is drawn in.
 *
 * The numbers behind the sets are checked rather than asserted — `palettes.test.ts` simulates each
 * one under two independent models of dichromacy and fails if any two roles come within the floor
 * documented there. Edit a value here and that test is the thing that tells you whether you
 * improved it.
 */

export type HueRole = 'accent' | 'amber' | 'rose' | 'violet';

export type HuePalette = Record<HueRole, string>;

/**
 * The app as it is drawn on near-black.
 *
 * @see COLOR_VISION_PALETTES
 */
const DARK: Record<ColorVision, HuePalette> = {
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

/**
 * The same four roles on warm paper.
 *
 * Every hue here is deeper than its dark counterpart before colour vision is considered at all —
 * that is what `global.css` already does to make them legible — so a mode's job is to spread four
 * colours that all start out dark, using a range that runs out sooner than the dark half's.
 *
 * @see COLOR_VISION_PALETTES
 */
const LIGHT: Record<ColorVision, HuePalette> = {
  /** The Aurora tokens themselves — `--accent`, `--amber`, `--rose`, `--violet` in `global.css`. */
  normal: {
    accent: '#0f6461',
    amber: '#7b550a',
    rose: '#b83258',
    violet: '#6656bc',
  },

  /**
   * Red-blind. The same pair is at risk as in the dark theme and for the same reason — rose and
   * the accent both drain towards one grey — but the escape route is narrower here, because rose
   * cannot answer by getting lighter without falling under the contrast floor. It goes the other
   * way instead, all the way down to an oxblood at L\* 24, which puts fourteen units of lightness
   * between it and the accent and buys the whole set its margin. Amber lifts a little to keep off
   * the accent; violet does not move at all.
   */
  protanopia: {
    accent: '#0f6461',
    amber: '#8a600f',
    rose: '#790010',
    violet: '#6656bc',
  },

  /**
   * Green-blind, and the tightest of the three: it clears the floor by a tenth of a unit. A deutan
   * eye keeps the light end, so the accent and violet converge as well as amber and rose, and all
   * four have to be separated at once. Amber opens up into a full ochre at the top of what the
   * contrast floor allows, violet brightens to a near-electric indigo beside it, and rose again
   * takes the bottom of the range. Nudging any one of these is very likely to break another pair —
   * the test is not a formality here.
   */
  deuteranopia: {
    accent: '#0f6461',
    amber: '#9b6400',
    rose: '#770125',
    violet: '#7459db',
  },

  /**
   * Blue-blind: amber and rose are the pair, as they are in the dark theme. There they were pulled
   * apart by lifting the amber; here the amber can only go sideways, into an olive-gold at the top
   * of the hue family, while rose takes its separation in chroma — a vivid crimson at the same
   * lightness. That leaves violet nowhere to sit between them, so it drops instead, to the deep
   * plum this mode is most recognisable by.
   */
  tritanopia: {
    accent: '#0f6461',
    amber: '#7d701b',
    rose: '#d9004e',
    violet: '#4e1d82',
  },
};

export const COLOR_VISION_PALETTES: Record<ThemeName, Record<ColorVision, HuePalette>> = {
  dark: DARK,
  light: LIGHT,
};

/** The four hues to draw in, for a stored colour vision mode on a given theme. */
export function huePalette(mode: ColorVision, theme: ThemeName): HuePalette {
  return COLOR_VISION_PALETTES[theme][mode];
}
