import { useState, type ReactNode } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { SquircleShape } from '@modules/expo-squircle-view';

import { haptics } from '@/lib/haptics';
import { centreOf, pillFrame, slotAt, slotsIn } from '@/lib/pill-slide';
import { APPLE_SMOOTHING } from '@/lib/squircle';
import { useTokens } from '@/lib/tokens';

import { AnimatedView } from './AnimatedView';
import { Face } from './Face';

/** Matching the tray's own `h-[38px] p-[3px]`; the three have to move together. */
const TRAY_HEIGHT = 38;
const TRAY_PAD = 3;
const PILL_HEIGHT = TRAY_HEIGHT - TRAY_PAD * 2;

/** Concentric: a pill inset by the gutter carries the radius the tray has left. */
const TRAY_RADIUS = 9;
const PILL_RADIUS = TRAY_RADIUS - TRAY_PAD;

/** Air either side of a label, and the width no option goes under however short one is. */
const LABEL_PAD = 12;
const MIN_SLOT = 42;

/** Matching the hairline every other Aurora face wears. */
const HAIRLINE = 1;

const SLIDE = { duration: 150 };

/** Overshoot that squeezes the pill halfway, and where it stops answering at all. */
const SQUEEZE_TRAVEL = 44;
const SQUEEZE_LIMIT = SQUEEZE_TRAVEL * 3;
const SQUEEZE_X = 0.14;
const SQUEEZE_Y = 0.09;

/** Horizontal intent the pan waits for, so a vertical scroll still gets through. */
const PAN_SLOP = 8;

const TINTS = ['--accent-wash', '--accent-line'] as const;

/** Fallbacks mirror `global.css`, for the moment before uniwind has resolved. */
const WASH = 'rgba(94, 200, 194, 0.12)';
const LINE = 'rgba(94, 200, 194, 0.5)';

const PILL_RADII = {
  topLeft: PILL_RADIUS,
  topRight: PILL_RADIUS,
  bottomRight: PILL_RADIUS,
  bottomLeft: PILL_RADIUS,
};

interface OptionBase {
  id: string;
  /** What a screen reader announces, where the label on its own is not it. */
  name?: string;
}

/**
 * An option is a word or a drawing of one. A drawing is handed whether it is the
 * lit one, since it has to answer the selection the way a label's ink does, and it
 * has to be named, since there is no text under it to read out.
 */
export type PillOption = OptionBase &
  (
    | { label: string; content?: undefined }
    | { label?: undefined; content: (lit: boolean) => ReactNode; name: string }
  );

interface Props {
  options: PillOption[];
  /** An id no option carries — or `null` — leaves the row with nothing chosen. */
  value: string | null;
  /**
   * Told the point on screen the choice was made at, in window coordinates: where the finger went
   * down on a tap, and where it let go of a drag. Almost every row ignores it — it is here for the
   * one setting whose change is drawn *from* the control that made it (see `lib/theme`).
   */
  onChange: (id: string, at: { x: number; y: number }) => void;
  /**
   * Told that a finger has gone down somewhere on the row, before it is known which option — if
   * any — is being chosen. For a row whose choice sets something slow enough in motion that it is
   * worth starting during the press rather than after it (see `lib/theme`); every other row leaves
   * it out. It may be called and come to nothing, so it must be safe to call on a press that ends
   * in a scroll or a change of mind.
   */
  onTouch?: () => void;
  /**
   * Whether a drag reports each option it crosses onto, or only the one it is
   * let go over. Live is for a setting you want to hear or see as you sweep
   * across it; release is for one that costs something to apply.
   */
  commit?: 'live' | 'release';
  /** Names the group in each option's announcement. */
  label?: string;
  className?: string;
}

/**
 * A row of exclusive choices with one pill travelling between them. It is the
 * same idea as `Segmented` — a recessed tray, the chosen option lit — but the
 * selection is a single object that moves and resizes onto what you pick rather
 * than a highlight appearing somewhere else, and it can be dragged: press the
 * pill and it comes with the finger, reporting each option it arrives at. Push
 * it past either end and it squeezes up against the wall, which is how it says
 * there is nothing further along without stopping dead under the finger.
 *
 * A row of exactly two options is a switch: tapping the one the pill is already
 * on throws it to the other, so the control answers a tap anywhere on it rather
 * than only on the half you are not using. Longer rows do not do this — tapping
 * the chosen option there leaves it chosen.
 *
 * Give it its width from the call site. The options divide what it is handed
 * equally, each of them a target across its whole share, and the pill fills the
 * share it is on — so the gutter around it is the same on all four sides
 * wherever it sits. An option whose label will not fit an equal share takes the
 * width it needs and the others give up the difference between them.
 *
 * A `value` matching no option is a row with nothing chosen: the pill fades out
 * where it last was rather than moving somewhere neutral, so a setting that has
 * gone off the row — a length typed into the field beside it — reads as none of
 * these rather than as one of them.
 */
