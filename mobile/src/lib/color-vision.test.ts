import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { colorVision } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import { parseColor } from './color';
import { COLOR_VISION_PALETTES, huePalette, type HueRole } from './color-vision';

const MODES = colorVision.options;
const ROLES: HueRole[] = ['accent', 'amber', 'rose', 'violet'];

/** The token each role is drawn from when nothing is adjusting the palette. */
const ROLE_TOKENS: Record<HueRole, string> = {
  accent: '--accent',
  amber: '--amber',
  rose: '--rose',
  violet: '--violet',
};

function tokenValue(css: string, token: string): string | null {
  return new RegExp(`^\\s*${token}:\\s*([^;]+);`, 'm').exec(css)?.[1].trim() ?? null;
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

  it('keeps the four roles apart within a mode', () => {
    // Not a model of how any of these are perceived — that is what the values themselves are for.
    // This is the floor under it: four roles that are four colours, so a palette cannot be typed
    // with a repeated value and still look deliberate.
    for (const mode of MODES) {
      const drawn = ROLES.map((role) => huePalette(mode)[role]);

      expect(new Set(drawn).size, mode).toBe(ROLES.length);
    }
  });
});

describe('the normal palette', () => {
  // The one mode that is not this module's to choose: it is what the app already draws, and a
  // token edited in global.css without this following would show the settings preview promising a
  // change from a colour the app no longer uses.
  const css = readFileSync(fileURLToPath(new URL('../global.css', import.meta.url)), 'utf8');

  it('is the Aurora tokens themselves', () => {
    for (const role of ROLES) {
      expect(tokenValue(css, ROLE_TOKENS[role]), role).toBe(COLOR_VISION_PALETTES.normal[role]);
    }
  });
});
