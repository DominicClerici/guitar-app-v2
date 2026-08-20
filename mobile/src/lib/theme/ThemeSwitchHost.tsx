import MaskedView from '@react-native-masked-view/masked-view';
import { BlurMask, Canvas, Fill, Group, RoundedRect, Skia } from '@shopify/react-native-skia';
import { useEffect, type ReactNode } from 'react';
import { BackHandler, useWindowDimensions } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { ScopedTheme, withUniwind, type ThemeName } from 'uniwind';

import { WindowOverlay } from '@/components/WindowOverlay';

import { revealBleed, revealFrame, type Point } from './reveal';
import {
  themeFrozen,
  themeRevealed,
  useFrozenPalette,
  useThemeReveal,
  type Reveal,
} from './switch';

const Surface = withUniwind(Canvas);
const Masked = withUniwind(MaskedView);

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
 * The copy thins as the hole opens, so what is outside it is not the old appearance held perfectly
 * still until the edge sweeps it away — it is already halfway to the new one by the time the edge
 * arrives. That gives the whole screen something to do for the whole animation, and leaves the
 * shape reading as the leading edge of a change rather than as the change itself.
 *
 * Half rather than none, because a copy that reached nothing would be a plain cross-fade with a
 * shape drawn on it, and the shape would stop meaning anything. It never gets seen at exactly this
 * value either: by the time the fade lands, the hole has covered the screen.
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
 * A normal blur reaches about two sigma each way, so the copy fades out across a band of roughly
 * four times this — near enough what the circle's radial gradient used to do, and now following an
 * outline rather than a radius.
 */
const FEATHER = 8;

/** Where the hole stops, as points past the screen. See `revealBleed` — this is the whole of it. */
const BLEED = revealBleed(CORNER, FEATHER) * -0.1;

/** Stands in for the origin while the stage is up and there is nothing on it. */
const NOWHERE: Point = { x: 0, y: 0 };

/**
 * Runs `first` on the next frame and `then` on the one after it.
 *
 * The copy is mounted and laid out long before this — it went up with the press — but the frame it
 * is finally shown on is not a frame anything can be done in. So the cover goes up on one frame and
 * the theme goes on the next, which is the difference between the app changing underneath something
 * and the app changing underneath nothing.
 */