export function PillSelector({
  options,
  value,
  onChange,
  onTouch,
  commit = 'live',
  label,
  className = '',
}: Props) {
  const [tray, setTray] = useState(0);
  const [labels, setLabels] = useState<Record<string, number>>({});
  /** The option the pill is over mid-drag, which is not yet the one that is set. */
  const [hovered, setHovered] = useState<number | null>(null);

  /** Which option is chosen, and −1 for none of them. */
  const selected = options.findIndex((option) => option.id === value);

  // Where the pill sits when nothing is chosen: on the last thing that was, faded
  // out. It has to rest somewhere, and coming back to the option you just left is
  // less of a lurch than coming back from wherever the row starts.
  const [resting, setResting] = useState(0);
  if (selected >= 0 && selected !== resting) setResting(selected);

  const inner = Math.max(0, tray - TRAY_PAD * 2);
  const slots = slotsIn(
    options.map((option) => Math.max(MIN_SLOT, (labels[option.id] ?? 0) + LABEL_PAD * 2)),
    inner,
    TRAY_PAD,
  );

  // The two numbers the pill's worklets need, read out here: the compiler's
  // immutability analysis freezes a shared value indexed through a captured
  // object, and plain arrays of numbers are what these actually want.
  const widths = slots.map((slot) => slot.width);
  const centres = slots.map(centreOf);

  // Nothing to draw until the tray and every label have been measured — and no
  // pill until then either, which is what keeps it from sliding into place on the
  // frame it appears (see `Pill`).
  const measured = inner > 0 && options.every((option) => labels[option.id] !== undefined);

  const dragging = useSharedValue(false);
  /** Where the pill's centre is being held, while it is being held. */
  const held = useSharedValue(0);
  /** Where the finger sits within the pill, so grabbing it does not re-centre it. */
  const grab = useSharedValue(0);
  /** The slot the pill is over, so each crossing is reported exactly once. */
  const over = useSharedValue(selected);

  /** Arriving somewhere new mid-drag: felt, lit, and reported if it is wanted now. */
  const land = (index: number, x: number, y: number) => {
    setHovered(index);
    haptics.selection();
    if (commit === 'live') onChange(options[index].id, { x, y });
  };

  const settle = (index: number, x: number, y: number) => {
    setHovered(null);
    if (commit === 'release') onChange(options[index].id, { x, y });
  };

  /**
   * A tap. A row of two is a switch — tapping the lit half throws it to the
   * other, so the whole control answers wherever it is touched. A longer row is
   * not: there the options are places rather than states, and a tap on the one
   * already chosen means what it says. A drag never does this either, since
   * letting go of the pill where you found it has to be a way of changing your
   * mind.
   */
  const choose = (index: number, x: number, y: number) => {
    haptics.selection();
    const target = options.length === 2 && index === selected ? 1 - index : index;
    onChange(options[target].id, { x, y });
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-PAN_SLOP, PAN_SLOP])
    .onStart((event) => {
      const home = centres[resting] ?? TRAY_PAD;
      const half = (widths[resting] ?? MIN_SLOT) / 2;
      // Take the pill by whatever part of it you touched; take the tray anywhere
      // else and the pill comes to the finger instead.
      grab.value = Math.abs(event.x - home) <= half ? event.x - home : 0;
      held.value = event.x - grab.value;
      over.value = selected;
      dragging.value = true;
    })
    .onUpdate((event) => {
      held.value = event.x - grab.value;

      const next = slotAt(held.value, slots);
      if (next === over.value) return;
      over.value = next;
      runOnJS(land)(next, event.absoluteX, event.absoluteY);
    })
    .onFinalize((event) => {
      // A pan that never took hold — a plain tap, which the option's own
      // Pressable has already answered — has nothing to land.
      if (!dragging.value) return;
      dragging.value = false;
      runOnJS(settle)(over.value, event.absoluteX, event.absoluteY);
    });

  const lit = hovered ?? selected;

  const measure = (id: string) => (event: LayoutChangeEvent) => {
    const { width: laid } = event.nativeEvent.layout;
    setLabels((current) => (current[id] === laid ? current : { ...current, [id]: laid }));
  };

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={(event: LayoutChangeEvent) => setTray(event.nativeEvent.layout.width)}
        className={`h-[38px] flex-row items-center p-[3px] ${className}`}
      >
        <Face name="tray" radius={TRAY_RADIUS} />

        {/* Copies laid outside the row and never seen, which is the only place an
            option's own width can be read: measured inside its slot, a label long
            enough to be truncated reports the slot's width back — and the slot is
            sized from the measurement, so the two would chase each other wider
            every pass. `items-start` is what keeps them honest: stretched to the
            column, every one of them would report the widest one's width. */}
        <View
          className="pointer-events-none absolute items-start opacity-0"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {options.map((option) => (
            <View key={option.id} onLayout={measure(option.id)}>
              <Content option={option} lit={false} />
            </View>
          ))}
        </View>

        {measured ? (
          <Pill
            widths={widths}
            centres={centres}
            inner={inner}
            resting={resting}
            selected={selected}
            dragging={dragging}
            held={held}
            over={over}
          />
        ) : null}

        {options.map((option, index) => (
          <Pressable
            key={option.id}
            // The drag path knocks as it crosses into a slot, so the tap has to knock as well:
            // the two are the same choice, and only one of them being felt reads as a fault.
            // Before the choice rather than with it: what this starts does not depend on which
            // option wins, and starting it here spends the press on it instead of the moment after.
            onPressIn={onTouch}
            onPress={(event) => {
              const { pageX, pageY } = event.nativeEvent;
              choose(index, pageX, pageY);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: index === selected }}
            accessibilityLabel={
              label ? `${label}: ${option.name ?? option.label}` : (option.name ?? option.label)
            }
            // Grown to its share rather than set to it, which comes to the same
            // width — the shares fill the run exactly — and leaves the row equal
            // in the frame before the tray has been measured at all.
            style={{ flexBasis: 0, flexGrow: widths[index] || 1 }}
            className="h-full items-center justify-center"
          >
            <Content option={option} lit={index === lit} />
          </Pressable>
        ))}
      </View>
    </GestureDetector>
  );
}

