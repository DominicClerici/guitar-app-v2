import { useRef, useState } from 'react';
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

import { AccountTab } from '@/screens/AccountTab';
import { EarTab } from '@/screens/EarTab';
import { HomeTab } from '@/screens/HomeTab';
import { LearnTab } from '@/screens/LearnTab';
import { PlayTab } from '@/screens/PlayTab';
import { ToolsTab } from '@/screens/ToolsTab';

import { TabBar } from './TabBar';
import { TABS, type TabKey } from './tabs';

const PAGES: Record<TabKey, () => React.JSX.Element> = {
  home: HomeTab,
  tools: ToolsTab,
  play: PlayTab,
  learn: LearnTab,
  account: AccountTab,
  ear: EarTab,
};

// Duration of the tap transition — the content slide and the tab-bar crossfade
// share this single timeline so they move as one.
const TAB_TRANSITION_MS = 260;

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

  const IncomingPage = incomingIndex !== null ? PAGES[TABS[incomingIndex].key] : null;

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
            {TABS.map((tab) => {
              const Page = PAGES[tab.key];
              return (
                <View key={tab.key} className="flex-1" collapsable={false}>
                  <Page />
                </View>
              );
            })}
          </PagerView>
        </Animated.View>
        {IncomingPage && (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, overlayAnimStyle]}>
            <IncomingPage />
          </Animated.View>
        )}
      </View>
    </View>
  );
}
