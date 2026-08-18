import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { colorVision } from '@guitar/shared';
import type { ThemeName } from 'uniwind';
import { describe, expect, it } from 'vitest';

import { parseColor } from '../color';
import { contrastRatio, deltaE, DICHROMACIES, MODELS, type Dichromacy } from './dichromacy';
import { COLOR_VISION_PALETTES, huePalette, type HueRole } from './palettes';
import { paletteVariables, washOf, WASH_ALPHA } from './variables';

const MODES = colorVision.options;
const ROLES: HueRole[] = ['accent', 'amber', 'rose', 'violet'];
const THEMES: ThemeName[] = ['dark', 'light'];

/** The token each role is drawn from when nothing is adjusting the palette. */
const ROLE_TOKENS: Record<HueRole, string> = {
  accent: '--accent',
  amber: '--amber',
  rose: '--rose',
  violet: '--violet',
};

/**
 * How far apart two coded hues must stay once a dichromat has seen them, in CIEDE2000.
 *
 * Around ten times the just-noticeable difference. The floor is not set at the largest number the
 * palettes could reach — pushing past this costs real drift, and past roughly this point the modes
 * stop looking like Aurora and start looking like a warning label, which is a thing people turn
 * off. It is set where two dots on a neck are unmistakable at the size they are actually drawn.
 *
 * One number for both themes, because it is a fact about eyes rather than about a palette. The
 * light sets clear it by a great deal less than the dark ones do (`palettes.ts` says why), which
 * is worth knowing before assuming a failure here came from the edit you just made.
 */
const SEPARATION_FLOOR = 22;

/**
 * A hue has to survive being drawn on a card face — the ground that gives it least to work with in
 * its own theme. In the dark half that is the lighter of the two grounds; in the light half it is
 * the same surface seen the other way round, a near-white a dark hue has to stay legible against.
 */
const SURFACE: Record<ThemeName, string> = { dark: '#181a1f', light: '#f8f6f3' };
const MIN_CONTRAST = 4.5;

const css = readFileSync(fileURLToPath(new URL('../../global.css', import.meta.url)), 'utf8');

/**
 * A token's value as `global.css` declares it *in one theme*.
 *
 * The file states every colour twice, once per `@variant` block, so a plain search for the token
 * finds whichever half happens to come first — which was fine when the two halves agreed about the
 * jewels and is exactly the bug to catch now that they do not. The block is sliced out first and
 * the token looked up inside it.
 */
function tokenValue(theme: ThemeName, token: string): string | null {
  const block = new RegExp(`@variant ${theme} \\{([\\s\\S]*?)\\n {4}\\}`).exec(css)?.[1];

  if (block === undefined) return null;

  return new RegExp(`^\\s*${token}:\\s*([^;]+);`, 'm').exec(block)?.[1].trim() ?? null;
}

/**
 * The closest two roles of a palette, as a given eye sees them.
 *
 * The palette and the eye are separate arguments on purpose: the interesting comparison is a mode
 * against the *unaided* palette under the same vision, which means simulating one eye over two
 * different sets of colours.
 */
function worstPair(
  theme: ThemeName,
  mode: (typeof MODES)[number],
  eye: Dichromacy,
  simulate: (hex: string, kind: Dichromacy) => string,
) {
  const palette = huePalette(mode, theme);
  let worst = { pair: '', distance: Infinity };

  for (let i = 0; i < ROLES.length; i++) {
    for (let j = i + 1; j < ROLES.length; j++) {
      const distance = deltaE(simulate(palette[ROLES[i]], eye), simulate(palette[ROLES[j]], eye));
      if (distance < worst.distance) worst = { pair: `${ROLES[i]}/${ROLES[j]}`, distance };
    }
  }

  return worst;
}

/** The same, for ordinary vision — no simulation applied. */
function worstPairUnimpaired(theme: ThemeName, mode: (typeof MODES)[number]) {
  return worstPair(theme, mode, 'protanopia', (hex) => hex);
}

describe('the palettes', () => {
  it('draws every role in every mode of every theme', () => {
    for (const theme of THEMES) {
      for (const mode of MODES) {
        expect(Object.keys(COLOR_VISION_PALETTES[theme][mode]).sort()).toEqual([...ROLES].sort());
      }
    }
  });

  it('is a colour a native view can be painted with', () => {
    for (const theme of THEMES) {
      for (const mode of MODES) {
        for (const role of ROLES) {
          const parsed = parseColor(huePalette(mode, theme)[role]);

          expect(parsed, `${theme}.${mode}.${role}`).not.toBeNull();
          // Opaque: these paint discs and hairlines, and a translucent hue would take its
          // separation from whatever happened to be behind it.
          expect(parsed?.a, `${theme}.${mode}.${role}`).toBe(1);
        }
      }
    }
  });

  it('keeps every hue legible on a card face', () => {
    for (const theme of THEMES) {
      for (const mode of MODES) {
        for (const role of ROLES) {
          expect(
            contrastRatio(huePalette(mode, theme)[role], SURFACE[theme]),
            `${theme}.${mode}.${role}`,
          ).toBeGreaterThan(MIN_CONTRAST);
        }
      }
    }
  });

  it('holds the accent still across the modes of a theme', () => {
    // The rule the whole table is built on, and the one a well-meaning edit is likeliest to break:
    // a mode recolours what is colour-coded and leaves the app's primary alone. Asserted per theme
    // rather than across them, since the two themes' accents are different colours on purpose.
    for (const theme of THEMES) {
      const accents = MODES.map((mode) => huePalette(mode, theme).accent);

      expect(new Set(accents), theme).toEqual(new Set([huePalette('normal', theme).accent]));
    }
  });
});

