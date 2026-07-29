import { useId, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useToken } from '@/lib/tokens';

import { AnimatedView } from './AnimatedView';

interface Props {
  children: ReactNode;
  /** Classes on the wrapper that holds `children` inside the scroll view. */
  contentClassName?: string;
  /** Width of the veil at each edge, e.g. `w-[30px]`. */
  fadeClassName?: string;
  /** Scroll distance over which a veil fades in. */
  fadeTravel?: number;
  /** Colour token the veil fades from — whatever the row is actually sitting on. */
  veilToken?: string;
}

/**
 * Horizontal scroller whose overflow is marked by a veil at each edge rather than
 * a scrollbar: the veil lifts as you reach that end, so a row that runs past the
 * screen always says so and a row that fits shows nothing.
 */
export function FadingHScroll({
  children,
  contentClassName,
  fadeClassName = 'w-[30px]',
  fadeTravel = 40,
  veilToken = '--bg',
}: Props) {
  const [containerW, setContainerW] = useState(0);
  const [contentW, setContentW] = useState(0);
  const scrollX = useSharedValue(0);
  const veilId = useId().replace(/:/g, '');

  const maxScroll = Math.max(0, contentW - containerW);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const leftFade = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, [0, fadeTravel], [0, 1], Extrapolation.CLAMP),
  }));

  const rightFade = useAnimatedStyle(() => ({
    opacity:
      maxScroll <= 0
        ? 0
        : interpolate(
            scrollX.value,
            [maxScroll - fadeTravel, maxScroll],
            [1, 0],
            Extrapolation.CLAMP,
          ),
  }));

  return (
    <View onLayout={(e: LayoutChangeEvent) => setContainerW(e.nativeEvent.layout.width)}>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onContentSizeChange={(w) => setContentW(w)}
      >
        <View className={contentClassName}>{children}</View>
      </Animated.ScrollView>

      <AnimatedView
        className={`pointer-events-none absolute bottom-0 left-0 top-0 ${fadeClassName}`}
        style={leftFade}
      >
        <EdgeVeil side="left" id={veilId} token={veilToken} />
      </AnimatedView>
      <AnimatedView
        className={`pointer-events-none absolute bottom-0 right-0 top-0 ${fadeClassName}`}
        style={rightFade}
      >
        <EdgeVeil side="right" id={veilId} token={veilToken} />
      </AnimatedView>
    </View>
  );
}

/** Background-to-transparent veil marking that the row continues past the edge. */
function EdgeVeil({ side, id, token }: { side: 'left' | 'right'; id: string; token: string }) {
  const bg = useToken(token, '#0c0d10');
  const [from, to] = side === 'left' ? ['1', '0'] : ['0', '1'];
  const gradientId = `veil-${id}-${side}`;

  return (
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={bg} stopOpacity={from} />
          <Stop offset="1" stopColor={bg} stopOpacity={to} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
    </Svg>
  );
}
