import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedView } from '@/components/AnimatedView';
import { Button } from '@/components/Button';
import { useToken } from '@/lib/tokens';

// The footer under an article opened from a pathway: the way back a step, and the one thing this
// screen is for — saying the section is read, then moving on.
//
// It sits below the article rather than over it so the last paragraph is never hidden behind it,
// which matters more here than anywhere else: reaching that last paragraph is one of the two ways
// the section marks itself done.

/** Each half of the swap. The gap between them is what makes it read as a replacement, not a fade. */
const FADE_MS = 150;
const PAUSE_MS = 50;

interface Props {
  complete: boolean;
  /** Marks the section read. Absent once there is nothing left to mark. */
  onMarkComplete: () => void;
  /** Omitted at the start of a chapter, where the control is not shown rather than disabled. */
  onPrevious?: () => void;
  /** Omitted when the chapter ends here — see `sectionNeighbours`. */
  onNext?: () => void;
}

export function SectionBar({ complete, onMarkComplete, onPrevious, onNext }: Props) {
  const insets = useSafeAreaInsets();
  const accent = useToken('--accent', '#5ec8c2');

  // What the right-hand slot is showing. Seeded from `complete` so a section opened already read
  // starts on its finished face instead of animating into it.
  const [settled, setSettled] = useState(complete);
  const swap = useSharedValue(1);

  useEffect(() => {
    if (!complete || settled) return;

    swap.value = withSequence(
      withTiming(0, { duration: FADE_MS }),
      withDelay(PAUSE_MS, withTiming(1, { duration: FADE_MS })),
    );
    // Swapped in the dark, halfway through, so neither face is ever seen crossing the other.
    const timer = setTimeout(() => setSettled(true), FADE_MS + PAUSE_MS);

    return () => clearTimeout(timer);
  }, [complete, settled, swap]);

  const style = useAnimatedStyle(() => ({ opacity: swap.value }));

  return (
    <View
      className="flex-row items-center justify-between border-t border-t-line-soft bg-tray px-[18px] pt-[10px]"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      {onPrevious ? (
        <Button variant="ghost" size="inline" icon="chevron.left" onPress={onPrevious}>
          Previous
        </Button>
      ) : (
        <View />
      )}

      <AnimatedView style={style}>
        {!settled ? (
          <Button variant="ghost" size="inline" onPress={onMarkComplete}>
            Mark Complete
          </Button>
        ) : onNext ? (
          <Button variant="link" size="inline" accessibilityLabel="Next section" onPress={onNext}>
            <Text className="text-[15px] font-medium tracking-[-0.2px] text-accent">Next</Text>
            <SymbolView name="chevron.right" size={15} weight="semibold" tintColor={accent} />
          </Button>
        ) : (
          <View className="flex-row items-center gap-[6px] py-[6px]">
            <SymbolView name="checkmark" size={10} weight="bold" tintColor={accent} />
            <Text className="font-mono text-[9.5px] font-semibold uppercase tracking-[2px] text-accent">
              Done
            </Text>
          </View>
        )}
      </AnimatedView>
    </View>
  );
}
