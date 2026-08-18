/**
 * Colour vision simulation and perceptual distance, for checking the palettes.
 *
 * Nothing in the app imports this — it exists so `palettes.test.ts` can assert that a palette does
 * the job it claims to, rather than asserting that four strings differ, which is what a test of
 * hand-picked colours otherwise amounts to. Metro only bundles what is reachable from the entry,
 * so leaving it unexported from `index.ts` keeps it out of the app.
 *
 * Two models rather than one. They disagree by a few units and are built from different premises —
 * Brettel projects onto the half-planes a dichromat's gamut collapses to, Machado derives a
 * shift-based matrix from the cone response — so a palette that only clears the floor under one of
 * them has been fitted to a model rather than to an eye.
 */

/** Brettel, Viénot & Mollon 1997, as parameterised by libDaltonLens. Operates on linear RGB. */
const BRETTEL = {
  protanopia: {
    first: [0.1451, 1.20165, -0.34675, 0.10447, 0.85316, 0.04237, 0.00429, -0.00603, 1.00174],
    second: [0.14115, 1.16782, -0.30897, 0.10495, 0.8573, 0.03776, 0.00431, -0.00586, 1.00155],
    normal: [0.00048, 0.00416, -0.00464],
  },
  deuteranopia: {
    first: [0.36198, 0.86755, -0.22953, 0.26099, 0.66896, 0.07006, -0.01771, 0.02366, 0.99405],
    second: [0.37009, 0.8854, -0.25549, 0.25767, 0.63782, 0.10451, -0.0195, 0.02741, 0.99209],
    normal: [-0.00281, -0.00611, 0.00892],
  },
  tritanopia: {
    first: [1.01354, 0.14268, -0.15622, -0.01181, 0.87561, 0.13619, 0.07707, 0.81208, 0.11085],
    second: [0.93337, 0.19999, -0.13336, 0.05809, 0.82565, 0.11626, -0.37923, 1.13825, 0.24098],
    normal: [0.0396, -0.02831, -0.01129],
  },
} as const;

/** Machado, Oliveira & Fernandes 2009, at severity 1.0. Also linear RGB. */
const MACHADO = {
  protanopia: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deuteranopia: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  tritanopia: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039],
} as const;

export type Dichromacy = keyof typeof MACHADO;

export const DICHROMACIES: readonly Dichromacy[] = ['protanopia', 'deuteranopia', 'tritanopia'];

type Rgb = [number, number, number];

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function fromHex(hex: string): Rgb {
  const value = parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function toHex(rgb: Rgb): string {
  const channel = (c: number) =>
    Math.round(Math.min(1, Math.max(0, c)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${rgb.map(channel).join('')}`;
}

const apply = (m: readonly number[], [r, g, b]: Rgb): Rgb => [
  m[0] * r + m[1] * g + m[2] * b,
  m[3] * r + m[4] * g + m[5] * b,
  m[6] * r + m[7] * g + m[8] * b,
];

/** A colour as a dichromat sees it, under Brettel 1997. */
export function brettel(hex: string, kind: Dichromacy): string {
  const { first, second, normal } = BRETTEL[kind];
  const linear = fromHex(hex).map(toLinear) as Rgb;
  const side = linear[0] * normal[0] + linear[1] * normal[1] + linear[2] * normal[2];

  return toHex(apply(side >= 0 ? first : second, linear).map(toGamma) as Rgb);
}

/** The same, under Machado 2009 at full severity. */
export function machado(hex: string, kind: Dichromacy): string {
  const linear = fromHex(hex).map(toLinear) as Rgb;

  return toHex(apply(MACHADO[kind], linear).map(toGamma) as Rgb);
}

export const MODELS = { brettel, machado } as const;

/** CIE L\*a\*b\* under D65. */
export function lab(hex: string): [number, number, number] {
  const [r, g, b] = fromHex(hex).map(toLinear);
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29);
  const [fx, fy, fz] = [f(x), f(y), f(z)];

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/**
 * CIEDE2000 — how far apart two colours look, in units where ~1 is the smallest difference anyone
 * can see at all and ~2.3 is the classic just-noticeable threshold.
 */
export function deltaE(first: string, second: string): number {
  const [l1, a1, b1] = lab(first);
  const [l2, a2, b2] = lab(second);

  const c1 = Math.hypot(a1, b1);
  const c2 = Math.hypot(a2, b2);
  const meanC = (c1 + c2) / 2;
  const g = 0.5 * (1 - Math.sqrt(meanC ** 7 / (meanC ** 7 + 25 ** 7)));

  const ap1 = (1 + g) * a1;
  const ap2 = (1 + g) * a2;
  const cp1 = Math.hypot(ap1, b1);
  const cp2 = Math.hypot(ap2, b2);

  const hue = (a: number, b: number) => {
    if (a === 0 && b === 0) return 0;
    const degrees = (Math.atan2(b, a) * 180) / Math.PI;
    return degrees < 0 ? degrees + 360 : degrees;
  };
  const hp1 = hue(ap1, b1);
  const hp2 = hue(ap2, b2);

  const dL = l2 - l1;
  const dC = cp2 - cp1;

  let dh = 0;
  if (cp1 * cp2 !== 0) {
    dh = hp2 - hp1;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(cp1 * cp2) * Math.sin((dh * Math.PI) / 360);

  const meanL = (l1 + l2) / 2;
  const meanCp = (cp1 + cp2) / 2;

  let meanH: number;
  if (cp1 * cp2 === 0) meanH = hp1 + hp2;
  else if (Math.abs(hp1 - hp2) > 180) meanH = (hp1 + hp2 + (hp1 + hp2 < 360 ? 360 : -360)) / 2;
  else meanH = (hp1 + hp2) / 2;

  const rad = (degrees: number) => (degrees * Math.PI) / 180;
  const t =
    1 -
    0.17 * Math.cos(rad(meanH - 30)) +
    0.24 * Math.cos(rad(2 * meanH)) +
    0.32 * Math.cos(rad(3 * meanH + 6)) -
    0.2 * Math.cos(rad(4 * meanH - 63));

  const sL = 1 + (0.015 * (meanL - 50) ** 2) / Math.sqrt(20 + (meanL - 50) ** 2);
  const sC = 1 + 0.045 * meanCp;
  const sH = 1 + 0.015 * meanCp * t;

  const rotation =
    -Math.sin(rad(60 * Math.exp(-(((meanH - 275) / 25) ** 2)))) *
    (2 * Math.sqrt(meanCp ** 7 / (meanCp ** 7 + 25 ** 7)));

  return Math.sqrt(
    (dL / sL) ** 2 + (dC / sC) ** 2 + (dH / sH) ** 2 + rotation * (dC / sC) * (dH / sH),
  );
}

/** WCAG relative luminance contrast, for checking a hue still reads against the page. */
export function contrastRatio(first: string, second: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = fromHex(hex).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
}
