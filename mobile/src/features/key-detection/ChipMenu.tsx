import { BlurView } from 'expo-blur';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Pressable, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Easing, FadeIn, FadeOut, withTiming } from 'react-native-reanimated';
import { useUniwind, withUniwind } from 'uniwind';

import { AnimatedView } from '@/components/AnimatedView';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { useToken } from '@/lib/tokens';

import { MENU_ITEMS, menuFrame, type Rect } from './chipGeometry';

interface Item {
  symbol: SFSymbol;
  label: string;
  /** What the action does to the chord, for a screen reader. */
  hint: string;
  destructive?: boolean;
}

/**
 * The three things you can do to a chord in the progression, in the order the
 * finger reaches them on the way down. Destructive last, and the run has to stay
 * `MENU_ITEMS` long — that constant is what the pan hit-tests against.
 */
export const CHIP_MENU_ITEMS: Item[] = [
  { symbol: 'pencil', label: 'Select', hint: 'put back on the neck to edit' },
  { symbol: 'magnifyingglass', label: 'Analyze', hint: 'open in the chord detector' },
  { symbol: 'trash', label: 'Delete', hint: 'remove from the progression', destructive: true },
];

/** How far the backdrop's hole is cut outside the held chip. */
const HOLE_PAD = 5;

const BlurLayer = withUniwind(BlurView);
/**
 * Enough blur to separate the card from the neck behind it without doing the work
 * of the surface wash on top, which is what actually carries the contrast. Kept low
 * because the wash is already half-weight: a heavy blur under it reads as fog.
 */
const BLUR_INTENSITY = 40;

// The card grows out of the chip above it rather than fading in place: a short drop
// and a little scale, eased out so it decelerates into place. No spring — the chip
// above it does the springing, and two overshoots at once read as wobble.
const CARD_IN = { duration: 210, easing: Easing.out(Easing.cubic) };

function cardIn() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ translateY: -8 }, { scale: 0.94 }] },
    animations: {
      opacity: withTiming(1, { duration: 130, easing: Easing.out(Easing.quad) }),
      transform: [{ translateY: withTiming(0, CARD_IN) }, { scale: withTiming(1, CARD_IN) }],
    },
  };
}

const CARD_OUT = { duration: 130, easing: Easing.in(Easing.quad) };

function cardOut() {
  'worklet';
  return {
    initialValues: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
    animations: {
      opacity: withTiming(0, { duration: 110, easing: Easing.in(Easing.quad) }),
      transform: [{ translateY: withTiming(-6, CARD_OUT) }, { scale: withTiming(0.96, CARD_OUT) }],
    },
  };
}

interface Props {
  /** The held chip's rect, in window coordinates. */
  anchor: Rect;
  /** Item the finger is currently over, or -1. */
  focused: number;
  chordName: string;
  onActivate: (index: number) => void;
  onDismiss: () => void;
}

/**
 * The menu that hangs off a held chip, drawn at the screen's root because the chip
 * row lives inside two scroll views and both of them clip.
 *
 * The backdrop is four panels tiling around a hole over the chip rather than one
 * sheet over everything. That does two jobs at once: the held chip stays undimmed
 * and reachable — so the same pan that opened the menu can still drag it into a
 * reorder — while every other chip is covered, which is what makes a tap anywhere
 * else read as dismissing rather than as picking a different chord.
 */
