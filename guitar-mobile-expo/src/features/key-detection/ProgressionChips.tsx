import { useRef, useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { ProgressionChord, RomanLabel } from '@/lib/key-analysis';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const LONG_PRESS_MS = 250;
const LIFT_SCALE = 1.06;

/**
 * Which slot the finger is over. Slots are position-indexed rather than
 * chord-indexed, so they stay valid while the chips shuffle underneath. A finger
 * in the gutter between rows falls back to the nearest slot centre.
 */
function slotAt(rects: Rect[], count: number, x: number, y: number): number {
  'worklet';
  let nearest = -1;
  let best = Infinity;

  for (let i = 0; i < count; i += 1) {
    const r = rects[i];
    if (!r) continue;
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;

    const dx = x - (r.x + r.w / 2);
    const dy = y - (r.y + r.h / 2);
    const d = dx * dx + dy * dy;
    if (d < best) {
      best = d;
      nearest = i;
    }
  }

  return nearest;
}

interface Props {
  chords: ProgressionChord[];
  labels: RomanLabel[];
  /** The chord currently being edited on the neck, if any. */
  activeId: string | null;
  reordering: boolean;
  /** Whether a drag can start at all — false with one chord, or while editing. */
  canReorder: boolean;
  onSelect: (chord: ProgressionChord) => void;
  onReorder: (from: number, to: number) => void;
  onBeginReorder: () => void;
}

/**
 * The progression, in order. Each chip carries its roman numeral in the displayed
 * key — amber when the chord is borrowed from outside it. Tapping a chip loads it
 * onto the neck to edit; holding one hands the row over to dragging, where the
 * numerals give way to positions because order is the only thing that matters.
 */
export function ProgressionChips({
  chords,
  labels,
  activeId,
  reordering,
  canReorder,
  onSelect,
  onReorder,
  onBeginReorder,
}: Props) {
  // Layout of every slot, mirrored into a shared value so the drag can hit-test
  // against it on the UI thread.
  const measured = useRef<Rect[]>([]);
  const rects = useSharedValue<Rect[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);

  const measure = (index: number, rect: Rect) => {
    measured.current[index] = rect;
    rects.value = [...measured.current];
  };

  return (
    <View className="flex-row flex-wrap gap-[8px]">
      {chords.map((chord, i) => (
        <Chip
          key={chord.id}
          chord={chord}
          label={labels[i]}
          index={i}
          count={chords.length}
          active={chord.id === activeId}
          dragging={chord.id === dragId}
          reordering={reordering}
          canReorder={canReorder}
          rects={rects}
          onMeasure={measure}
          onSelect={onSelect}
          onReorder={onReorder}
          onBeginReorder={onBeginReorder}
          onDragStart={setDragId}
          onDragEnd={setDragId}
        />
      ))}
    </View>
  );
}

interface ChipProps {
  chord: ProgressionChord;
  label: RomanLabel | undefined;
  index: number;
  count: number;
  active: boolean;
  dragging: boolean;
  reordering: boolean;
  canReorder: boolean;
  rects: SharedValue<Rect[]>;
  onMeasure: (index: number, rect: Rect) => void;
  onSelect: (chord: ProgressionChord) => void;
  onReorder: (from: number, to: number) => void;
  onBeginReorder: () => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: null) => void;
}

function Chip({
  chord,
  label,
  index,
  count,
  active,
  dragging,
  reordering,
  canReorder,
  rects,
  onMeasure,
  onSelect,
  onReorder,
  onBeginReorder,
  onDragStart,
  onDragEnd,
}: ChipProps) {
  const press = useSharedValue(0);
  const lift = useSharedValue(0);
  // Where the finger is, in the container's coordinates. Only the chip under it
  // cares, so it lives here rather than being shared across the row.
  const fingerX = useSharedValue(0);
  const fingerY = useSharedValue(0);
  // Where the chip sat when the drag began, and which slot it now occupies. The
  // slot is tracked here rather than read from `index`, whose prop update lands a
  // render behind the reorder that caused it.
  const originX = useSharedValue(0);
  const originY = useSharedValue(0);
  const slot = useSharedValue(index);

  const tap = Gesture.Tap()
    .enabled(!reordering)
    .onBegin(() => {
      press.value = withTiming(1, { duration: 80 });
    })
    .onEnd((_e, success) => {
      if (success) runOnJS(onSelect)(chord);
    })
    .onFinalize(() => {
      press.value = withTiming(0, { duration: 160 });
    });

  // Callbacks only become worklets if they hang off an unbroken chain from
  // `Gesture.Pan()` — the babel plugin matches on the syntax, not the value. Break
  // it and the whole drag quietly moves to the JS thread.
  const pan = Gesture.Pan()
    .enabled(canReorder)
    .onStart(() => {
      const r = rects.value[index];
      // Nothing measured yet — sit the drag out rather than hit-testing against
      // an empty row and shuffling the progression behind the user's back.
      if (!r) {
        slot.value = -1;
        return;
      }
      originX.value = r.x + r.w / 2;
      originY.value = r.y + r.h / 2;
      fingerX.value = originX.value;
      fingerY.value = originY.value;
      slot.value = index;
      lift.value = withTiming(1, { duration: 130 });
      if (!reordering) runOnJS(onBeginReorder)();
      runOnJS(onDragStart)(chord.id);
    })
    .onUpdate((e) => {
      if (slot.value < 0) return;
      fingerX.value = originX.value + e.translationX;
      fingerY.value = originY.value + e.translationY;

      const target = slotAt(rects.value, count, fingerX.value, fingerY.value);
      if (target !== -1 && target !== slot.value) {
        runOnJS(onReorder)(slot.value, target);
        slot.value = target;
      }
    })
    .onFinalize(() => {
      lift.value = withTiming(0, { duration: 160 });
      runOnJS(onDragEnd)(null);
    });

  // Out of reorder mode a chip has to be held before it will drag, so a plain
  // swipe still scrolls the page. Inside it, movement alone is enough.
  if (!reordering) pan.activateAfterLongPress(LONG_PRESS_MS);

  // The chip rides the finger by cancelling out its own slot position, so it stays
  // put while the slot changes under it. `lift` scales that offset, so releasing
  // eases the chip home rather than snapping it — which is why the offset is gated
  // on `lift` and not on `dragging`, whose flag drops the instant the finger goes.
  const style = useAnimatedStyle(() => {
    const r = rects.value[index];

    return {
      zIndex: lift.value > 0 ? 20 : 0,
      opacity: 1 - press.value * 0.3,
      transform: [
        { translateX: r ? (fingerX.value - (r.x + r.w / 2)) * lift.value : 0 },
        { translateY: r ? (fingerY.value - (r.y + r.h / 2)) * lift.value : 0 },
        { scale: 1 + lift.value * (LIFT_SCALE - 1) },
      ],
    };
  });

  const borrowed = label ? !label.isDiatonic : false;

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <AnimatedView
        layout={dragging ? undefined : LinearTransition.duration(190)}
        style={style}
        onLayout={(e: LayoutChangeEvent) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          onMeasure(index, { x, y, w: width, h: height });
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={
          reordering
            ? `${chord.name}, position ${index + 1} of ${count}, drag to move`
            : `${chord.name}, edit on fretboard`
        }
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
            {index + 1}
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
      </AnimatedView>
    </GestureDetector>
  );
}
