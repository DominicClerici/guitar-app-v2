import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import PagerView, {
  type PagerViewOnPageScrollEvent,
  type PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScopedTheme, useUniwind, type ThemeName } from 'uniwind';

import { EarTab } from '@/screens/EarTab';
import { HomeTab } from '@/screens/HomeTab';
import { LearnTab } from '@/screens/LearnTab';
import { PlayTab } from '@/screens/PlayTab';
import { SettingsTab } from '@/screens/SettingsTab';
import { ToolsTab } from '@/screens/ToolsTab';

import { repaintBatches } from './repaint';
import { TabBar } from './TabBar';
import { TABS, type TabKey } from './tabs';

const PAGES: Record<TabKey, () => React.JSX.Element> = {
  home: HomeTab,
  tools: ToolsTab,
  play: PlayTab,
  learn: LearnTab,
  ear: EarTab,
  settings: SettingsTab,
};

// Duration of the tap transition — the content slide and the tab-bar crossfade
// share this single timeline so they move as one.
const TAB_TRANSITION_MS = 260;

/**
 * One page of the pager, held in a palette of its own.
 *
 * The pinning is what keeps a change of appearance off the five tabs nobody is looking at. uniwind
 * resolves a class against the scoped theme when there is one and — the half that matters — stops
 * recording a dependency on the global theme while doing it, so a pinned page is not merely slow to
 * answer `Uniwind.setTheme`, it is absent from the list of things asked. Several thousand
 * subscriptions become one, held by `TopTabs`.
 *
 * What it costs is that a page no longer follows the theme on its own: every one of them has to be
 * repainted by hand, including when the device changes appearance under someone with `system`
 * chosen. That is the whole of the bookkeeping below.
 *
 * Memoised, and that is the reason this is a component rather than two lines inlined in the map:
 * `TopTabs` renders again for every swipe, every tap, and every page the walk repaints, and without
 * this each of those would render all six screens with it.
 */
const PagerPage = memo(function PagerPage({ tab, palette }: { tab: TabKey; palette: ThemeName }) {
  const Page = PAGES[tab];

  return (
    <ScopedTheme theme={palette}>
      <Page />
    </ScopedTheme>
  );
});

