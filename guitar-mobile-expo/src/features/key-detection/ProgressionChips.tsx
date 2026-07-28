import { useEffect, useRef, useState, type ComponentType, type RefObject } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  LinearTransition,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useFrameCallback,
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
/** How solid the chip in hand is, so the row shows through underneath it. */
const LIFT_OPACITY = 0.5;
const SETTLE = { duration: 200 };
/** How far into a gutter still counts as being over the neighbouring slot. */
const HOVER_SLACK = 20;
/** Band at each end of the row where a held chip starts pulling the list along. */
const EDGE_BAND = 64;
/** Travel with the finger pinned to the very edge, in points per second. */
const EDGE_SPEED = 1000;

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

/**
 * How hard the row is being pulled at `x`, from -1 (hard left) to 1 (hard right),
 * and 0 anywhere in the middle. Squared at the call site so the pull comes on
 * gently at the edge of the band and only runs away in the last few points.
 */
function edgePull(x: number, width: number): number {
  'worklet';
  if (x < EDGE_BAND) return Math.max(-1, (x - EDGE_BAND) / EDGE_BAND);
  if (x > width - EDGE_BAND) return Math.min(1, (x - (width - EDGE_BAND)) / EDGE_BAND);
  return 0;
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
  /** Called when a drag that turned reorder mode on has finished with it. */
  onEndReorder: () => void;
}

