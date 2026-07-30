import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState, type ComponentType, type RefObject } from 'react';
import { useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  measure,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import type { ProgressionChord, RomanLabel } from '@/lib/key-analysis';

import { Chip, ChipFace } from './ChipFace';
import {
  EDGE_SPEED,
  HOVER_SLACK,
  dragIntent,
  edgePull,
  menuItemAt,
  slotNear,
  type Rect,
} from './chipGeometry';

const LONG_PRESS_MS = 400;
/**
 * The hold, as the chip plays it. Nothing happens for the first stretch, so a tap
 * is a tap; after that the chip sinks steadily to `PRESS_SCALE` and arrives there
 * exactly as the menu opens, which is what makes the length of the hold legible
 * without a spinner. The spring out of it is only just under-damped — enough for a
 * single soft rebound past the resting size, not a wobble — and `RELEASE` is the
 * way back when the hold is abandoned early.
 */
const PRESS_DELAY = 80;
const PRESS_SCALE = 0.95;
const PRESS_SINK = {
  duration: LONG_PRESS_MS - PRESS_DELAY,
  easing: Easing.inOut(Easing.quad),
};
/** How far the chip swells once the menu is up. */
const HELD_SCALE = 1.03;
const HELD_SPRING = { damping: 50, stiffness: 800 };
const RELEASE = { duration: 200, easing: Easing.out(Easing.cubic) };

const LIFT_SCALE = 1.06;
/** How solid the chip in hand is, so the row shows through underneath it. */
const LIFT_OPACITY = 0.5;
const SETTLE = { duration: 200 };

// What the touch on a chip has turned into. The pan runs all four, and which one
// it is in decides what movement means and what letting go does.
const IDLE = 0;
/** Menu is up, finger still down, nothing committed either way yet. */
const DECIDING = 1;
/** Finger is working the menu; letting go over an item fires it. */
const MENU = 2;
/** Chip is out of the row and riding the finger. */
const REORDER = 3;

interface Props {
  chords: ProgressionChord[];
  labels: RomanLabel[];
  /** The chord currently being edited on the neck, if any. */
  activeId: string | null;
  /** Whether a drag can start at all — false with one chord. */
  canReorder: boolean;
  /** The chord whose menu is up, if any. */
  menuTargetId: string | null;
  /** That menu has been left up with no finger on it. */
  menuLatched: boolean;
  onSelect: (chord: ProgressionChord) => void;
  onReorder: (from: number, to: number) => void;
  onOpenMenu: (index: number, anchor: Rect) => void;
  onFocusMenu: (index: number) => void;
  onReleaseMenu: (focused: number, wasLatched: boolean) => void;
  onDismissMenu: () => void;
  /** A chip is in hand, so the page should stop scrolling out from under it. */
  onDragging: (dragging: boolean) => void;
}

/**
 * The progression, in order, on one line that scrolls when it outgrows the
 * screen. Each chip carries its roman numeral in the displayed key — amber when
 * the chord is borrowed from outside it. Tapping a chip loads it onto the neck to
 * edit; holding one opens a menu beneath it.
 *
 * That hold is one gesture with two ways out, and which one you get is decided by
 * the direction you leave the chip in. Down, into the card, works the menu. Any
 * other direction pulls the chip out of the row and into a reorder, where the
 * numerals give way to positions because order is the only thing that matters.
 * Neither is chosen for you: the hold opens the menu and then waits, and letting
 * go without having moved leaves the menu up to be worked with a second touch.
 *
 * The drag lives here rather than on each chip: one pan over the whole row can be
 * hit-tested against the measured slots, and the chip riding the finger can be
 * drawn as an overlay following the finger directly — which is what keeps it off
 * the layout's timeline. See `pan` below.
 *
 * Three coordinate spaces are in play. Slots are measured inside the scroll
 * content, so they survive scrolling; the finger arrives in viewport coordinates;
 * and the menu is drawn at the screen's root, in window coordinates. The row's
 * scroll offset bridges the first two and its measured origin bridges to the
 * third, and everything the gesture does — hit-testing, placing the overlay,
 * anchoring the card — goes through them.
 */
export function ProgressionChips({
  chords,
  labels,
  activeId,
  canReorder,
  menuTargetId,
  menuLatched,
  onSelect,
  onReorder,
  onOpenMenu,
  onFocusMenu,
  onReleaseMenu,
  onDismissMenu,
  onDragging,
}: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  // The row of chips itself. Measured on the UI thread at the moment of the hold,
  // rather than on layout: the page scrolls between the two, and a stale origin
  // would hang the menu off where the chip used to be.
  const rowRef = useAnimatedRef<View>();

  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Where every slot sits, mirrored into a shared value so the drag can hit-test
  // against it on the UI thread. `base` is a copy frozen at drag start.
  const measured = useRef<Rect[]>([]);
  const rects = useSharedValue<Rect[]>([]);
  const base = useSharedValue<Rect[]>([]);

  const phase = useSharedValue(IDLE);
  const slot = useSharedValue(-1); // slot the held chip currently occupies
  // Which chord is under the finger and how far through the hold it is. Kept by
  // chord rather than by slot so it survives a reorder, and never cleared — a chip
  // at scale 1 is indistinguishable from one that was never pressed, and clearing
  // it would cut the animation back to rest instead of letting it play.
  const pressId = useSharedValue('');
  const pressScale = useSharedValue(1);
  const anchor = useSharedValue<Rect>({ x: 0, y: 0, w: 0, h: 0 }); // held chip, in window space
  const focus = useSharedValue(-1); // menu item under the finger
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
  const menuOpen = menuTargetId !== null;
  const dragging = dragId !== null;
  // The pan tracks the press by chord id, and the ids are all of `chords` it needs.
  const ids = chords.map((c) => c.id);

  const measureSlot = (index: number, rect: Rect) => {
    measured.current[index] = rect;
    rects.value = [...measured.current];
  };

  const beginDragAt = (index: number) => {
    const chord = chords[index];
    if (!chord) return;
    setDragId(chord.id);
    onDragging(true);
    // The card has served its purpose the moment the chip leaves the row.
    onDismissMenu();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const moveTo = (from: number, to: number) => {
    onReorder(from, to);
    void Haptics.selectionAsync();
  };

  const endDrag = () => {
    setDragId(null);
    onDragging(false);
  };

  // Callbacks only become worklets if they hang off an unbroken chain from
  // `Gesture.Pan()` — the babel plugin matches on the syntax, not the value. Break
  // it and the whole gesture quietly moves to the JS thread.
  const pan = Gesture.Pan()
    // The row only scrolls itself once this has failed, which is what lets a plain
    // swipe scroll and a held chip drag from the same touch. The cast is because
    // the relation is typed for a ref to a component type, while what it wants —
    // and what an animated ref holds — is the mounted instance.
    // eslint-disable-next-line react-hooks/refs -- declaring a gesture relation, not reading the ref
    .blocksExternalGesture(scrollRef as unknown as RefObject<ComponentType | null>)
    // Touch down, which is well before the hold has earned anything. All this does
    // is start the chip sinking, so the hold has something to show for itself while
    // it runs. `onFinalize` puts it back if the hold never lands, and because the
    // sink is delayed a tap is over before it would have started.
    .onBegin((e) => {
      // With the card already up there is no hold to run: this chip is at its held
      // size and the touch is a drag into the menu, not another attempt at opening
      // it. Sinking it again would undo the arrival it just played.
      if (menuOpen) return;

      const i = slotNear(rects.value, count, e.x + scrollX.value, e.y, 0);
      if (i < 0) return;

      pressId.value = ids[i];
      pressScale.value = withDelay(PRESS_DELAY, withTiming(PRESS_SCALE, PRESS_SINK));
    })
    // eslint-disable-next-line react-hooks/refs -- `measure(rowRef)` below runs on the UI thread when the hold fires, not during render
    .onStart((e) => {
      const x = e.x + scrollX.value;
      const i = slotNear(rects.value, count, x, e.y, 0);
      // Started on a gutter rather than a chip — sit this one out.
      if (i < 0) {
        slot.value = -1;
        held.value = false;
        phase.value = IDLE;
        return;
      }

      // The hold has landed. Out of the sink and past the resting size, settling
      // back down through the overshoot.
      pressId.value = ids[i];
      pressScale.value = withSpring(HELD_SCALE, HELD_SPRING);

      const r = rects.value[i];
      slot.value = i;
      held.value = true;
      fingerX.value = e.x;
      fingerY.value = e.y;
      rowY.value = e.y;
      grabX.value = x - r.x;
      grabY.value = e.y - r.y;
      focus.value = -1;
      phase.value = DECIDING;

      const origin = measure(rowRef);
      anchor.value = {
        x: (origin ? origin.pageX : 0) + r.x - scrollX.value,
        y: (origin ? origin.pageY : 0) + r.y,
        w: r.w,
        h: r.h,
      };

      runOnJS(onOpenMenu)(i, anchor.value);
    })
    .onUpdate((e) => {
      if (slot.value < 0) return;
      fingerX.value = e.x;
      fingerY.value = e.y;

      // Measured from where the finger landed rather than from where the gesture
      // activated, so the two ways in behave the same: a hold activates without
      // having moved, while a touch on a menu that is already up activates only
      // once it has, and reading the translation covers both.
      if (phase.value === DECIDING) {
        const intent = dragIntent(e.translationX, e.translationY);
        if (intent === 'menu') {
          phase.value = MENU;
        } else if (intent === 'reorder' && canReorder) {
          base.value = rects.value;
          pulled.value = scrollX.value;
          lift.value = withTiming(1, { duration: 130 });
          phase.value = REORDER;
          // The overlay carries its own weight from here. This is for the chip in
          // the row, which is about to go invisible and has to be back at rest for
          // the moment the drop hands it the slot again.
          pressScale.value = withTiming(1, { duration: 130 });
          runOnJS(beginDragAt)(slot.value);
        } else {
          return;
        }
      }

      if (phase.value === MENU) {
        const next = menuItemAt(
          anchor.value,
          e.absoluteX,
          e.absoluteY,
          screenW,
          screenH,
          insets.bottom,
        );
        if (next !== focus.value) {
          focus.value = next;
          runOnJS(onFocusMenu)(next);
        }
        return;
      }

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
        runOnJS(moveTo)(slot.value, target);
        slot.value = target;
      }
    })
    .onFinalize(() => {
      held.value = false;
      // A pan that never activated — a tap, or a swipe that scrolled the row — also
      // finalizes, and `slot` still holds whatever the last real gesture left in
      // it. `phase` is the one thing only `onStart` sets, so it is what says
      // whether there is anything here to finish.
      const from = phase.value;
      if (from === IDLE) {
        // A hold that was abandoned partway. Unwind the sink.
        pressScale.value = withTiming(1, RELEASE);
        return;
      }
      phase.value = IDLE;

      if (from === REORDER) {
        // `slot` deliberately keeps its value here. The overlay reads it to find the
        // rect it is settling into, and it stays mounted for a commit or two after
        // this fires; clearing it now would lose the home rect and snap the chip
        // back to the finger on its last frame. The next `onStart` sets it anyway.
        lift.value = withTiming(0, SETTLE, (finished) => {
          if (finished) runOnJS(endDrag)();
        });
        return;
      }

      const landed = from === MENU ? focus.value : -1;
      focus.value = -1;
      runOnJS(onReleaseMenu)(landed, menuLatched);
    });

  // Out of the menu a chip has to be held before anything happens, so a plain
  // swipe still scrolls the row. Once the menu is up, the backdrop has covered
  // every other chip and locked the row, so movement alone is enough — and has to
  // be, or reaching the card would mean holding twice.
  if (!menuOpen) pan.activateAfterLongPress(LONG_PRESS_MS);

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
      runOnJS(moveTo)(slot.value, target);
      slot.value = target;
    }
  }, false);

  useEffect(() => {
    autoScroll.setActive(dragId !== null);
  }, [autoScroll, dragId]);

  // The menu can also be put away without the pan hearing about it — a tap on the
  // backdrop, or an item fired from the card. Either way the chip it swelled for has
  // to come back down, and this prop is the only notice the row gets.
  useEffect(() => {
    if (menuTargetId === null) pressScale.value = withTiming(1, RELEASE);
  }, [menuTargetId, pressScale]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  // The overlay is positioned by the finger alone, so nothing about it waits on a
  // layout pass. `lift` doubles as the blend back to the chip's slot: as it decays
  // the overlay glides home, regains its weight, and because the home rect is read
  // every frame a late measurement adjusts the target mid-glide instead of jumping.
  //
  // It is drawn outside the scroll view, which clips, so the chip in hand can be
  // carried past either end of the row and above or below it without being cut.
  // That puts it in viewport coordinates, so the home rect — measured in the
  // scrolling content — has to have the row's offset taken back off it.
  const overlayStyle = useAnimatedStyle(() => {
    const home = rects.value[slot.value];
    const t = lift.value;
    // While the chip is in hand the row's offset is whatever the pull last asked
    // for; reading it back from the scroll event instead would trail the finger by
    // a frame at speed.
    const offset = held.value ? pulled.value : scrollX.value;
    const x = fingerX.value - grabX.value;
    const y = fingerY.value - grabY.value;

    return {
      transform: [
        { translateX: home ? x * t + (home.x - offset) * (1 - t) : x },
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
      {/* Pulled out to the sides by exactly the slack the row keeps at each end, so
          the first and last chip still line up with the rest of the page. Both the
          viewport and the content grow by the same amount, so the scroll range and
          the frame the gesture reads the finger in are unchanged. */}
      <View
        className="-mx-[6px]"
        onLayout={(e: LayoutChangeEvent) => setViewportW(e.nativeEvent.layout.width)}
      >
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onContentSizeChange={(w) => setContentW(w)}
          // While a chip is in hand the row is driven frame by frame from the edge
          // bands; leaving the native scroll live would let it fight that. With a
          // menu up the row is pinned for a different reason: the backdrop's hole
          // is cut where the chip was measured, so it must not move.
          scrollEnabled={!dragging && !menuOpen}
        >
          {/* Padding rather than a wrapper: it is room inside the scrolling content
              for a held chip to swell into, at both ends of the row as much as above
              and below it, and the scroll view clips to its own bounds either way.
              The row stays the frame the slot rects and the measured origin are
              expressed in — the padding shows up in the rects, which is what keeps
              the two agreeing. */}
          <View ref={rowRef} className="flex-row gap-[8px] px-[6px] py-[5px]">
            {chords.map((chord, i) => (
              <Chip
                key={chord.id}
                chord={chord}
                label={labels[i]}
                index={i}
                count={count}
                active={chord.id === activeId}
                dragging={dragging}
                held={chord.id === menuTargetId}
                hidden={chord.id === dragId}
                pressId={pressId}
                pressScale={pressScale}
                onMeasure={measureSlot}
                onSelect={onSelect}
                onDismissMenu={onDismissMenu}
              />
            ))}
          </View>
        </Animated.ScrollView>

        {/* Outside the scroll view, in the viewport's own coordinates, so nothing
            about the chip in hand is clipped. `left/top-0` is the row's origin at
            rest, which is why the overlay's transform is the row's offset away from
            the slot rects. */}
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