export function ChipMenu({ anchor, focused, chordName, onActivate, onDismiss }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // The blur takes a tint rather than a colour, so it is the one thing on the card that cannot
  // follow the theme by reading a token. A dark blur under a light wash comes out as a grey
  // smear; `useUniwind` resolves `system` to the appearance actually in force and re-renders on
  // the crossing, and `expo-blur`'s tints happen to be named for the themes exactly.
  const { theme } = useUniwind();

  const frame = menuFrame(anchor, width, height, insets.bottom);
  const hole = {
    x: anchor.x - HOLE_PAD,
    y: anchor.y - HOLE_PAD,
    w: anchor.w + HOLE_PAD * 2,
    h: anchor.h + HOLE_PAD * 2,
  };

  return (
    <View className="absolute inset-0 z-50" pointerEvents="box-none">
      <AnimatedView
        entering={FadeIn.duration(150)}
        exiting={FadeOut.duration(130)}
        className="absolute inset-0"
        pointerEvents="box-none"
      >
        <Panel
          style={{ left: 0, top: 0, right: 0, height: Math.max(0, hole.y) }}
          onPress={onDismiss}
        />
        <Panel
          style={{ left: 0, top: hole.y + hole.h, right: 0, bottom: 0 }}
          label={`Dismiss menu for ${chordName}`}
          onPress={onDismiss}
        />
        <Panel
          style={{ left: 0, top: hole.y, width: Math.max(0, hole.x), height: hole.h }}
          onPress={onDismiss}
        />
        <Panel
          style={{ left: hole.x + hole.w, top: hole.y, right: 0, height: hole.h }}
          onPress={onDismiss}
        />
      </AnimatedView>

      {/* Deliberately not `accessibilityViewIsModal`: that would hide the backdrop
          from VoiceOver along with the page behind it, and the backdrop is the only
          way out of here. */}
      <AnimatedView
        entering={cardIn}
        exiting={cardOut}
        className="absolute"
        style={{ left: frame.x, top: frame.y, width: frame.w }}
      >
        <View className="overflow-hidden rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom">
          {/* The blur sits under the surface wash rather than replacing it: the wash
              is what keeps the labels readable over whatever the card lands on —
              usually the fretboard, which is busy. On Android the blur only runs on
              SDK 31 and up; below that it degrades to the wash on its own. */}
          <BlurLayer
            tint={theme}
            intensity={BLUR_INTENSITY}
            blurMethod="dimezisBlurViewSdk31Plus"
            className="absolute inset-0"
          />
          <View className="bg-surface-glass py-[5px]">
            {CHIP_MENU_ITEMS.slice(0, MENU_ITEMS).map((item, i) => (
              <Row
                key={item.label}
                item={item}
                chordName={chordName}
                focused={i === focused}
                onPress={() => onActivate(i)}
              />
            ))}
          </View>
        </View>
      </AnimatedView>
    </View>
  );
}

/** One panel of the backdrop. Carries both the dim and the dismiss. */
function Panel({
  style,
  label,
  onPress,
}: {
  style: ViewStyle;
  label?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessible={label !== undefined}
      accessibilityRole={label === undefined ? undefined : 'button'}
      accessibilityLabel={label}
      className="absolute bg-scrim"
      style={style}
    />
  );
}

/**
 * One action. Focus is set instantly rather than animated — while the finger is
 * sliding down the card this is a cursor, and a cursor that eased would lag it.
 */
function Row({
  item,
  chordName,
  focused,
  onPress,
}: {
  item: Item;
  chordName: string;
  focused: boolean;
  onPress: () => void;
}) {
  const ink = useToken('--ink', '#eef0f4');
  const accent = useToken('--accent', '#5ec8c2');
  const rose = useToken('--rose', '#e0788f');

  const tint = item.destructive ? rose : focused ? accent : ink;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.label} ${toAccidentalGlyphs(chordName)} — ${item.hint}`}
      // h-[44px] is MENU_ITEM_H, which the pan divides the card by to find the
      // item under the finger — a Tailwind class has to be a static string, so the
      // two have to move together.
      //
      // The rule sets the destructive action apart from the two that only move the
      // chord around; the first two need no seam between them.
      className={`h-[44px] flex-row items-center gap-[11px] px-[14px] active:opacity-70 ${
        item.destructive ? 'border-t border-t-line-soft' : ''
      } ${focused ? (item.destructive ? 'bg-rose-wash' : 'bg-accent-wash') : ''}`}
    >
      <SymbolView name={item.symbol} size={15} weight="semibold" tintColor={tint} />
      <Text
        className={`text-[15px] font-medium tracking-[-0.2px] ${
          item.destructive ? 'text-rose' : focused ? 'text-accent' : 'text-ink'
        }`}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}
