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
  // Tap crossfade: when tapActive is 1, the bar ignores scrollX and blends the
  // tapFrom label out / tapTo label in as tapProgress runs 0 → 1.
  tapActive: SharedValue<number>;
  tapFrom: SharedValue<number>;
  tapTo: SharedValue<number>;
  tapProgress: SharedValue<number>;
}

interface TabLabelProps {
  index: number;
  label: string;
  scrollX: SharedValue<number>;
  tapActive: SharedValue<number>;
  tapFrom: SharedValue<number>;
  tapTo: SharedValue<number>;
  tapProgress: SharedValue<number>;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
}

function TabLabel({
  index,
  label,
  scrollX,
  tapActive,
  tapFrom,
  tapTo,
  tapProgress,
  activeColor,
  inactiveColor,
  onPress,
  onLayout,
}: TabLabelProps) {
  // focus = how active this tab is, in [0,1]. During a tap only the source and
  // target tabs move (a single crossfade, intermediates stay faint); otherwise
  // the tab tracks the swiping pager — clamp(1 - |scrollX - index|) is exactly
  // the old interpolateColor([index-1, index, index+1]) behaviour, so both the
  // leaving and arriving labels still blend together mid-swipe.
  const animatedStyle = useAnimatedStyle(() => {
    let focus: number;
    if (tapActive.value === 1) {
      if (index === tapTo.value) focus = tapProgress.value;
      else if (index === tapFrom.value) focus = 1 - tapProgress.value;
      else focus = 0;
    } else {
      focus = Math.max(0, 1 - Math.abs(scrollX.value - index));
    }
    return {
      color: interpolateColor(focus, [0, 1], [inactiveColor, activeColor]),
    };
  });

  return (
    <Pressable onPress={onPress} onLayout={onLayout} hitSlop={10}>
      <Animated.Text
        className="font-mono text-[12px] font-semibold uppercase tracking-[2px]"
        style={animatedStyle}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

export function TabBar({
  scrollX,
  activeIndex,
  onTabPress,
  tapActive,
  tapFrom,
  tapTo,
  tapProgress,
}: TabBarProps) {
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
      className="grow-0 border-b border-b-line-soft bg-bg"
      contentContainerClassName="h-[46px] items-center gap-[26px] px-[18px]"
    >
      {TABS.map((tab, index) => (
        <TabLabel
          key={tab.key}
          index={index}
          label={tab.label}
          scrollX={scrollX}
          tapActive={tapActive}
          tapFrom={tapFrom}
          tapTo={tapTo}
          tapProgress={tapProgress}
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
