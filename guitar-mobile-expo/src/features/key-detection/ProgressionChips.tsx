import { useRef, useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
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
const SETTLE = { duration: 200 };
/** How far into a gutter still counts as being over the neighbouring slot. */
const HOVER_SLACK = 20;

function distanceToRect(r: Rect, x: number, y: number): number {
  'worklet';
  const dx = Math.max(r.x - x, 0, x - (r.x + r.w));
  const dy = Math.max(r.y - y, 0, y - (r.y + r.h));
  return Math.sqrt(dx * dx + dy * dy);
}

/** Nearest slot to a point, or -1 if the point is further away than `slack`. */
function slotNear(rects: Rect[], count: number, x: number, y: number, slack: number): number {
  'worklet';
  let nearest = -1;
  let best = Infinity;

  for (let i = 0; i < count; i += 1) {
    const r = rects[i];
    if (!r) continue;
    const d = distanceToRect(r, x, y);
    if (d < best) {
      best = d;
      nearest = i;
    }
  }

  return best <= slack ? nearest : -1;
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
 *
 * The drag lives here rather than on each chip: one pan over the whole row can be
 * hit-tested against the measured slots, and the chip riding the finger can be
 * drawn as an overlay in the row's own coordinates — which is what keeps it off
 * the layout's timeline. See `pan` below.
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
  // Where every slot sits, mirrored into a shared value so the drag can hit-test
  // against it on the UI thread. `base` is a copy frozen at drag start.
  const measured = useRef<Rect[]>([]);
  const rects = useSharedValue<Rect[]>([]);
  const base = useSharedValue<Rect[]>([]);

  const slot = useSharedValue(-1); // slot the dragged chip currently occupies
  const lift = useSharedValue(0); // 0 parked, 1 fully in hand
  const dragX = useSharedValue(0); // overlay's top-left, in row coordinates
  const dragY = useSharedValue(0);
  const grabX = useSharedValue(0); // where inside the chip the finger took hold
  const grabY = useSharedValue(0);

  const [dragId, setDragId] = useState<string | null>(null);
  const count = chords.length;

  const measure = (index: number, rect: Rect) => {
    measured.current[index] = rect;
    rects.value = [...measured.current];
  };

  const beginDragAt = (index: number) => {
    const chord = chords[index];
    if (chord) setDragId(chord.id);
  };

  const endDrag = () => setDragId(null);

  // Callbacks only become worklets if they hang off an unbroken chain from
  // `Gesture.Pan()` — the babel plugin matches on the syntax, not the value. Break
  // it and the whole drag quietly moves to the JS thread.
  const pan = Gesture.Pan()
    .enabled(canReorder)
    .onStart((e) => {
      const i = slotNear(rects.value, count, e.x, e.y, 0);
      // Started on a gutter rather than a chip — sit this one out.
      if (i < 0) {
        slot.value = -1;
        return;
      }

      const r = rects.value[i];
      slot.value = i;
      base.value = rects.value;
      grabX.value = e.x - r.x;
      grabY.value = e.y - r.y;
      dragX.value = r.x;
      dragY.value = r.y;
      lift.value = withTiming(1, { duration: 130 });

      if (!reordering) runOnJS(onBeginReorder)();
      runOnJS(beginDragAt)(i);
    })
    .onUpdate((e) => {
      if (slot.value < 0) return;
      dragX.value = e.x - grabX.value;
      dragY.value = e.y - grabY.value;

      // Read the target from the layout as it was when the drag began. Hit-testing
      // the live layout feeds each reorder into the geometry that decides the next
      // one: a narrow chip swapped past a wide one leaves the finger back over the
      // slot it just left, and the row oscillates. The frozen copy can't do that,
      // and splicing from the current slot to a target expressed in the original
      // frame still lands the chip where the finger is pointing.
      const target = slotNear(base.value, count, e.x, e.y, HOVER_SLACK);
      if (target >= 0 && target !== slot.value) {
        runOnJS(onReorder)(slot.value, target);
        slot.value = target;
      }
    })
    .onFinalize(() => {
      if (slot.value < 0) {
        lift.value = 0;
        return;
      }
      // `slot` deliberately keeps its value here. The overlay reads it to find the
      // rect it is settling into, and it stays mounted for a commit or two after
      // this fires; clearing it now would lose the home rect and snap the chip
      // back to the finger on its last frame. The next `onStart` sets it anyway.
      lift.value = withTiming(0, SETTLE, (finished) => {
        if (finished) runOnJS(endDrag)();
      });
    });

  // Out of reorder mode a chip has to be held before it will drag, so a plain
  // swipe still scrolls the page. Inside it, movement alone is enough.
  if (!reordering) pan.activateAfterLongPress(LONG_PRESS_MS);

  // The overlay is positioned by the finger alone, so nothing about it waits on a
  // layout pass. `lift` doubles as the blend back to the chip's slot: as it decays
  // the overlay glides home, and because the home rect is read every frame a late
  // measurement adjusts the target mid-glide instead of jumping.
  const overlayStyle = useAnimatedStyle(() => {
    const home = rects.value[slot.value];
    const t = lift.value;

    return {
      transform: [
        { translateX: home ? dragX.value * t + home.x * (1 - t) : dragX.value },
        { translateY: home ? dragY.value * t + home.y * (1 - t) : dragY.value },
        { scale: 1 + t * (LIFT_SCALE - 1) },
      ],
    };
  });

  const dragIndex = dragId === null ? -1 : chords.findIndex((c) => c.id === dragId);
  const dragged = dragIndex < 0 ? null : chords[dragIndex];

  return (
    <GestureDetector gesture={pan}>
      <View className="flex-row flex-wrap gap-[8px]">
        {chords.map((chord, i) => (
          <Chip
            key={chord.id}
            chord={chord}
            label={labels[i]}
            index={i}
            count={count}
            active={chord.id === activeId}
            reordering={reordering}
            hidden={chord.id === dragId}
            onMeasure={measure}
            onSelect={onSelect}
          />
        ))}

        {dragged ? (
          <AnimatedView
            className="pointer-events-none absolute left-0 top-0 z-20"
            style={overlayStyle}
          >
            <ChipFace
              chord={dragged}
              label={labels[dragIndex]}
              position={dragIndex + 1}
              reordering
              active={dragged.id === activeId}
            />
          </AnimatedView>
        ) : null}
      </View>
    </GestureDetector>
  );
}

interface ChipProps {
  chord: ProgressionChord;
  label: RomanLabel | undefined;
  index: number;
  count: number;
  active: boolean;
  reordering: boolean;
  hidden: boolean;
  onMeasure: (index: number, rect: Rect) => void;
  onSelect: (chord: ProgressionChord) => void;
}

/**
 * A chip in the flow. While its chord is in hand this goes invisible and the
 * overlay stands in for it, so the slot keeps reserving exactly the right space
 * and its neighbours glide around it. Hiding is driven by the same state that
 * mounts the overlay, so the two swap in one commit with no frame showing both
 * or neither.
 */
function Chip({
  chord,
  label,
  index,
  count,
  active,
  reordering,
  hidden,
  onMeasure,
  onSelect,
}: ChipProps) {
  return (
    <AnimatedView
      layout={LinearTransition.duration(190)}
      className={hidden ? 'opacity-0' : undefined}
      onLayout={(e: LayoutChangeEvent) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        onMeasure(index, { x, y, w: width, h: height });
      }}
    >
      <Pressable
        onPress={() => onSelect(chord)}
        disabled={reordering}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={
          reordering
            ? `${chord.name}, position ${index + 1} of ${count}, drag to move`
            : `${chord.name}, edit on fretboard`
        }
        className="active:opacity-70"
      >
        <ChipFace
          chord={chord}
          label={label}
          position={index + 1}
          reordering={reordering}
          active={active}
        />
      </Pressable>
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
function ChipFace({ chord, label, position, reordering, active }: FaceProps) {
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
