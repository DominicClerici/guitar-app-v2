import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import {
  LinearTransition,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { ProgressionChord, RomanLabel } from '@/lib/key-analysis';

import type { Rect } from './chipGeometry';

const RING = { duration: 170 };

interface ChipProps {
  chord: ProgressionChord;
  label: RomanLabel | undefined;
  index: number;
  count: number;
  active: boolean;
  /** A chip is in hand somewhere in the row, so every chip shows its position. */
  dragging: boolean;
  /** This chip is the one the menu is hanging off. */
  held: boolean;
  hidden: boolean;
  /**
   * Which chord the finger is on, and how far through the hold it has got. Driven
   * by the row's pan, which is the only thing that knows — the press starts
   * shrinking the chip 80ms in, long before any of it reaches React.
   */
  pressId: SharedValue<string>;
  pressScale: SharedValue<number>;
  onMeasure: (index: number, rect: Rect) => void;
  onSelect: (chord: ProgressionChord) => void;
  onDismissMenu: () => void;
}

/**
 * A chip in the flow. While its chord is in hand this goes invisible and the
 * overlay stands in for it, so the slot keeps reserving exactly the right space
 * and its neighbours glide around it. Hiding is driven by the same state that
 * mounts the overlay, so the two swap in one commit with no frame showing both
 * or neither.
 *
 * Held down, the chip sinks under the finger for the length of the hold and then
 * springs past its resting size when the menu arrives — the sink is what makes the
 * hold feel like it is loading something, and the overshoot is what makes the
 * arrival feel like a release rather than a step. It swells and takes an accent
 * ring rather than leaving the row, because the row is where a drag into a reorder
 * needs it to stay.
 */
export function Chip({
  chord,
  label,
  index,
  count,
  active,
  dragging,
  held,
  hidden,
  pressId,
  pressScale,
  onMeasure,
  onSelect,
  onDismissMenu,
}: ChipProps) {
  const ring = useDerivedValue(() => withTiming(held ? 1 : 0, RING));

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressId.value === chord.id ? pressScale.value : 1 }],
  }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: ring.value }));

  return (
    <AnimatedView
      layout={LinearTransition.duration(190)}
      className={hidden ? 'opacity-0' : undefined}
      onLayout={(e: LayoutChangeEvent) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        onMeasure(index, { x, y, w: width, h: height });
      }}
    >
      <AnimatedView style={liftStyle}>
        <Pressable
          // With the menu open this chip is the only one the backdrop leaves
          // reachable, so a tap on it can only mean "done with the menu".
          onPress={() => (held ? onDismissMenu() : onSelect(chord))}
          disabled={dragging}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
          accessibilityLabel={
            dragging
              ? `${chord.name}, position ${index + 1} of ${count}, drag to move`
              : held
                ? `${chord.name}, close menu`
                : active
                  ? `${chord.name}, editing on fretboard. Tap to stop editing and discard changes.`
                  : `${chord.name}, edit on fretboard. Hold for actions.`
          }
          className="active:opacity-70"
        >
          <ChipFace
            chord={chord}
            label={label}
            position={index + 1}
            reordering={dragging}
            active={active}
          />
          <AnimatedView
            pointerEvents="none"
            className="absolute inset-0 rounded-[11px] border border-accent-line bg-accent-wash"
            style={ringStyle}
          />
        </Pressable>
      </AnimatedView>
    </AnimatedView>
  );
}

interface FaceProps {
  chord: ProgressionChord;
  label: RomanLabel | undefined;
  position: number;
  reordering: boolean;
  active: boolean;
}

/** The chip itself, drawn twice: once in the flow, once riding the finger. */
export function ChipFace({ chord, label, position, reordering, active }: FaceProps) {
  const borrowed = label ? !label.isDiatonic : false;

  return (
    <View
      className={`items-center rounded-[11px] border px-[13px] py-[8px] ${
        active
          ? 'border-accent-line bg-accent-wash'
          : reordering
            ? 'border-line bg-surface-raised'
            : 'border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface'
      }`}
    >
      <Text className="text-[15px] font-semibold tracking-[-0.2px] text-ink">
        {toAccidentalGlyphs(chord.name)}
      </Text>
      {reordering ? (
        <Text className="mt-[3px] font-mono text-[9.5px] tracking-[1.2px] text-accent">
          {position}
        </Text>
      ) : label ? (
        <Text
          className={`mt-[3px] font-mono text-[9.5px] tracking-[1.2px] ${
            borrowed ? 'text-amber' : 'text-ink-muted'
          }`}
        >
          {label.roman}
        </Text>
      ) : null}
    </View>
  );
}
