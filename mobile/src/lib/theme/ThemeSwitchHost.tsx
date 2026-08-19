import {
  Canvas,
  Circle,
  Group,
  Image as Picture,
  RadialGradient,
} from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { BackHandler, useWindowDimensions, View } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import { WindowOverlay } from '@/components/WindowOverlay';

import { revealRadius, type Point } from './reveal';
import { themeFrozen, themeRevealed, useThemeReveal, useThemeWarming, type Reveal } from './switch';

const Surface = withUniwind(Canvas);

/** How long the hole takes to clear the furthest corner of the screen. */
const REVEAL_MS = 500;

/**
 * The radius the hole starts at. A fingertip rather than a point: opening from nothing reads as a
 * dot appearing and then growing, where this reads as the press itself spreading out.
 */
const SEED = 20;

/** A frame's grace after the hole lands, so the last of it is drawn before any of it is taken. */
const TAIL_MS = 32;

/**
 * How wide the soft edge is, in points.
 *
 * A fixed width rather than a fraction of the radius, so the edge looks the same the whole way
 * across. Scaling it with the circle would start as a barely-there smudge and end as a hundred-point
 * blur, which reads as the edge going out of focus rather than as one edge travelling.
 */
const FEATHER = 64;

/**
 * The coverage the hole is cut with — how much of the photograph to take, not what colour to paint.
 *
 * Opaque out to the start of the feather, then down to nothing at its outer rim. Drawn in
 * `dstOut`, so only the alpha of these is read: black is "take all of it" and transparent is
 * "leave it alone". Nothing here is a design colour and none of it is ever seen, which is why
 * these are literals rather than tokens.
 */
const COVERAGE = ['rgba(0,0,0,1)', 'rgba(0,0,0,1)', 'rgba(0,0,0,0)'];

/** Stands in for the origin while the stage is up and there is nothing on it. */
const NOWHERE: Point = { x: 0, y: 0 };

/**
 * Runs once the frame after next.
 *
 * The image arrives already made, but made is not drawn: Skia decodes lazily, on its own thread, the
 * first time something asks to paint it. What happens the instant it lands is the whole app
 * repainting into another palette, so two frames of a photograph nobody can tell from the screen it
 * covers is a cheaper mistake than one frame of the change being seen.
 */
function whenDrawn(run: () => void): () => void {
  let inner = 0;
  const outer = requestAnimationFrame(() => {
    inner = requestAnimationFrame(run);
  });

  return () => {
    cancelAnimationFrame(outer);
    cancelAnimationFrame(inner);
  };
}

/**
 * Where a change of appearance plays. Mounted once, by the root layout.
 *
 * In a window overlay so that it is above a route the navigator presents as a modal, and below the
 * toasts and the curtain rather than over them — what it holds up is a photograph, and one of those
 * talking over the app should still be able to talk over a photograph of it.
 *
 * The stage goes up on the press and comes down when the switch ends, rather than arriving with the
 * photograph. Creating a canvas is creating a native view and a drawing surface, which measurement
 * found sitting squarely between the photograph being ready and the theme going on — so it happens
 * while the finger is still down, alongside the capture, and the choice arrives to a canvas that
 * already exists.
 */
export function ThemeSwitchHost() {
  const reveal = useThemeReveal();
  const warming = useThemeWarming();

  return <WindowOverlay>{warming || reveal ? <Stage reveal={reveal} /> : null}</WindowOverlay>;
}

/**
 * The canvas, and the old screen on it once there is one, with a soft-edged hole opening out of the
 * point that was pressed.
 *
 * Drawn by Skia rather than by anything React Native composes itself, and that is the whole design
 * rather than a preference. What is wanted is the photograph *minus* a circle, and subtracting one
 * thing from another is a blend mode — `dstOut`, which keeps the destination in proportion to what
 * the source does not cover. React Native has no such blend, and `react-native-svg`'s `Mask` has it
 * only on the CPU: it allocates two full-screen bitmaps per frame, walks every pixel to turn
 * luminance into alpha, and blits the result three more times, all on the UI thread. Skia does the
 * same subtraction on the GPU as two draws.
 *
 * The soft edge falls out of the same decision for free. The circle is painted with a radial
 * gradient that fades over its last `FEATHER` points, so `dstOut` takes all of the photograph in
 * the middle, less and less of it across the edge, and none beyond — which is a gradient rather
 * than a cut, and costs a shader rather than a second pass.
 *
 * Every hook is here rather than among the Skia elements below, and deliberately: those are rendered
 * by a reconciler of Skia's own, and whether it runs effects on the same terms React does is not
 * something this should be built on. What goes inside the canvas is elements and nothing else.
 *
 * Only the radius moves. The photograph, the layer and the gradient's shape are all fixed, so each
 * frame is the same two draws with one number changed, and the number lives on the UI thread —
 * there is no React render in the half second and no JavaScript in the loop.
 */
