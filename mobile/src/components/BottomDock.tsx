import { useId, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useToken } from '@/lib/tokens';

import { AnimatedView } from './AnimatedView';

/** How far the bar starts below where it lands, so it arrives rising. */
const RISE = 12;

const FADE_MS = 220;

/** Fraction of the scrim, measured up from the bottom, that stays solid background. */
const SOLID = 0.6;

interface Props {
  /** Live scroll offset of the screen this docks over. */
  scrollY: SharedValue<number>;
  /** Offset past which the dock shows itself; `Infinity` until the screen knows. */
  threshold: SharedValue<number>;
  children: ReactNode;
}

/**
 * A bar pinned to the bottom of the screen that appears once its screen has been scrolled past
 * `threshold` — the same controls the page opened with, kept in reach after they have scrolled away.
 *
 * The scrim behind it is a gradient rather than a solid fill so content passes under it without a
 * seam, and it lets every touch through: only the children take taps, so the page still scrolls
 * under the fade.
 */
export function BottomDock({ scrollY, threshold, children }: Props) {
  const bg = useToken('--bg', '#0c0d10');
  // const bg = '#fff';
  const gradient = useId().replace(/:/g, '');

  const reveal = useSharedValue(0);
  // The same state the reveal expresses, in JS: an invisible bar must not take taps, and a bar the
  // screen already shows in its own body must not be read out twice.
  const [shown, setShown] = useState(false);

  useAnimatedReaction(
    () => scrollY.value > threshold.value,
    (past, previous) => {
      if (past === previous) return;
      reveal.value = withTiming(past ? 1 : 0, { duration: FADE_MS });
      runOnJS(setShown)(past);
    },
  );

  const style = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: (1 - reveal.value) * RISE }],
  }));

  return (
    <AnimatedView
      pointerEvents={shown ? 'box-none' : 'none'}
      accessibilityElementsHidden={!shown}
      importantForAccessibility={shown ? 'auto' : 'no-hide-descendants'}
      className="absolute inset-x-0 bottom-0"
      style={style}
    >
      <View className="pointer-events-none absolute inset-0" accessible={false}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={gradient} x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={bg} stopOpacity="1" />
              <Stop offset={SOLID} stopColor={bg} stopOpacity="1" />
              <Stop offset="1" stopColor={bg} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${gradient})`} />
        </Svg>
      </View>

      <View pointerEvents="box-none" className="px-5 pb-4">
        {children}
      </View>
    </AnimatedView>
  );
}
