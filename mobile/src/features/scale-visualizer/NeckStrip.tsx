import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Face } from '@/components/Face';
import type { Position } from '@/lib/guitar-positions';
import { useToken } from '@/lib/tokens';

interface Props {
  positions: Position[];
  position: Position | null;
  playing: boolean;
  onStep: (delta: number) => void;
  onAll: () => void;
  onTogglePlay: () => void;
  onExpand: () => void;
}

/**
 * The two things you reach for with a guitar in your hands: which box is showing,
 * and whether to hear it. Sits directly under the neck and never scrolls away.
 *
 * The whole neck is one of the pager's stops rather than a mode you leave, so its
 * label is a destination like any other — and tapping the label from a box returns
 * to it.
 */
export function NeckStrip({
  positions,
  position,
  playing,
  onStep,
  onAll,
  onTogglePlay,
  onExpand,
}: Props) {
  return (
    <View className="flex-row items-center gap-[8px] px-[18px]">
      <View className="h-[50px] flex-1 flex-row items-center px-[2px]">
        <Face name="card" radius={10} />
        <Step direction="left" onPress={() => onStep(-1)} />

        <Button
          variant="ghost"
          size="inline"
          disabled={!position}
          accessibilityLabel={position ? 'Show the whole neck' : 'Showing the whole neck'}
          className="flex-1"
          onPress={onAll}
        >
          <View className="items-center">
            <Text className="text-[13px] font-medium tracking-[-0.1px] text-ink">
              {position ? position.label : 'All positions'}
            </Text>
            <Text className="mt-[2px] font-mono text-[9px] tracking-[1.2px] text-ink-faint">
              {position
                ? `FRETS ${position.from}–${position.to}`
                : `${positions.length} ${positions.length === 1 ? 'BOX' : 'BOXES'}`}
            </Text>
          </View>
        </Button>

        <Step direction="right" onPress={() => onStep(1)} />
      </View>

      <Button
        variant={playing ? 'soft' : 'secondary'}
        size="lg"
        square
        radius={10}
        icon={playing ? 'stop.fill' : 'play.fill'}
        disabled={!positions.length}
        accessibilityLabel={playing ? 'Stop' : 'Play the scale'}
        onPress={onTogglePlay}
      />
      <Button
        variant="secondary"
        size="lg"
        square
        radius={10}
        icon="arrow.up.left.and.arrow.down.right"
        accessibilityLabel="Show the whole neck full screen"
        onPress={onExpand}
      />
    </View>
  );
}

function Step({ direction, onPress }: { direction: 'left' | 'right'; onPress: () => void }) {
  const muted = useToken('--ink-muted', '#9aa0aa');

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={direction === 'left' ? 'Previous position' : 'Next position'}
      className="h-full w-[36px] items-center justify-center active:opacity-55"
    >
      <SymbolView
        name={direction === 'left' ? 'chevron.left' : 'chevron.right'}
        size={13}
        weight="semibold"
        tintColor={muted}
      />
    </Pressable>
  );
}