function Stage({ reveal }: { reveal: Reveal | null }) {
  const { width, height } = useWindowDimensions();

  const id = reveal?.id ?? 0;
  const origin = reveal?.origin ?? NOWHERE;
  const opening = reveal?.opening ?? false;

  // Far enough that the *solid* part of the hole clears the furthest corner. Stopping at the corner
  // itself would leave the feather lying across it — a soft grey ring of the old screen, thinnest
  // where the eye is least likely to be, and still there when the photograph came down.
  const radius = revealRadius(origin, { width, height }) + FEATHER;

  const hole = useSharedValue(SEED);

  useEffect(() => {
    if (!reveal || opening) return;
    return whenDrawn(() => themeFrozen(id));
  }, [id, opening, reveal]);

  // Shut, then opened, in the one effect — this stage outlives any one reveal, so the hole the last
  // switch left wide has to be closed again by hand where a mounting component would have arrived
  // with it closed. Both in the same place because a shared value written from two effects is a
  // shared value with two owners, which the compiler refuses and is right to.
  //
  // Closed is where it waits until the theme is actually on underneath. It is a hole the size of a
  // fingertip over an identical screen, so waiting there is invisible — where opening it onto a
  // screen that has not repainted yet would be a hole showing the old palette through the old one.
  useEffect(() => {
    if (!opening) {
      hole.value = SEED;
      return;
    }

    hole.value = withTiming(radius, { duration: REVEAL_MS, easing: Easing.out(Easing.cubic) });
    const done = setTimeout(() => themeRevealed(id), REVEAL_MS + TAIL_MS);

    return () => clearTimeout(done);
  }, [hole, id, opening, radius]);

  // Swallowed for the same reason the touches are: what is under this is a screen mid-change, and
  // on Android a press would otherwise pop a route nobody can see. Only once there is something to
  // look at — while the stage is empty the press that raised it is still going on.
  const locked = reveal !== null;

  useEffect(() => {
    if (!locked) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [locked]);

  // Where along the radius the fade starts. Held to half the radius while the hole is smaller than
  // the feather is wide, so the seed opens as a soft dot rather than as a smudge with no middle.
  const edge = useDerivedValue(() => {
    const soft = Math.min(FEATHER, hole.value / 2) / hole.value;

    return [0, 1 - soft, 1];
  });

  return (
    <>
      {/* Deaf to touches of its own. While the stage is empty the finger that raised it is still
          on the control underneath, and once there is a photograph the view below takes everything
          anyway. */}
      <Surface className="pointer-events-none absolute inset-0">
        {reveal ? (
          // The blend is against this layer rather than against the canvas, so what the circle
          // subtracts from is the photograph and nothing else. One offscreen texture for the whole
          // half second, which the GPU holds anyway.
          <Group layer>
            <Picture image={reveal.before} x={0} y={0} width={width} height={height} fit="fill" />
            <Circle c={origin} r={hole} blendMode="dstOut">
              <RadialGradient c={origin} r={hole} colors={COVERAGE} positions={edge} />
            </Circle>
          </Group>
        ) : null}
      </Surface>

      {/* Takes every touch for as long as there is a photograph up, which is the whole of the lock:
          nothing below can be pressed, scrolled or swiped, so no route travels and no tab changes
          while the screen the gesture was aimed at is a photograph of somewhere the app has already
          left. After the canvas, and so above it — a hit test has to land on something even where
          the picture has been cut away. */}
      {locked ? (
        <View
          className="absolute inset-0"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}
    </>
  );
}