/**
 * The progression, in order, on one line that scrolls when it outgrows the
 * screen. Each chip carries its roman numeral in the displayed key — amber when
 * the chord is borrowed from outside it. Tapping a chip loads it onto the neck to
 * edit; holding one hands the row over to dragging, where the numerals give way
 * to positions because order is the only thing that matters. A mode entered that
 * way is only borrowed for the one drag — the row is back to normal on release.
 *
 * The drag lives here rather than on each chip: one pan over the whole row can be
 * hit-tested against the measured slots, and the chip riding the finger can be
 * drawn as an overlay in the row's own coordinates — which is what keeps it off
 * the layout's timeline. See `pan` below.
 *
 * Two coordinate spaces are in play. Slots are measured inside the scroll content,
 * so they survive scrolling; the finger arrives in viewport coordinates. The row's
 * offset is the bridge between them, and everything the drag does — hit-testing,
 * placing the overlay — goes through it, which is what keeps the chip under the
 * finger while the row is travelling beneath it.
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
  onEndReorder,
}: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  // Where every slot sits, mirrored into a shared value so the drag can hit-test
  // against it on the UI thread. `base` is a copy frozen at drag start.
  const measured = useRef<Rect[]>([]);
  const rects = useSharedValue<Rect[]>([]);
  const base = useSharedValue<Rect[]>([]);

  const slot = useSharedValue(-1); // slot the dragged chip currently occupies
  const borrowedMode = useSharedValue(false); // this drag turned reorder mode on
  const lift = useSharedValue(0); // 0 parked, 1 fully in hand
  const held = useSharedValue(false); // finger still down, as opposed to settling
  const fingerX = useSharedValue(0); // finger in viewport coordinates
  const fingerY = useSharedValue(0);
  const rowY = useSharedValue(0); // where the row sat under the finger at grab
  const grabX = useSharedValue(0); // where inside the chip the finger took hold
  const grabY = useSharedValue(0);

  // Where the row is parked, and where the edge pull is steering it. The scroll
  // handler owns `scrollX`; the drag owns `pulled`, which it seeds from `scrollX`
  // and then drives itself — native scrolling is off for the duration, so nothing
  // else can move the row out from under it.
  const scrollX = useSharedValue(0);
  const pulled = useSharedValue(0);

  const [dragId, setDragId] = useState<string | null>(null);
  const [viewportW, setViewportW] = useState(0);
  const [contentW, setContentW] = useState(0);
  const count = chords.length;
  const maxScroll = Math.max(0, contentW - viewportW);

  const measure = (index: number, rect: Rect) => {
    measured.current[index] = rect;
    rects.value = [...measured.current];
  };

  const beginDragAt = (index: number) => {
    const chord = chords[index];
    if (chord) setDragId(chord.id);
  };

  const endDrag = (releaseMode: boolean) => {
    setDragId(null);
    if (releaseMode) onEndReorder();
  };

  // Callbacks only become worklets if they hang off an unbroken chain from
  // `Gesture.Pan()` — the babel plugin matches on the syntax, not the value. Break
  // it and the whole drag quietly moves to the JS thread.
  const pan = Gesture.Pan()
    .enabled(canReorder)
    // The row only scrolls itself once this has failed, which is what lets a plain
    // swipe scroll and a held chip drag from the same touch. The cast is because
    // the relation is typed for a ref to a component type, while what it wants —
    // and what an animated ref holds — is the mounted instance.
    // eslint-disable-next-line react-hooks/refs -- declaring a gesture relation, not reading the ref
    .blocksExternalGesture(scrollRef as unknown as RefObject<ComponentType | null>)
    .onStart((e) => {
      const x = e.x + scrollX.value;
      const i = slotNear(rects.value, count, x, e.y, 0);
      // Started on a gutter rather than a chip — sit this one out.
      if (i < 0) {
        slot.value = -1;
        held.value = false;
        return;
      }

      const r = rects.value[i];
      slot.value = i;
      base.value = rects.value;
      held.value = true;
      fingerX.value = e.x;
      fingerY.value = e.y;
      rowY.value = e.y;
      grabX.value = x - r.x;
      grabY.value = e.y - r.y;
      pulled.value = scrollX.value;
      lift.value = withTiming(1, { duration: 130 });

      borrowedMode.value = !reordering;
      if (!reordering) runOnJS(onBeginReorder)();
      runOnJS(beginDragAt)(i);
    })
    .onUpdate((e) => {
      if (slot.value < 0) return;
      fingerX.value = e.x;
      fingerY.value = e.y;

      // Read the target from the layout as it was when the drag began. Hit-testing
      // the live layout feeds each reorder into the geometry that decides the next
      // one: a narrow chip swapped past a wide one leaves the finger back over the
      // slot it just left, and the row oscillates. The frozen copy can't do that,
      // and splicing from the current slot to a target expressed in the original
      // frame still lands the chip where the finger is pointing.
      //
      // Tested against the row's own height rather than the finger's: on one line
      // only the horizontal position means anything, so lifting the chip clear of
      // the row keeps reordering instead of falling out of range.
      const target = slotNear(base.value, count, e.x + pulled.value, rowY.value, HOVER_SLACK);
      if (target >= 0 && target !== slot.value) {
        runOnJS(onReorder)(slot.value, target);
        slot.value = target;
      }
    })
    .onFinalize(() => {
      held.value = false;
      if (slot.value < 0) {
        lift.value = 0;
        return;
      }
      // `slot` deliberately keeps its value here. The overlay reads it to find the
      // rect it is settling into, and it stays mounted for a commit or two after
      // this fires; clearing it now would lose the home rect and snap the chip
      // back to the finger on its last frame. The next `onStart` sets it anyway.
      //
      // A borrowed mode is handed back here rather than on release, so the chip
      // lands as a position and the numerals return once it is home. Dropping it
      // on an unfinished settle would be a new drag taking over — that one owns
      // the mode now.
      lift.value = withTiming(0, SETTLE, (finished) => {
        if (finished) runOnJS(endDrag)(borrowedMode.value);
      });
    });

  // Out of reorder mode a chip has to be held before it will drag, so a plain
  // swipe still scrolls the row. Inside it, movement alone is enough.
  if (!reordering) pan.activateAfterLongPress(LONG_PRESS_MS);

  // A chip held near either end drags the row along under it, faster the closer to
  // the edge it gets. The row keeps moving while the finger sits still, so this
  // re-reads the target slot per frame rather than leaving it to the pan.
  //
  // Hooks that take a worklet freeze whatever it captures, so every one of them
  // has to come after the code that writes those values — this below the pan, and
  // the style below this. Move one up and the compiler calls the writes illegal.
  const autoScroll = useFrameCallback((frame) => {
    if (!held.value || slot.value < 0 || maxScroll <= 0) return;

    const pull = edgePull(fingerX.value, viewportW);
    if (pull === 0) return;

    const dt = (frame.timeSincePreviousFrame ?? 16) / 1000;
    const step = pull * Math.abs(pull) * EDGE_SPEED * dt;
    const next = Math.min(maxScroll, Math.max(0, pulled.value + step));
    if (next === pulled.value) return;

    pulled.value = next;
    scrollTo(scrollRef, next, 0, false);

    const target = slotNear(base.value, count, fingerX.value + next, rowY.value, HOVER_SLACK);
    if (target >= 0 && target !== slot.value) {
      runOnJS(onReorder)(slot.value, target);
      slot.value = target;
    }
  }, false);

  useEffect(() => {
    autoScroll.setActive(dragId !== null);
  }, [autoScroll, dragId]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  // The overlay is positioned by the finger alone, so nothing about it waits on a
  // layout pass. `lift` doubles as the blend back to the chip's slot: as it decays
  // the overlay glides home, regains its weight, and because the home rect is read
  // every frame a late measurement adjusts the target mid-glide instead of jumping.
  const overlayStyle = useAnimatedStyle(() => {
    const home = rects.value[slot.value];
    const t = lift.value;
    // While the chip is in hand the row's offset is whatever the pull last asked
    // for; reading it back from the scroll event instead would trail the finger by
    // a frame at speed.
    const offset = held.value ? pulled.value : scrollX.value;
    const x = fingerX.value + offset - grabX.value;
    const y = fingerY.value - grabY.value;

    return {
      transform: [
        { translateX: home ? x * t + home.x * (1 - t) : x },
        { translateY: home ? y * t + home.y * (1 - t) : y },
        { scale: 1 + t * (LIFT_SCALE - 1) },
      ],
      opacity: 1 - t * (1 - LIFT_OPACITY),
    };
  });

  const dragIndex = dragId === null ? -1 : chords.findIndex((c) => c.id === dragId);
  const dragged = dragIndex < 0 ? null : chords[dragIndex];

  return (
    <GestureDetector gesture={pan}>
      <View onLayout={(e: LayoutChangeEvent) => setViewportW(e.nativeEvent.layout.width)}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onContentSizeChange={(w) => setContentW(w)}
          // While a chip is in hand the row is driven frame by frame from the edge
          // bands; leaving the native scroll live would let it fight that.
          scrollEnabled={dragId === null}
        >
          <View className="flex-row gap-[8px]">
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
        </Animated.ScrollView>
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
