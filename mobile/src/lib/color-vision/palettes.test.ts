import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { colorVision } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import { parseColor } from '../color';
import { contrastRatio, deltaE, DICHROMACIES, MODELS, type Dichromacy } from './dichromacy';
import { COLOR_VISION_PALETTES, huePalette, type HueRole } from './palettes';
import { paletteVariables, washOf, WASH_ALPHA } from './variables';

const MODES = colorVision.options;
const ROLES: HueRole[] = ['accent', 'amber', 'rose', 'violet'];

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
 */
const SEPARATION_FLOOR = 22;

/** A hue has to survive being drawn on a card face, which is the lighter of the two grounds. */
const SURFACE = '#181a1f';
const MIN_CONTRAST = 4.5;

const css = readFileSync(fileURLToPath(new URL('../../global.css', import.meta.url)), 'utf8');

function tokenValue(token: string): string | null {
  return new RegExp(`^\\s*${token}:\\s*([^;]+);`, 'm').exec(css)?.[1].trim() ?? null;
}

/**
 * The closest two roles of a palette, as a given eye sees them.
 *
 * The palette and the eye are separate arguments on purpose: the interesting comparison is a mode
 * against the *unaided* palette under the same vision, which means simulating one eye over two
 * different sets of colours.
 */
function worstPair(
  mode: (typeof MODES)[number],
  eye: Dichromacy,
  simulate: (hex: string, kind: Dichromacy) => string,
) {
  const palette = huePalette(mode);
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
function worstPairUnimpaired(mode: (typeof MODES)[number]) {
  return worstPair(mode, 'protanopia', (hex) => hex);
}

describe('the palettes', () => {
  it('draws every role in every mode', () => {
    for (const mode of MODES) {
      expect(Object.keys(COLOR_VISION_PALETTES[mode]).sort()).toEqual([...ROLES].sort());
    }
  });

  it('is a colour a native view can be painted with', () => {
    for (const mode of MODES) {
      for (const role of ROLES) {
        const parsed = parseColor(huePalette(mode)[role]);

        expect(parsed, `${mode}.${role}`).not.toBeNull();
        // Opaque: these paint discs and hairlines, and a translucent hue would take its
        // separation from whatever happened to be behind it.
        expect(parsed?.a, `${mode}.${role}`).toBe(1);
      }
    }
  });

  it('keeps every hue legible on a card face', () => {
    for (const mode of MODES) {
      for (const role of ROLES) {
        expect(contrastRatio(huePalette(mode)[role], SURFACE), `${mode}.${role}`).toBeGreaterThan(
          MIN_CONTRAST,
        );
      }
    }
  });
});

describe('a mode, to the eye it is for', () => {
  // The point of the whole module. A palette of four hand-picked colours can look considered and
  // still collapse to two under the vision it was picked for — the first draft of this table put
  // rose within ΔE 1.1 of the accent under deuteranopia, which is to say it deleted the difference
  // between a root note and a wrong answer for exactly the people who turned it on. Simulating is
  // the only way to know, so it is asserted rather than reasoned about in a comment.
  for (const mode of DICHROMACIES) {
    for (const [name, simulate] of Object.entries(MODELS)) {
      it(`keeps its four roles apart under ${mode} (${name})`, () => {
        const { pair, distance } = worstPair(mode, mode, simulate);

        expect(distance, `closest pair was ${pair}`).toBeGreaterThanOrEqual(SEPARATION_FLOOR);
      });
    }

    it(`is an improvement on the unaided palette under ${mode}`, () => {
      // The floor above could in principle be met by a palette that was still worse than doing
      // nothing, if the Aurora colours happened to clear it too. They do not, and this is the
      // assertion that keeps a mode from ever being a downgrade on the setting being off.
      for (const [name, simulate] of Object.entries(MODELS)) {
        const unaided = worstPair('normal', mode, simulate);
        const aided = worstPair(mode, mode, simulate);

        expect(aided.distance, `${mode} under ${name}`).toBeGreaterThan(unaided.distance);
      }
    });
  }

  it('stays four distinguishable colours to ordinary vision too', () => {
    // Someone with ordinary vision sets this up for someone else, and sees it in the preview
    // either way. A mode that solved the problem by flattening the palette would read as broken.
    for (const mode of MODES) {
      const { distance } = worstPairUnimpaired(mode);

      expect(distance, mode).toBeGreaterThan(20);
    }
  });
});

describe('the normal palette', () => {
  // The one mode that is not this module's to choose: it is what the app already draws, and a
  // token edited in global.css without this following would show the settings preview promising a
  // change from a colour the app no longer uses.
  it('is the Aurora tokens themselves', () => {
    for (const role of ROLES) {
      expect(tokenValue(ROLE_TOKENS[role]), role).toBe(COLOR_VISION_PALETTES.normal[role]);
    }
  });
});

describe('the variables a mode writes', () => {
  it('leaves the accent and everything derived from it alone', () => {
    for (const mode of MODES) {
      const written = Object.keys(paletteVariables(mode));

      expect(written.filter((name) => name.includes('accent')), mode).toEqual([]);
      expect(written.filter((name) => name.includes('aqua')), mode).toEqual([]);
    }
  });

  it('writes each coded hue and its wash', () => {
    expect(Object.keys(paletteVariables('normal')).sort()).toEqual([
      '--amber',
      '--amber-wash',
      '--rose',
      '--rose-wash',
      '--violet',
      '--violet-wash',
    ]);
  });

  it('restores the authored tokens when the setting is off', () => {
    // Switching back is a write, not an undo — so `normal` has to reproduce global.css exactly,
    // washes included, or turning the setting off would leave the app subtly recoloured.
    for (const [token, value] of Object.entries(paletteVariables('normal'))) {
      expect(tokenValue(token), token).toBe(value);
    }
  });

  it('derives a wash at the alpha global.css uses', () => {
    // Locks the derivation against the file it was read off, so a wash restated by hand in
    // global.css at a different weight fails here rather than drifting silently.
    expect(washOf('#e0a84e')).toBe(`rgba(224, 168, 78, ${WASH_ALPHA})`);

    for (const mode of MODES) {
      for (const role of ['amber', 'rose', 'violet'] as const) {
        const wash = parseColor(paletteVariables(mode)[`--${role}-wash`]);

        expect(wash?.a, `${mode}.${role}`).toBe(WASH_ALPHA);
      }
    }
  });
});
