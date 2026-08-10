/** `#rgba` and `#rrggbbaa` — the two hex forms carrying an alpha. */
const HEX_ALPHA = /^#(?:([\da-f]{3})([\da-f])|([\da-f]{6})([\da-f]{2}))$/i;

/** `rgb()` / `rgba()` / `hsl()` / `hsla()`, captured as name and argument list. */
const FUNCTIONAL = /^(rgba?|hsla?)\(([^)]*)\)$/i;

/**
 * Separate a colour into an opaque colour and its alpha.
 *
 * An SVG gradient stop cannot be handed a translucent colour: react-native-svg
 * builds each stop from `stopColor`'s RGB and `stopOpacity` alone, masking off
 * whatever alpha the colour itself carried, so an `rgba()` token painted
 * straight into a `<Stop>` comes out fully opaque. Splitting it hands the alpha
 * over on the prop that survives. A colour it cannot read comes back untouched
 * at full opacity, which is what any opaque colour returns anyway.
 */
export function splitAlpha(color: string): { color: string; opacity: number } {
  const trimmed = color.trim();
  const opaque = { color: trimmed, opacity: 1 };

  const hex = HEX_ALPHA.exec(trimmed);
  if (hex) {
    const [, short, nibble, long, byte] = hex;
    return short
      ? { color: `#${short}`, opacity: parseInt(nibble + nibble, 16) / 255 }
      : { color: `#${long}`, opacity: parseInt(byte, 16) / 255 };
  }

  const functional = FUNCTIONAL.exec(trimmed);
  if (!functional) return opaque;

  const [, name, body] = functional;
  const base = name.endsWith('a') || name.endsWith('A') ? name.slice(0, -1) : name;

  // Both syntaxes put the alpha last: `h, s, l, a` or `h s l / a`. Whatever
  // precedes it is kept verbatim so component units survive the round trip.
  const slash = body.split('/');
  if (slash.length === 2) {
    const opacity = toAlpha(slash[1]);
    return opacity === null ? opaque : { color: `${base}(${slash[0].trim()})`, opacity };
  }

  const parts = body.split(',');
  if (parts.length !== 4) return opaque;

  const opacity = toAlpha(parts[3]);
  if (opacity === null) return opaque;

  return {
    color: `${base}(${parts
      .slice(0, 3)
      .map((part) => part.trim())
      .join(', ')})`,
    opacity,
  };
}

/** An alpha component as a 0–1 number, or `null` if it is not one. */
function toAlpha(value: string): number | null {
  const text = value.trim();
  const number = text.endsWith('%') ? Number(text.slice(0, -1)) / 100 : Number(text);
  if (text === '' || Number.isNaN(number)) return null;
  return Math.min(Math.max(number, 0), 1);
}

export interface Rgba {
  /** Channels on 0–255, alpha on 0–1. */
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Any hex colour, of whichever length; the digit count is checked after. */
const HEX = /^#([\da-f]+)$/i;

/** Components of an `rgb()` / `rgba()`, however they are separated. */
const RGB = /^rgba?\(([^)]*)\)$/i;

/**
 * A colour as its channels, or `null` if it is not one this can read — hex and
 * `rgb()` are what the Aurora tokens are written in, and a caller that needs to
 * do arithmetic has to be able to refuse anything else rather than guess at it.
 */
export function parseColor(color: string): Rgba | null {
  const trimmed = color.trim();

  const hex = HEX.exec(trimmed);
  if (hex) {
    const digits = hex[1];
    // Three or four digits are the shorthand, where each stands for a pair.
    const size = digits.length <= 4 ? 1 : 2;
    if (digits.length !== size * 3 && digits.length !== size * 4) return null;

    const channel = (index: number) => {
      const digit = digits.slice(index * size, index * size + size);
      return parseInt(size === 1 ? digit + digit : digit, 16);
    };

    return {
      r: channel(0),
      g: channel(1),
      b: channel(2),
      a: digits.length === size * 4 ? channel(3) / 255 : 1,
    };
  }

  const rgb = RGB.exec(trimmed);
  if (!rgb) return null;

  const parts = rgb[1].split(/[\s,/]+/).filter((part) => part !== '');
  if (parts.length < 3 || parts.length > 4) return null;

  const channels = parts.slice(0, 3).map(toChannel);
  if (channels.some((channel) => channel === null)) return null;

  const alpha = parts.length === 4 ? toAlpha(parts[3]) : 1;
  if (alpha === null) return null;

  const [r, g, b] = channels as number[];
  return { r, g, b, a: alpha };
}

/**
 * A colour part of the way from one to another.
 *
 * Mixed premultiplied: each colour contributes in proportion to how much of it
 * is actually there, so a nearly-transparent white blended with an opaque dark
 * stays dark instead of passing through a washed-out grey on the way. Colours
 * this cannot read fall back to the nearer end rather than to an approximation.
 */
export function mixColors(from: string, to: string, position: number): string {
  const start = parseColor(from);
  const end = parseColor(to);
  const t = Math.min(Math.max(position, 0), 1);

  if (!start || !end) return t < 0.5 ? from : to;

  const alpha = start.a + (end.a - start.a) * t;
  const channel = (a: number, b: number) => {
    if (alpha === 0) return 0;
    const weighted = a * start.a + (b * end.a - a * start.a) * t;
    return Math.round(weighted / alpha);
  };

  const r = channel(start.r, end.r);
  const g = channel(start.g, end.g);
  const b = channel(start.b, end.b);

  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
}

/** A colour channel as a 0–255 number, or `null` if it is not one. */
function toChannel(value: string): number | null {
  const text = value.trim();
  const number = text.endsWith('%') ? (Number(text.slice(0, -1)) / 100) * 255 : Number(text);
  if (text === '' || Number.isNaN(number)) return null;
  return Math.min(Math.max(number, 0), 255);
}
