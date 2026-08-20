import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import {
  LinearTransition,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { Face } from '@/components/Face';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { RomanLabel } from '@/lib/key-analysis';
import { useToken } from '@/lib/tokens';

import type { Rect } from './chipGeometry';
import type { DisplayChord } from './useKeyDetection';

const RING = { duration: 170 };

interface ChipProps {
  chord: DisplayChord;
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
  onSelect: (chord: DisplayChord) => void;
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
          <AnimatedView pointerEvents="none" className="absolute inset-0" style={ringStyle}>
            <Face name="accent" radius={11} />
          </AnimatedView>
        </Pressable>
      </AnimatedView>
    </AnimatedView>
  );
}

interface FaceProps {
  chord: DisplayChord;
  label: RomanLabel | undefined;
  position: number;
  reordering: boolean;
  active: boolean;
}

/** The chip itself, drawn twice: once in the flow, once riding the finger. */
export function ChipFace({ chord, label, position, reordering, active }: FaceProps) {
  const borrowed = label ? !label.isDiatonic : false;
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <View className="items-center px-[13px] py-[8px]">
      <Face
        fill={active ? '--accent-wash' : reordering ? '--surface-raised' : '--surface'}
        stroke={active ? '--accent-line' : reordering ? '--line' : '--line-soft'}
        radius={11}
      />
      <View className="flex-row items-center gap-[4px]">
        {/* The engine names every unpinned chord in whatever reading best serves
            the displayed key; the pin marks the one chord it may not touch. */}
        {chord.pinned !== null ? (
          <SymbolView name="pin.fill" size={8} weight="semibold" tintColor={faint} />
        ) : null}
        <Text className="text-[15px] font-semibold tracking-[-0.2px] text-ink">
          {toAccidentalGlyphs(chord.name)}
        </Text>
      </View>
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
