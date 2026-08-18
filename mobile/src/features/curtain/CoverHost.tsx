import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';

import { endCover, useCover, type Cover } from './cover';
import { COVER_MS, HIDE_MS } from './moment';

/** Down over a screen in use: out of the gate, so it is hiding things almost at once. */
const RAISE = { duration: COVER_MS, easing: Easing.out(Easing.quad) };

/** And up again — the same lift the curtain ends on, since it is the same act. */
const LOWER = { duration: HIDE_MS, easing: Easing.inOut(Easing.quad) };

/**
 * Where the cover shows. Mounted once, by the root layout.
 *
 * Inside the React tree rather than in a window overlay, which is the one place it differs from
 * `CurtainHost` and is the whole reason it is a separate host. What a cover is usually waiting for
 * is a provider's sign-in sheet, and that sheet is presented by the app's own view controller — an
 * overlay sitting in the window above it would cover the very thing the person has to answer. Here
 * it is above every route the navigator shows and below anything the system puts on top, which is
 * exactly the reach it needs.
 */
export function CoverHost() {
  const cover = useCover();

  // Keyed, so a cover raised after one has begun leaving starts its own fade rather than joining
  // the tail of that one.
  return cover ? <Screen key={cover.id} cover={cover} /> : null;
}

function Screen({ cover: { id, leaving } }: { cover: Cover }) {
  const fade = useSharedValue(0);

  useEffect(() => {
    if (!leaving) {
      fade.value = withTiming(1, RAISE);
      return;
    }

    fade.value = withTiming(0, LOWER);
    const gone = setTimeout(() => endCover(id), HIDE_MS);
    return () => clearTimeout(gone);
  }, [fade, id, leaving]);

  // Swallowed for the same reason the touches are: what is under this is either half hidden or
  // about to stop being true, and on Android a press would otherwise pop a screen nobody can see.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    // Takes every touch from the frame it is raised, before it is opaque enough to explain why:
    // pressing a provider button is the end of what this screen has to say, and a second press
    // landing on it while it fades would be aimed at a screen that has already gone.
    <AnimatedView
      className="absolute inset-0 bg-bg"
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
