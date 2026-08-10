import Animated from 'react-native-reanimated';
import { withUniwind } from 'uniwind';

/**
 * `Animated.View` that also accepts `className`. uniwind merges the class styles
 * underneath the `style` prop, so static layout stays in utilities and the `style`
 * prop carries only the per-frame animated values.
 */
export const AnimatedView = withUniwind(Animated.View);
