import { useRef, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  interpolateColor,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { useCSSVariable } from 'uniwind';

import { TABS } from './tabs';

// Mirror of the content container's px-[18px] / gap-[26px]; needed in JS to work
// out how much empty space the last tabs need behind them to scroll far enough.
const EDGE_PADDING = 18;
const TAB_GAP = 26;

interface TabBarProps {
  // Fractional page position (page index + swipe offset), driven by the pager.
  scrollX: SharedValue<number>;
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

// Content offset that puts the tab *before* `position` (a fractional tab index)
// flush against the bar's left padding, so the selected tab sits one slot in
// from the left edge and its predecessor stays visible. Lerped between the two
// anchors it sits between. The first tab has nothing to its left, so it anchors
// itself — which also means selecting tab 0 or tab 1 leaves the bar in the same
// place, and a swipe between them does not move it.
function offsetForSelection(position: number, offsets: number[]) {
  'worklet';
  const anchor = Math.min(Math.max(position - 1, 0), offsets.length - 1);
  const lower = Math.floor(anchor);
  const upper = Math.ceil(anchor);
  const x = offsets[lower] + (offsets[upper] - offsets[lower]) * (anchor - lower);
  return x - offsets[0];
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
  onTabPress,
  tapActive,
  tapFrom,
  tapTo,
  tapProgress,
}: TabBarProps) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const layouts = useRef<({ x: number; width: number } | undefined)[]>([]);
  const viewport = useRef(0);
  const [trailingSpace, setTrailingSpace] = useState(0);

  // Left edge of every label, published once all of them have been measured.
  const offsets = useSharedValue<number[]>([]);
  // Live content offset — onScroll reports it for programmatic scrolls too, so
  // this tracks the bar whether the user moved it or a transition did. Read only
  // at the start of a transition, as the position to ease away from.
  const contentOffset = useSharedValue(0);
  const anchorDrift = useSharedValue(0);
  const anchorIndex = useSharedValue(0);
  const driving = useSharedValue(0);

  const vars = useCSSVariable(['--accent', '--ink-faint']);
  const activeColor = (vars[0] as string | undefined) ?? '#5ec8c2';
  const inactiveColor = (vars[1] as string | undefined) ?? '#62666e';

  const measure = () => {
    if (viewport.current === 0) return;
    // Densified so a not-yet-measured tab reads as undefined rather than a hole.
    const measured = TABS.map((_, index) => layouts.current[index]);
    if (measured.some((layout) => layout === undefined)) return;

    const known = measured as { x: number; width: number }[];
    const xs = known.map((layout) => layout.x);
    offsets.value = xs;

    // Without this the ScrollView runs out of content before the last tabs can
    // reach their anchored position, and clamps them somewhere in the middle
    // instead. The furthest the bar ever scrolls is the offset that selects the
    // last tab, i.e. one that left-aligns its predecessor.
    const last = known[known.length - 1];
    // Extra TAB_GAP because the spacer is a flex child of the gap-[26px] row.
    const contentEnd = last.x + last.width + EDGE_PADDING + TAB_GAP;
    const maxScroll = offsetForSelection(xs.length - 1, xs);
    setTrailingSpace(Math.max(0, viewport.current + maxScroll - contentEnd));
  };

  const onScroll = useAnimatedScrollHandler((event) => {
    contentOffset.value = event.contentOffset.x;
  });

  // While a change is in flight the bar is ours: every frame it lands at
  // lerp(where the user had it, anchored target, how far the change has
  // committed). A swipe drives that from the finger, a tap from tapProgress, so
  // in both cases the bar arrives anchored exactly as the change settles.
  useAnimatedReaction(
    () => ({
      tap: tapActive.value,
      progress: tapProgress.value,
      from: tapFrom.value,
      to: tapTo.value,
      x: scrollX.value,
    }),
    (current, previous) => {
      const o = offsets.value;
      if (o.length === 0) return;

      const settled = current.tap === 0 && Math.abs(current.x - Math.round(current.x)) < 0.001;

      if (settled) {
        if (driving.value === 1) {
          driving.value = 0;
          // Snap away the sub-pixel remainder of the last driven frame. A swipe
          // that sprang back to the tab it started on is not a change, so it
          // keeps whatever scroll position the user had set.
          const index = Math.round(current.x);
          if (index !== anchorIndex.value) {
            scrollTo(scrollRef, offsetForSelection(index, o), 0, false);
          }
        }
        return;
      }

      if (driving.value === 0) {
        driving.value = 1;
        anchorIndex.value =
          current.tap === 1 ? current.from : Math.round(previous ? previous.x : current.x);
        // How far the user had scrolled the bar away from the tab it is leaving.
        anchorDrift.value = contentOffset.value - offsetForSelection(anchorIndex.value, o);
      }

      const position =
        current.tap === 1
          ? current.from + (current.to - current.from) * current.progress
          : current.x;
      const commitment =
        current.tap === 1 ? current.progress : Math.min(1, Math.abs(current.x - anchorIndex.value));

      // The bar follows the tabs linearly, exactly as the colours do, while the
      // user's drift decays to nothing — so it starts from wherever they left it
      // and is anchored by the time the change lands.
      const base = offsetForSelection(position, o);
      scrollTo(scrollRef, base + anchorDrift.value * (1 - commitment), 0, false);
    },
  );

  return (
    <Animated.ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onLayout={(event) => {
        viewport.current = event.nativeEvent.layout.width;
        measure();
      }}
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
            measure();
          }}
        />
      ))}
      {trailingSpace > 0 && <View style={{ width: trailingSpace }} />}
    </Animated.ScrollView>
  );
}