describe('a mode, to the eye it is for', () => {
  // The point of the whole module. A palette of four hand-picked colours can look considered and
  // still collapse to two under the vision it was picked for — the first draft of this table put
  // rose within ΔE 1.1 of the accent under deuteranopia, which is to say it deleted the difference
  // between a root note and a wrong answer for exactly the people who turned it on. Simulating is
  // the only way to know, so it is asserted rather than reasoned about in a comment.
  for (const theme of THEMES) {
    for (const mode of DICHROMACIES) {
      for (const [name, simulate] of Object.entries(MODELS)) {
        it(`keeps its four roles apart under ${mode} on ${theme} (${name})`, () => {
          const { pair, distance } = worstPair(theme, mode, mode, simulate);

          expect(distance, `closest pair was ${pair}`).toBeGreaterThanOrEqual(SEPARATION_FLOOR);
        });
      }

      it(`is an improvement on the unaided palette under ${mode} on ${theme}`, () => {
        // The floor above could in principle be met by a palette that was still worse than doing
        // nothing, if the Aurora colours happened to clear it too. They do not, and this is the
        // assertion that keeps a mode from ever being a downgrade on the setting being off.
        for (const [name, simulate] of Object.entries(MODELS)) {
          const unaided = worstPair(theme, 'normal', mode, simulate);
          const aided = worstPair(theme, mode, mode, simulate);

          expect(aided.distance, `${theme}.${mode} under ${name}`).toBeGreaterThan(
            unaided.distance,
          );
        }
      });
    }
  }

  it('stays four distinguishable colours to ordinary vision too', () => {
    // Someone with ordinary vision sets this up for someone else, and sees it in the preview
    // either way. A mode that solved the problem by flattening the palette would read as broken.
    for (const theme of THEMES) {
      for (const mode of MODES) {
        const { distance } = worstPairUnimpaired(theme, mode);

        expect(distance, `${theme}.${mode}`).toBeGreaterThan(20);
      }
    }
  });
});

describe('the normal palette', () => {
  // The one mode that is not this module's to choose: it is what the app already draws, and a
  // token edited in global.css without this following would show the settings preview promising a
  // change from a colour the app no longer uses.
  it('is the Aurora tokens themselves, in each theme', () => {
    for (const theme of THEMES) {
      for (const role of ROLES) {
        expect(tokenValue(theme, ROLE_TOKENS[role]), `${theme}.${role}`).toBe(
          COLOR_VISION_PALETTES[theme].normal[role],
        );
      }
    }
  });

  it('is a different set in each theme', () => {
    // The point of splitting the table. A light theme that inherited the dark jewels would pass
    // every separation test above — they are asserted per theme — while drawing pastels at under
    // 2:1 on a white card, which is the failure this whole file exists to make impossible.
    for (const role of ROLES) {
      expect(COLOR_VISION_PALETTES.light.normal[role], role).not.toBe(
        COLOR_VISION_PALETTES.dark.normal[role],
      );
    }
  });
});

describe('the variables a mode writes', () => {
  it('leaves the accent and everything derived from it alone', () => {
    for (const theme of THEMES) {
      for (const mode of MODES) {
        const written = Object.keys(paletteVariables(mode, theme));

        expect(written.filter((name) => name.includes('accent')), `${theme}.${mode}`).toEqual([]);
        expect(written.filter((name) => name.includes('aqua')), `${theme}.${mode}`).toEqual([]);
      }
    }
  });

  it('writes each coded hue and its wash', () => {
    expect(Object.keys(paletteVariables('normal', 'dark')).sort()).toEqual([
      '--amber',
      '--amber-wash',
      '--rose',
      '--rose-wash',
      '--violet',
      '--violet-wash',
    ]);
  });

  it('writes a theme its own colours', () => {
    // The bug the theme argument exists to prevent: one palette written into both bags, so that
    // crossing into the other appearance hands back hues chosen for the ground it just left.
    for (const mode of MODES) {
      expect(paletteVariables(mode, 'light'), mode).not.toEqual(paletteVariables(mode, 'dark'));
    }
  });

  it('restores the authored tokens when the setting is off', () => {
    // Switching back is a write, not an undo — so `normal` has to reproduce global.css exactly,
    // washes included, or turning the setting off would leave the app subtly recoloured.
    for (const theme of THEMES) {
      for (const [token, value] of Object.entries(paletteVariables('normal', theme))) {
        expect(tokenValue(theme, token), `${theme} ${token}`).toBe(value);
      }
    }
  });

  it('derives a wash at the alpha global.css uses', () => {
    // Locks the derivation against the file it was read off, so a wash restated by hand in
    // global.css at a different weight fails here rather than drifting silently.
    expect(washOf('#e0a84e')).toBe(`rgba(224, 168, 78, ${WASH_ALPHA})`);

    for (const theme of THEMES) {
      for (const mode of MODES) {
        for (const role of ['amber', 'rose', 'violet'] as const) {
          const wash = parseColor(paletteVariables(mode, theme)[`--${role}-wash`]);

          expect(wash?.a, `${theme}.${mode}.${role}`).toBe(WASH_ALPHA);
        }
      }
    }
  });
});
