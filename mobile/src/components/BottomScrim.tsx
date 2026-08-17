import { useId } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { useToken } from '@/lib/tokens';

/**
 * The ground a control floats on at the foot of a scrolling screen.
 *
 * A gradient rather than a fill, so a page that runs under the control passes out of sight instead
 * of being cut off by an edge — and so the control has something to be legible against without the
 * screen gaining a second horizon. It takes no touches at all: the page still scrolls under it.
 */

/** Fraction of the scrim, measured up from the bottom, that stays solid background. */
const SOLID = 0.6;

export function BottomScrim() {
  const bg = useToken('--bg', '#0c0d10');
  // Gradients are looked up by id across the whole document, so two scrims on one screen would
  // otherwise be the same gradient — and the second one to mount would win.
  const gradient = useId().replace(/:/g, '');

  return (
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
  );
}
