/**
 * The drone as a line. Everything the visualiser draws is derived here: how many
 * waves a pitch is worth, what one of those waves looks like in each voice, and
 * the path that follows from the two.
 *
 * A wave is a sum of partials, which is what a voice is made of anyway — but only
 * the first and the third, because two is as much as the eye can read at this size,
 * and because everything odd-numbered has the property the picture needs: it comes
 * back inverted a wave later. Consecutive waves take opposite sides of the centre
 * on their own then, with no case to switch on, so the drone snakes across the line
 * rather than being mirrored about it. It is also on the centre at whole waves and
 * nowhere else, which is what lets `snakePath` place the crossings by hand.
 *
 * Being a sum of sines is what makes it smooth. The shape this replaced was built
 * from lobes with a hard edge — each a cosine cut off where it reached zero, still
 * travelling — and wherever an edge fell the curve arrived carrying a slope and
 * then went flat. That corner was visible: at every crossing, and twice more inside
 * a wave in Bowed. Nothing here is cut off. Every number a voice differs in only
 * moves a partial, so the curve is smooth at every point of a morph as well.
 */

/**
 * Waves across the line at the bottom and the top of the drone's range: E with
 * the octave switch down, and D# with it up. Those are the real floor and ceiling
 * of a held note — every root is placed at or above E2, so E is always the lowest
 * the bass lands and D# the highest.
 */
const LOW_MIDI = 28;
const HIGH_MIDI = 63;
const LOW_WAVES = 1;
const HIGH_WAVES = 6;

/**
 * Points across the line. Constant in pixels rather than per wave: the thing that
 * has to stay smooth is the drawn curve, and a step of about three pixels is under
 * what the eye resolves at any wave count the drone can reach. The crossings are
 * added on top of these, so this grid never has to line up with them.
 */
const SAMPLES = 128;

const clamp = (value: number, low: number, high: number) => {
  'worklet';
  return Math.min(high, Math.max(low, value));
};

/** What one wave looks like, as the numbers a voice differs in. */
export interface WaveShape {
  /**
   * Weight of the third partial against the first. Zero is the plain sine arc.
   * A little flattens the top, which is what makes an arc wider than it is tall;
   * past about an eighth the top gives way in the middle and the wave becomes two
   * lobes with a dip between them.
   */
  third: number;
  /**
   * Tilt across a wave: how much height it moves from one of its halves to the
   * other. Zero leaves the wave even. It rides on a swing that repeats every wave
   * rather than every second one, so it is the one way a wave can be lopsided and
   * still come back as a clean inversion of itself.
   */
  tilt: number;
  /**
   * How far off the line the voice reaches. It is also what holds a voice inside
   * the canvas: partials add, so a wave with a strong third and a tilt on it stands
   * half again as tall as a plain sine, and Bowed's rise is what brings it level.
   */
  rise: number;
}

/**
 * A drawn wave per voice, keyed the same way the oscillator's partial tables are.
 * Pure is the first partial alone — the sine arc, and the one to read the others
 * against. Warm adds just enough of the third to flatten the top without breaking
 * it, which is what a rounder timbre looks like. Bowed takes enough to split the
 * wave into two lobes with a dip between, and tilts it so the leading lobe is the
 * shorter of the two, the way a stack of partials actually beats against itself.
 */
export const WAVE_SHAPES: Record<string, WaveShape> = {
  pure: { third: 0, tilt: 0, rise: 1 },
  warm: { third: 0.1, tilt: 0, rise: 1 },
  bowed: { third: 0.42, tilt: -0.28, rise: 0.775 },
};

/** Warm is the drone's own default, so it is what an unknown id falls back to. */
export function shapeFor(voiceId: string): WaveShape {
  return WAVE_SHAPES[voiceId] ?? WAVE_SHAPES.warm;
}

/**
 * Waves a pitch is worth. Linear in semitones, so it is linear in the octave: a
 * note halfway up the range in pitch is halfway up it in waves too. Notes from the
 * neck can sit outside the range a chord ever reaches, and they hold at whichever
 * end they passed.
 */
export function wavesFor(midi: number): number {
  'worklet';
  const along = (midi - LOW_MIDI) / (HIGH_MIDI - LOW_MIDI);
  return clamp(LOW_WAVES + along * (HIGH_WAVES - LOW_WAVES), LOW_WAVES, HIGH_WAVES);
}

/**
 * Signed height at `along`, a position measured in waves from the start of the
 * line. The first and third partials give the wave its shape and hand it to the
 * next one upside down; the tilt swings height between the halves of a wave and
 * repeats every wave, so it leaves both the inversion and the zeros where they are.
 */
export function cellHeight(along: number, third: number, tilt: number): number {
  'worklet';
  const theta = Math.PI * along;
  return (Math.sin(theta) + third * Math.sin(3 * theta)) * (1 + tilt * Math.sin(2 * theta));
}

/**
 * One screen of the drone as an open line, to be stroked.
 *
 * `phase` slides the window along the wave in units of whole waves, and it is the
 * only thing the drift animation touches — the path is a window onto a continuous
 * shape rather than a tile that has to repeat, so the wave count is free to be
 * fractional and the drift never has a seam to hide.
 */
export function snakePath(
  width: number,
  waves: number,
  amplitude: number,
  phase: number,
  third: number,
  tilt: number,
): string {
  'worklet';
  let d = '';
  let crossing = Math.floor(phase) + 1;

  for (let i = 0; i <= SAMPLES; i += 1) {
    const along = phase + (i / SAMPLES) * waves;

    // Every crossing the step just passed, put down at its exact place on the
    // line. Nothing here makes the grid land on one, so without this the line
    // would only get as near the centre as the closest sample reached — a height
    // that changed every frame, because the drift is what moves the grid.
    while (crossing < along) {
      const at = ((crossing - phase) / waves) * width;
      d += `${d === '' ? 'M' : 'L'}${Math.round(at * 10) / 10} 0`;
      crossing += 1;
    }

    const x = Math.round((i / SAMPLES) * width * 10) / 10;
    const y = Math.round(-amplitude * cellHeight(along, third, tilt) * 100) / 100;

    d += `${d === '' ? 'M' : 'L'}${x} ${y}`;
  }

  return d;
}

/**
 * The same line, closed back along the centre, so the ground between the two can
 * be filled. Lobes above the line and below it come out wound opposite ways, which
 * under either fill rule is what fills both.
 */
export function underPath(line: string, width: number): string {
  'worklet';
  return `${line}L${Math.round(width * 10) / 10} 0L0 0Z`;
}