function acrossFrames(first: () => void, then: () => void): () => void {
  let inner = 0;
  const outer = requestAnimationFrame(() => {
    first();
    inner = requestAnimationFrame(then);
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
 * toasts and the curtain rather than over them — what it holds up is a still copy of the screen,
 * and one of those talking over the app should still be able to talk over a copy of it.
 *
 * The stage goes up on the press and comes down when the switch ends. Rendering a screen's worth of
 * components is the slowest step in a switch and it does not depend on which appearance is chosen,
 * so it happens while the finger is still down and the choice arrives to a copy that already
 * exists — laid out, measured, and drawn with nothing showing of it.
 *
 * `screen` is that copy: the app's own components, given to this from the root layout rather than
 * reached for from here, so that nothing under `lib/` has to know what the app's screens are.
 */
export function ThemeSwitchHost({ screen }: { screen: ReactNode }) {
  const palette = useFrozenPalette();
  const reveal = useThemeReveal();

  return (
    <WindowOverlay>
      {palette ? (
        <Stage palette={palette} reveal={reveal}>
          {screen}
        </Stage>
      ) : null}
    </WindowOverlay>
  );
}

/**
 * The copy of the screen, pinned to the palette being left, with a soft-edged hole in the shape of
 * the phone opening out of the point that was pressed.
 *
 * The hole is cut by Skia through a mask, and that is the whole design rather than a preference.
 * What is wanted is the copy *minus* a shape, and subtracting one thing from another is a blend
 * mode — `dstOut`, which keeps the destination in proportion to what the source does not cover.
 * React Native has no such blend: `mixBlendMode` carries the CSS blend modes, and `destination-out`
 * is a compositing operator rather than one of them. So the subtraction is done where it can be —
 * on a canvas of its own, in one draw — and the result is handed to `MaskedView` as an alpha mask
 * for the copy. On iOS that is `UIView.maskView`, which is the compositor's own masking rather than
 * anything walked pixel by pixel.
 *
 * The shape is a rectangle drawn afresh each frame rather than one shape under a moving matrix, and
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
 * Two numbers move, and neither is React's. The copy is still and the draws never change, so a
 * frame is a rectangle worked out from a single eased value on the UI thread — there is no render
 * in the whole animation and no JavaScript in the loop.
 */
function Stage({
  palette,
  reveal,
  children,
}: {
  palette: ThemeName;
  reveal: Reveal | null;
  children: ReactNode;
}) {
  const { width, height } = useWindowDimensions();

  const id = reveal?.id ?? 0;
  const origin = reveal?.origin ?? NOWHERE;
  const opening = reveal?.opening ?? false;

  const screen = { width, height };

  const progress = useSharedValue(0);
  // Whether the copy is showing at all. Zero for as long as the stage is only warming: the finger
  // is still on the control underneath, and a press that answers with somebody else's copy of the
  // control is a press that does not answer.
  const cover = useSharedValue(0);

  // Raised, then opened, in the one effect — this stage outlives no reveal but does precede one, so
  // it has to go from showing nothing to showing everything by hand. Both in the same place because
  // a shared value written from two effects is a shared value with two owners, which the compiler
  // refuses and is right to.
  useEffect(() => {
    if (!reveal) {
      cover.value = 0;
      return;
    }

    if (opening) return;

    return acrossFrames(
      () => {
        cover.value = 1;
      },
      () => themeFrozen(id),
    );
  }, [cover, id, opening, reveal]);

  useEffect(() => {
    if (!opening) {
      progress.value = 0;
      return;
    }

    progress.value = withTiming(1, { duration: REVEAL_MS, easing: PACE });
    const done = setTimeout(() => themeRevealed(id), REVEAL_MS + TAIL_MS);

    return () => clearTimeout(done);
  }, [id, opening, progress]);

  // The one thing still swallowed, and the only one that has to be: a touch during the reveal lands
  // on the real screen, already in its new appearance, and is answered properly — but a hardware
  // back press is not a touch on anything, and popping a route out from under a copy of the screen
  // it was pushed from is the one gesture the app cannot make good on.
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

  // The copy and the shape are the same movement, so the fade comes off the same eased clock rather
  // than a second animation told to match it.
  const held = useDerivedValue(() => cover.value * (1 - (1 - SETTLED) * progress.value));

  // Capped against the shape's own width, so the first frames are a soft dot rather than something
  // blurred so far past its own size that there is no middle left of it.
  const feather = useDerivedValue(() => Math.min(FEATHER, hole.value.rect.width / 4));

  return (
    <Masked
      className="absolute inset-0"
      // Deaf to touches, which is the whole of the difference this makes: what is under it is the
      // real screen in its final state, so every press, scroll and swipe goes straight through to
      // the app that is going to answer for them anyway.
      pointerEvents="none"
      // And unreadable, for the same reason it is untouchable. There is one settings screen; this
      // is a picture of it drawn out of components, and a screen reader offered both would find two.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      maskElement={
        <Surface className="absolute inset-0">
          {/* The blend is against this layer rather than against the canvas, so what the shape
              subtracts from is the covering and nothing else. One offscreen texture for the whole
              animation, which the GPU holds anyway. */}
          <Group layer>
            {/* Black only because a mask is read for its alpha and never for its colour. The
                thinning belongs to this fill and not to the group around it: a group's opacity in
                Skia is handed down to each child's paint rather than applied to the result, so
                putting it above would have dimmed the hole too — and a shape drawn at half alpha in
                `dstOut` takes only half the covering, which is something you can see through rather
                than a hole. */}
            <Fill color="black" opacity={held} />
            <RoundedRect rect={hole} blendMode="dstOut">
              <BlurMask blur={feather} style="normal" />
            </RoundedRect>
          </Group>
        </Surface>
      }
    >
      {/* Pinned to the palette the app is leaving. Everything under here resolves its classes and
          its tokens through uniwind's context rather than its global theme, so the copy stays as it
          was while the app underneath repaints — one context, reaching exactly as far as the app's
          own `@theme inline` bridge does, which is every class and every `useToken` in it. */}
      <ScopedTheme theme={palette}>{children}</ScopedTheme>
    </Masked>
  );
}
