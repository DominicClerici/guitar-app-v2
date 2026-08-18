import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { BackHandler, useWindowDimensions } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

import { AnimatedView } from '@/components/AnimatedView';
import { WindowOverlay } from '@/components/WindowOverlay';

import { revealRadius, type Point } from './reveal';
import {
  themeAbandoned,
  themeFading,
  themeFrozen,
  themeRevealed,
  useThemeReveal,
  type Reveal,
} from './switch';

/** `expo-image`'s `Image` is third-party, so it has to be given `className` (see `AccountAvatar`). */
const Picture = withUniwind(Image);

/** How long the new screen takes to reach the furthest corner of the old one. */
const REVEAL_MS = 500;

/**
 * The radius the circle starts at. A fingertip rather than a point: opening from nothing reads as
 * a dot appearing and then growing, where this reads as the press itself spreading out.
 */
const SEED = 20;

/** A frame's grace after the circle lands, so the last of it is drawn before any of it is taken. */
const TAIL_MS = 32;

/** The way out when there is no second photograph to open up — see `switch.ts`. */
const FADE_MS = 200;

/**
 * Where a change of appearance plays. Mounted once, by the root layout.
 *
 * In a window overlay so that it is above a route the navigator presents as a modal, and below the
 * toasts and the curtain rather than over them — what it holds up is a photograph of the app, which
 * those are not part of, so hiding one behind it would be hiding something the picture cannot give
 * back (see `switch.ts`).
 */
export function ThemeSwitchHost() {
  const reveal = useThemeReveal();

  return (
    <WindowOverlay>
      {/* Keyed, so a second switch starts rather than inheriting the first one's clock. */}
      {reveal ? <Switch key={reveal.id} reveal={reveal} /> : null}
    </WindowOverlay>
  );
}

function Switch({ reveal: { id, origin, before, after, fading } }: { reveal: Reveal }) {
  // Swallowed for the same reason the touches are: what is under this is a screen mid-change, and
  // on Android a press would otherwise pop a route nobody can see.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  const leaving = useSharedValue(1);

  useEffect(() => {
    if (!fading) return;

    leaving.value = withTiming(0, { duration: FADE_MS, easing: Easing.inOut(Easing.quad) });
    const done = setTimeout(() => themeRevealed(id), FADE_MS);

    return () => clearTimeout(done);
  }, [fading, id, leaving]);

  const frozen = useAnimatedStyle(() => ({ opacity: leaving.value }));

  return (
    // Takes every touch for as long as it is up, which is the whole of the lock: nothing below can
    // be pressed, scrolled or swiped, so no route travels and no tab changes while the screen the
    // gesture was aimed at is a photograph of somewhere the app has already left.
    <AnimatedView
      className="absolute inset-0"
      style={frozen}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Picture
        source={before}
        contentFit="fill"
        className="absolute inset-0"
        transition={0}
        // The screen is not actually hidden until this has been drawn, and `onLoad` is a frame
        // early: it says the picture is decoded, not that it is on the glass. What happens next is
        // the whole app re-rendering into another palette, so a frame early is a frame of it seen.
        onLoad={() => requestAnimationFrame(() => themeFrozen(id))}
        // Nothing is hidden and so nothing can be revealed: the switch gives up and the theme goes
        // on plainly. Without this the screen would sit frozen until the watchdog noticed.
        onError={() => themeAbandoned(id)}
      />

      {after ? <Opening id={id} picture={after} origin={origin} /> : null}
    </AnimatedView>
  );
}

/**
 * The new screen, opening out of the point that was pressed.
 *
 * Three views rather than one, and each of them is doing something:
 *
 *  - the outer one is the circle. It is built at its *final* size and scaled down to start, rather
 *    than built small and scaled up, so the rounded edge is drawn from a shape the size of the one
 *    that lands and stays clean the whole way out.
 *  - the middle one undoes that scale exactly. Both are concentric, so the two transforms compose
 *    to nothing — which is what holds the picture still while the hole in front of it grows.
 *    Without it the screen would appear to zoom out of the button, which is a different animation
 *    and a much cheaper-looking one.
 *  - the inner one puts the picture back where it was taken from, since the circle's own corner is
 *    not the screen's.
 *
 * Nothing here changes a layout: it is two scales on two static images, so the half second is
 * composited on the GPU and costs the same whatever is in the photograph.
 */
function Opening({ id, picture, origin }: { id: number; picture: string; origin: Point }) {
  const { width, height } = useWindowDimensions();
  const radius = revealRadius(origin, { width, height });

  const grow = useSharedValue(SEED / radius);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!shown) return;

    grow.value = withTiming(1, { duration: REVEAL_MS, easing: Easing.out(Easing.cubic) });
    const done = setTimeout(() => themeRevealed(id), REVEAL_MS + TAIL_MS);

    return () => clearTimeout(done);
  }, [grow, id, shown]);

  const circle = useAnimatedStyle(() => ({
    left: origin.x - radius,
    top: origin.y - radius,
    width: radius * 2,
    height: radius * 2,
    borderRadius: radius,
    transform: [{ scale: grow.value }],
  }));

  const counter = useAnimatedStyle(() => ({ transform: [{ scale: 1 / grow.value }] }));

  return (
    <AnimatedView className="absolute overflow-hidden" style={circle}>
      <AnimatedView className="absolute inset-0" style={counter}>
        <Picture
          source={picture}
          contentFit="fill"
          className="absolute"
          style={{ left: radius - origin.x, top: radius - origin.y, width, height }}
          transition={0}
          // Held at the seed until the picture is decoded. It is a circle the size of a fingertip
          // over an identical screen, so waiting there is invisible — where opening an empty hole
          // in the middle of the old screen would not be.
          onLoad={() => setShown(true)}
          // The theme is already on under the frozen frame; with no picture to open up, the frame
          // dissolves off it instead.
          onError={() => themeFading(id)}
        />
      </AnimatedView>
    </AnimatedView>
  );
}
