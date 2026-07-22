import { useRef, useState } from 'react';
import { View } from 'react-native';
import PagerView, {
  type PagerViewOnPageScrollEvent,
  type PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountTab } from '@/screens/AccountTab';
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
};

export function TopTabs() {
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<PagerView>(null);
  // The pager is the single source of truth: taps call setPage, swipes move it
  // natively, and both feed onPageScroll — so the bar never diverges from it.
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToPage = (index: number) => pagerRef.current?.setPage(index);

  const onPageScroll = (event: PagerViewOnPageScrollEvent) => {
    scrollX.value = event.nativeEvent.position + event.nativeEvent.offset;
  };

  const onPageSelected = (event: PagerViewOnPageSelectedEvent) => {
    setActiveIndex(event.nativeEvent.position);
  };

  return (
    <View className="tabs-root" style={{ flex: 1, paddingTop: insets.top }}>
      <TabBar scrollX={scrollX} activeIndex={activeIndex} onTabPress={goToPage} />
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageScroll={onPageScroll}
        onPageSelected={onPageSelected}
      >
        {TABS.map((tab) => {
          const Page = PAGES[tab.key];
          return (
            <View key={tab.key} style={{ flex: 1 }} collapsable={false}>
              <Page />
            </View>
          );
        })}
      </PagerView>
    </View>
  );
}