export function TopTabs() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pagerRef = useRef<PagerView>(null);
  // Swipes feed onPageScroll into scrollX and the bar tracks the finger.
  //
  // Taps take a separate path that never moves the pager through intermediate
  // pages: the live pager (still on the source page, with its real scroll state)
  // slides off one way while an overlay of the destination slides in from the
  // other — so tapping 1 → 4 reads as a single-screen slide, skipping 2 and 3.
  // tap* drive both the content slide and the bar crossfade off one timeline.
  const scrollX = useSharedValue(0);
  const tapActive = useSharedValue(0);
  const tapFrom = useSharedValue(0);
  const tapTo = useSharedValue(0);
  const tapProgress = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  // Destination index while a tap slide is playing; null when idle. Drives the
  // incoming overlay and mounts nothing at rest.
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);

  // The app's one subscription to the theme, standing in for the one each styled component used to
  // hold. Read here rather than anywhere below, because there is no `ScopedTheme` above this and
  // so this is the last place that can still see what the app's own appearance is.
  const { theme } = useUniwind();
  const [painted, setPainted] = useState<ThemeName[]>(() => TABS.map(() => theme));

  // A page that is on screen, or sliding on to it, must be in the palette the app is actually in.
  // Adjusted during render rather than from an effect so that it is painted in the commit that
  // changed the theme rather than a frame after it — a frame in which the page would be seen in the
  // palette that was just left.
  const onScreen = incomingIndex === null ? [activeIndex] : [activeIndex, incomingIndex];

  if (onScreen.some((index) => painted[index] !== theme)) {
    setPainted((previous) =>
      previous.map((was, index) => (onScreen.includes(index) ? theme : was)),
    );
  }

  // Where the walk starts from, kept out of the effect's dependencies on purpose: navigating during
  // a repaint should not abandon it and start again from the new page.
  const startFrom = useRef(activeIndex);

  useEffect(() => {
    startFrom.current = activeIndex;
  }, [activeIndex]);

  const mounted = useRef(false);

  // The pages nobody is looking at, brought up to date a batch per frame once the visible one
  // already is.
  //
  // This is free in wall-clock terms and that is why the whole approach works: a change of
  // appearance is watched as a shape opening over a still copy of the screen, and that animation
  // has no JavaScript in its loop — the progress is a shared value and the mask is derived from it
  // on the UI thread. So there is about a second in which the app can render whatever it likes
  // without anything on screen waiting for it, and five screens repainting invisibly is exactly the
  // kind of work that belongs there.
  useEffect(() => {
    // Nothing to do on the first pass: every page was mounted in the theme that is already on.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    const batches = repaintBatches(startFrom.current, TABS.length);

    let frame = 0;
    let at = 0;

    const step = () => {
      const batch = batches[at++];

      if (!batch) return;

      setPainted((previous) =>
        batch.every((index) => previous[index] === theme)
          ? previous
          : previous.map((was, index) => (batch.includes(index) ? theme : was)),
      );

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);

    // A second change of theme abandons the walk the first one started: the pages it had not
    // reached yet are stale against a palette that is no longer the destination either, and the
    // fresh walk is about to visit all of them anyway.
    return () => cancelAnimationFrame(frame);
  }, [theme]);

  // Forward tap → pager exits left, destination enters from the right; reversed
  // for a backward tap. At rest tapProgress is 0, so both translate to 0 and the
  // pager behaves exactly as an untouched PagerView (swipe path untouched).
  const pagerAnimStyle = useAnimatedStyle(() => {
    const dir = tapTo.value >= tapFrom.value ? 1 : -1;
    return { transform: [{ translateX: -dir * width * tapProgress.value }] };
  });
  const overlayAnimStyle = useAnimatedStyle(() => {
    const dir = tapTo.value >= tapFrom.value ? 1 : -1;
    return { transform: [{ translateX: dir * width * (1 - tapProgress.value) }] };
  });

  const finishSlide = (target: number) => {
    // Swap the pager to the destination while it is still off-screen behind the
    // overlay, then drop the overlay and reset the translate on the next frame.
    pagerRef.current?.setPageWithoutAnimation(target);
    requestAnimationFrame(() => {
      tapProgress.value = 0;
      setIncomingIndex(null);
    });
  };

  const goToPage = (index: number) => {
    const current = activeIndex;
    if (index === current) return;

    tapFrom.value = current;
    tapTo.value = index;
    tapProgress.value = 0;
    tapActive.value = 1;
    setActiveIndex(index);
    setIncomingIndex(index);

    tapProgress.value = withTiming(1, { duration: TAB_TRANSITION_MS }, (finished) => {
      'worklet';
      if (finished) {
        // Pin the bar to the target before handing back to swipe mode so it
        // never flashes back to the source for a frame.
        scrollX.value = tapTo.value;
        tapActive.value = 0;
        runOnJS(finishSlide)(index);
      }
    });
  };

  const onPageScroll = (event: PagerViewOnPageScrollEvent) => {
    scrollX.value = event.nativeEvent.position + event.nativeEvent.offset;
  };

  const onPageSelected = (event: PagerViewOnPageSelectedEvent) => {
    setActiveIndex(event.nativeEvent.position);
  };

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TabBar
        scrollX={scrollX}
        onTabPress={goToPage}
        tapActive={tapActive}
        tapFrom={tapFrom}
        tapTo={tapTo}
        tapProgress={tapProgress}
      />
      <View className="flex-1 overflow-hidden">
        <Animated.View style={[{ flex: 1 }, pagerAnimStyle]}>
          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={0}
            scrollEnabled={incomingIndex === null}
            onPageScroll={onPageScroll}
            onPageSelected={onPageSelected}
          >
            {TABS.map((tab, index) => (
              <View key={tab.key} className="flex-1" collapsable={false}>
                <PagerPage tab={tab.key} palette={painted[index]} />
              </View>
            ))}
          </PagerView>
        </Animated.View>
        {incomingIndex !== null && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, overlayAnimStyle]}>
            <PagerPage tab={TABS[incomingIndex].key} palette={painted[incomingIndex]} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}
