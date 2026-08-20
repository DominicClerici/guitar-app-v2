import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useFacePaint, type FaceSpec } from '@/components/buttonFace';
import { Face } from '@/components/Face';
import { SquirclePressable } from '@/components/Squircle';

/**
 * A choice with room to explain itself: a title, a line of description, and a mark saying whether
 * it is taken.
 *
 * `SelectableChip` is the same idea for a choice whose label is the whole of it — a root, a key.
 * This is for the ones that need a sentence before they can be chosen, which is what makes it a
 * card rather than a chip. Both paint from the same two faces, so a screen carrying one of each
 * still reads as one page.
 *
 * The mark is the only thing that differs between picking one of a set and turning one thing on,
 * and it is what the shape of the indicator says: a circle takes one, a square takes any number.
 * The accessibility role follows it, so the difference is announced as well as drawn.
 */

const SELECTED: FaceSpec = {
  fill: '--accent-wash',
  stroke: '--accent-line',
  text: 'text-accent',
  tint: '--accent',
  press: 'active:opacity-70',
};

const RESTING: FaceSpec = {
  fill: '--surface',
  stroke: '--line-soft',
  text: 'text-ink',
  tint: '--ink-faint',
  press: 'active:opacity-70',
};

interface Props {
  title: string;
  /** One line, in the user's own terms. What makes this a card rather than a chip. */
  description: string;
  selected: boolean;
  /** A circle for one-of-a-set, a square for a thing turned on and off. */
  mark: 'one' | 'many';
  /** Sits under the description — a pair of links, on the card that needs them. */
  footer?: ReactNode;
  onPress: () => void;
}

export function OptionCard({ title, description, selected, mark, footer, onPress }: Props) {
  const paint = useFacePaint();

  const spec = selected ? SELECTED : RESTING;
  // Half the 20px box is as far as a corner can go, which is how one asks to be a circle.
  const round = mark === 'one' ? 10 : 6;

  return (
    <SquirclePressable
      onPress={onPress}
      accessibilityRole={mark === 'one' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected, selected }}
      accessibilityLabel={title}
      accessibilityHint={description}
      radius={13}
      fill={paint(spec.fill)}
      stroke={paint(spec.stroke)}
      strokeWidth={1}
      className={`flex-row items-start gap-[12px] px-[15px] py-[13px] ${spec.press}`}
    >
      <View className="flex-1">
        <Text className={`text-[15.5px] font-semibold tracking-[-0.2px] ${spec.text}`}>
          {title}
        </Text>
        <Text className="mt-[3px] text-[13px] leading-[18px] text-ink-muted">{description}</Text>
        {footer}
      </View>

      {/* Nudged down to sit on the title's own line rather than the card's centre, which drifts as
          the description wraps. */}
      <View className="mt-[2px] h-[20px] w-[20px] items-center justify-center">
        <Face
          fill={selected ? '--accent' : 'transparent'}
          stroke={selected ? '--accent' : '--line'}
          radius={round}
        />
        {selected ? (
          <SymbolView name="checkmark" size={11} weight="bold" tintColor={paint('--on-accent')} />
        ) : null}
      </View>
    </SquirclePressable>
  );
}
