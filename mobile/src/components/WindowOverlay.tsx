import type { ReactNode } from 'react';
import { Platform } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';

/**
 * Content that has to be above whatever the navigator is showing, including a route the navigator
 * presents as a modal.
 *
 * The two platforms need different answers, which is the whole reason this is a component rather
 * than a `View`:
 *
 * - iOS presents a modal route as its own view controller, so nothing rendered in the React tree
 *   can sit above it. `FullWindowOverlay` puts its content straight into the app's window instead.
 *   It reports a hit only where there is actually something to touch, so it can stay mounted the
 *   whole time without swallowing a single tap — which an `RCTModal` in its place would do for as
 *   long as anything was up.
 * - Android presents every stack route, modal included, as an ordinary fragment in the one
 *   hierarchy (`ScreenStack.adapt`), so a plain view rendered after the navigator is already above
 *   it and no overlay is needed.
 *
 * Mount it once, from the root layout, and leave it mounted: an exit animation needs a parent that
 * outlives the child running it, and an empty overlay costs nothing.
 */
export function WindowOverlay({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'ios') return children;
  return <FullWindowOverlay>{children}</FullWindowOverlay>;
}