interface PillProps {
  /** Each option's slot, as the plain numbers a worklet can index. */
  widths: number[];
  centres: number[];
  /** The run the pill travels along, inside the tray's gutter. */
  inner: number;
  resting: number;
  selected: number;
  dragging: SharedValue<boolean>;
  held: SharedValue<number>;
  over: SharedValue<number>;
}

/**
 * The pill, and only ever mounted onto a row that has already been measured —
 * which is what has it arrive in place rather than travel there. A derived value
 * answers its first expression outright and eases every one after it, so a pill
 * born knowing the slot it belongs in simply is in it; the same hooks kept alive
 * through the measuring would have been seeded against the left wall at a made-up
 * width, and the real numbers landing would have been a 150ms slide out of a place
 * the pill was never meant to have been.
 */
function Pill({ widths, centres, inner, resting, selected, dragging, held, over }: PillProps) {
  const [wash, line] = useTokens(TINTS);

  /** Present while something is chosen, and while a finger is choosing. */
  const shown = useDerivedValue(() => withTiming(selected >= 0 || dragging.value ? 1 : 0, SLIDE));

  /**
   * Width and position, derived rather than driven: under the finger the pill
   * tracks it, and the rest of the time each eases to whatever is now selected.
   * Letting go therefore lands the pill — and unwinds the squeeze — for free, and
   * a value set from anywhere else is followed by the same 150ms expression.
   */
  const width = useDerivedValue(() => {
    // A drag that has not crossed onto anything yet — which is every drag begun
    // with nothing chosen — is still the width of wherever the pill is resting.
    const index = dragging.value && over.value >= 0 ? over.value : resting;
    return withTiming(widths[index] ?? MIN_SLOT, SLIDE);
  });

  const centre = useDerivedValue(() => {
    if (!dragging.value) return withTiming(centres[resting] ?? TRAY_PAD, SLIDE);
    // Past the limit the squeeze has nothing left to say, so the reach is not
    // followed any further — which is also what keeps the landing 150ms from
    // wherever the finger let go rather than most of them spent flying back.
    return Math.max(
      TRAY_PAD - SQUEEZE_LIMIT,
      Math.min(TRAY_PAD + inner + SQUEEZE_LIMIT, held.value),
    );
  });

  const style = useAnimatedStyle(() => {
    const frame = pillFrame({
      centre: centre.value,
      width: width.value,
      height: PILL_HEIGHT,
      from: TRAY_PAD,
      to: TRAY_PAD + inner,
      travel: SQUEEZE_TRAVEL,
      squeezeX: SQUEEZE_X,
      squeezeY: SQUEEZE_Y,
    });

    return {
      width: frame.width,
      height: frame.height,
      opacity: shown.value,
      transform: [
        { translateX: frame.left },
        // The height it gains is taken evenly out of the tray's gutter, so a
        // squeezed pill grows into the tray rather than through it.
        { translateY: (PILL_HEIGHT - frame.height) / 2 },
      ],
    };
  });

  // Native shape rather than a `Face`: it repaints its path on every layout pass,
  // so the corners stay true squircles through a resize instead of stretching or
  // blinking a frame behind.
  return (
    <AnimatedView className="pointer-events-none absolute left-0 top-[3px]" style={style}>
      <SquircleShape
        radii={PILL_RADII}
        smoothing={APPLE_SMOOTHING}
        fill={wash ?? WASH}
        stroke={line ?? LINE}
        strokeWidth={HAIRLINE}
      />
    </AnimatedView>
  );
}

/**
 * Whatever the option wears. A component rather than a branch at each call site so
 * the copy that is measured and the copy that is seen cannot drift apart — the
 * measurement is only worth anything while the two are drawn identically.
 */
function Content({ option, lit }: { option: PillOption; lit: boolean }) {
  if (option.content) return option.content(lit);
  return <Label text={option.label} tone={lit ? 'text-accent' : 'text-ink-muted'} />;
}

function Label({ text, tone }: { text: string; tone: string }) {
  return (
    <Text numberOfLines={1} className={`text-[12.5px] font-medium tracking-[-0.1px] ${tone}`}>
      {text}
    </Text>
  );
}
