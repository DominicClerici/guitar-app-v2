import {
  BlurMask,
  Canvas,
  Group,
  Image as Picture,
  RoundedRect,
  Skia,
} from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { BackHandler, useWindowDimensions, View } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import { WindowOverlay } from '@/components/WindowOverlay';

import { revealBleed, revealFrame, type Point } from './reveal';
import { themeFrozen, themeRevealed, useThemeReveal, useThemeWarming, type Reveal } from './switch';

const Surface = withUniwind(Canvas);

/** How long the hole takes to clear the furthest corner of the screen. */
const REVEAL_MS = 1000;

/**
 * How wide the hole is when it starts, in points.
 *
 * A fingertip, and square: a press has not picked a direction yet, and starting on the screen's own
 * proportions would have the shape arrive already knowing where it was going.
 */
const SEED = 0;

/** The rounding of the hole's corners, at the moment it is exactly the size of the screen. */
const CORNER = 56;

/**
 * How much of the old screen is still there when the hole lands.
 *
 * The photograph thins as the hole opens, so what is outside it is not the old appearance held
 * perfectly still until the edge sweeps it away — it is already halfway to the new one by the time
 * the edge arrives. That gives the whole screen something to do for the whole animation, and leaves
 * the shape reading as the leading edge of a change rather than as the change itself.
 *
 * Half rather than none, because a photograph that reached nothing would be a plain cross-fade with
 * a shape drawn on it, and the shape would stop meaning anything. It never gets seen at exactly
 * this value either: by the time the fade lands, the hole has covered the screen.
 */
const SETTLED = 0;

/**
 * The one curve everything travels on: quickest out of the press, settling as it reaches the edges.
 *
 * The shape and the fade share it because they are one movement seen two ways, and two curves over
 * one duration read as two things happening at once. A square rather than a higher power of the
 * same family — those spend so much of the distance in the first few frames that the shape is past
 * the edges before the fade has visibly started.
 */
const PACE = Easing.bezier(0.33, 1, 0.68, 1);

/** A frame's grace after the hole lands, so the last of it is drawn before any of it is taken. */
const TAIL_MS = 32;

/**
 * How soft the hole's edge is: the blur's sigma, in points.
 *
 * A normal blur reaches about two sigma each way, so the photograph fades out across a band of
 * roughly four times this — near enough what the circle's radial gradient used to do, and now
 * following an outline rather than a radius.
 */
const FEATHER = 8;

/** Where the hole stops, as points past the screen. See `revealBleed` — this is the whole of it. */
const BLEED = revealBleed(CORNER, FEATHER) * -0.1;

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
 * The canvas, and the old screen on it once there is one, with a soft-edged hole in the shape of
 * the phone opening out of the point that was pressed.
 *
 * Drawn by Skia rather than by anything React Native composes itself, and that is the whole design
 * rather than a preference. What is wanted is the photograph *minus* a shape, and subtracting one
 * thing from another is a blend mode — `dstOut`, which keeps the destination in proportion to what
 * the source does not cover. React Native has no such blend, and `react-native-svg`'s `Mask` has it
 * only on the CPU: it allocates two full-screen bitmaps per frame, walks every pixel to turn
 * luminance into alpha, and blits the result three more times, all on the UI thread. Skia does the
 * same subtraction on the GPU as two draws.
 *
 * The hole is a rectangle drawn afresh each frame rather than one shape under a moving matrix, and
 * that is what lets it be square on the press and screen-shaped when it lands: a rectangle asked
 * for those numbers has true round corners at every moment, where the same outline reached by
 * scaling one axis would have oval ones. It costs four sums and a rounded rect per frame, all on
 * the UI thread. The soft edge is a blur on that shape's own paint, which follows an outline the
 * way a radial gradient could only follow a radius — and needs no undoing now that nothing is
 * scaled, since a blur is only ever measured in the space it is drawn in.
 *
 * Every hook is here rather than among the Skia elements below, and deliberately: those are rendered
 * by a reconciler of Skia's own, and whether it runs effects on the same terms React does is not
 * something this should be built on. What goes inside the canvas is elements and nothing else.
 *
 * One number moves, and it is not React's. The photograph and the layer are fixed and the draws
 * never change, so a frame is a rectangle worked out from a single eased value on the UI thread —
 * there is no render in the whole animation and no JavaScript in the loop.
 */
function Stage({ reveal }: { reveal: Reveal | null }) {
  const { width, height } = useWindowDimensions();

  const id = reveal?.id ?? 0;
  const origin = reveal?.origin ?? NOWHERE;
  const opening = reveal?.opening ?? false;

  const screen = { width, height };

  const progress = useSharedValue(0);

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
      progress.value = 0;
      return;
    }

    progress.value = withTiming(1, { duration: REVEAL_MS, easing: PACE });
    const done = setTimeout(() => themeRevealed(id), REVEAL_MS + TAIL_MS);

    return () => clearTimeout(done);
  }, [id, opening, progress]);

  // Swallowed for the same reason the touches are: what is under this is a screen mid-change, and
  // on Android a press would otherwise pop a route nobody can see. Only once there is something to
  // look at — while the stage is empty the press that raised it is still going on.
  const locked = reveal !== null;

  useEffect(() => {
    if (!locked) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [locked]);

  // The rounding arrives with the shape, so that what grows out of the press is a rounded square
  // rather than a sharp one that softens later.
  const hole = useDerivedValue(() => {
    const frame = revealFrame(origin, screen, SEED, BLEED, progress.value);
    const round = CORNER * progress.value;

    return Skia.RRectXY(Skia.XYWHRect(frame.x, frame.y, frame.width, frame.height), round, round);
  });

  // The photograph and the shape are the same movement, so the fade comes off the same eased clock
  // rather than a second animation told to match it.
  const held = useDerivedValue(() => 1 - (1 - SETTLED) * progress.value);

  // Capped against the shape's own width, so the first frames are a soft dot rather than something
  // blurred so far past its own size that there is no middle left of it.
  const feather = useDerivedValue(() => Math.min(FEATHER, hole.value.rect.width / 4));

  return (
    <>
      {/* Deaf to touches of its own. While the stage is empty the finger that raised it is still
          on the control underneath, and once there is a photograph the view below takes everything
          anyway. */}
      <Surface className="pointer-events-none absolute inset-0">
        {reveal ? (
          // The blend is against this layer rather than against the canvas, so what the shape
          // subtracts from is the photograph and nothing else. One offscreen texture for the whole
          // animation, which the GPU holds anyway.
          <Group layer>
            {/* The thinning belongs to the image and not to the group around it: a group's opacity
                in Skia is handed down to each child's paint rather than applied to the result, so
                putting it above would have dimmed the hole too — and a shape drawn at half alpha in
                `dstOut` takes only half the photograph, which is something you can see through
                rather than a hole. */}
            <Picture
              image={reveal.before}
              x={0}
              y={0}
              width={width}
              height={height}
              fit="fill"
              opacity={held}
            />
            <RoundedRect rect={hole} blendMode="dstOut">
              <BlurMask blur={feather} style="normal" />
            </RoundedRect>
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
