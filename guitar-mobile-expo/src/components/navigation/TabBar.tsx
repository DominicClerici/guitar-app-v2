import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useCSSVariable } from 'uniwind';

import { TABS } from './tabs';

interface TabBarProps {
  // Fractional page position (page index + swipe offset), driven by the pager.
  scrollX: SharedValue<number>;
  // Settled page, used only to trigger auto-scroll of the bar.
  activeIndex: number;
  onTabPress: (index: number) => void;
}

interface TabLabelProps {
  index: number;
  label: string;
  scrollX: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}

function TabLabel({
  index,
  label,
  scrollX,
  activeColor,
  inactiveColor,
  onPress,
  onLayout,
}: TabLabelProps) {
  // Blend faint → aqua as the pager crosses this tab, so both the leaving and
  // arriving labels animate together mid-swipe. interpolateColor clamps outside
  // the range, so tabs further than one page away stay faint.
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      scrollX.value,
      [index - 1, index, index + 1],
      [inactiveColor, activeColor, inactiveColor],
    ),
  }));

  return (
    <Pressable onPress={onPress} onLayout={onLayout} hitSlop={10}>
      <Animated.Text className="tab-label" style={animatedStyle}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export function TabBar({ scrollX, activeIndex, onTabPress }: TabBarProps) {
  const scrollRef = useRef<ScrollView>(null);
  const layouts = useRef<{ x: number; width: number }[]>([]);
  const { width: windowWidth } = useWindowDimensions();

  const vars = useCSSVariable(['--accent', '--ink-faint']);
  const activeColor = (vars[0] as string | undefined) ?? '#5ec8c2';
  const inactiveColor = (vars[1] as string | undefined) ?? '#62666e';

  // Keep the active label visible when it sits off-screen at either end.
  useEffect(() => {
    const layout = layouts.current[activeIndex];
    if (!layout) return;
    const target = layout.x + layout.width / 2 - windowWidth / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, target), animated: true });
  }, [activeIndex, windowWidth]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="tabbar-root"
      contentContainerClassName="tabbar-content"
    >
      {TABS.map((tab, index) => (
        <TabLabel
          key={tab.key}
          index={index}
          label={tab.label}
          scrollX={scrollX}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
          onPress={() => onTabPress(index)}
          onLayout={(event) => {
            const { x, width } = event.nativeEvent.layout;
            layouts.current[index] = { x, width };
          }}
        />
      ))}
    </ScrollView>
  );
}
