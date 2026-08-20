import type { SFSymbol } from 'expo-symbols';
import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Face } from '@/components/Face';
import { haptics } from '@/lib/haptics';

import { uiNow } from './uiClock';

/** Held this long before the button starts repeating. */
const REPEAT_DELAY = 380;
/** Then one step this often — brisk enough to cross the range, slow enough to stop on a number. */
const REPEAT_EVERY = 70;

interface Props {
  onStep: (delta: number) => void;
  onTap: (at: number) => void;
  /** Taps in the current run, so the button can show the count filling in. */
  taps: number;
}

/** Single-BPM nudges either side of the tap pad, under the rail. */
export function TempoSteppers({ onStep, onTap, taps }: Props) {
  return (
    <View className="mt-[10px] flex-row items-center gap-[10px]">
      <Stepper symbol="minus" label="One BPM slower" onStep={() => onStep(-1)} />
      <TapButton onTap={onTap} taps={taps} />
      <Stepper symbol="plus" label="One BPM faster" onStep={() => onStep(1)} />
    </View>
  );
}

function Stepper({
  symbol,
  label,
  onStep,
}: {
  symbol: SFSymbol;
  label: string;
  onStep: () => void;
}) {
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeat = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRepeating = () => {
    if (delay.current) {
      clearTimeout(delay.current);
      delay.current = null;
    }
    if (repeat.current) {
      clearInterval(repeat.current);
      repeat.current = null;
    }
  };

  useEffect(() => stopRepeating, []);

  // The step lands on press rather than on release, so a quick tap is a step and a
  // hold is a run of them without the first one arriving late.
  const onPressIn = () => {
    onStep();
    haptics.selection();
    delay.current = setTimeout(() => {
      repeat.current = setInterval(onStep, REPEAT_EVERY);
    }, REPEAT_DELAY);
  };

  return (
    <Button
      variant="secondary"
      size="md"
      square
      icon={symbol}
      hitSlop={6}
      accessibilityLabel={label}
      onPressIn={onPressIn}
      onPressOut={stopRepeating}
    />
  );
}

/**
 * Tap tempo. The timestamp is read in the gesture's worklet, on the UI thread, and
 * only then handed to JS — taking it after the hop would fold whatever the JS thread
 * was busy with into the interval, and 20ms of that is four BPM at a moderate tempo.
 */
function TapButton({ onTap, taps }: { onTap: (at: number) => void; taps: number }) {
  const tap = Gesture.Tap().onBegin(() => {
    runOnJS(onTap)(uiNow());
  });

  return (
    <GestureDetector gesture={tap}>
      <View
        accessibilityRole="button"
        accessibilityLabel="Tap the tempo"
        className="h-[46px] flex-1 items-center justify-center active:opacity-70"
      >
        <Face name="accent" radius={10} />
        <Text className="font-mono text-[11px] uppercase tracking-[4px] text-accent">
          {taps > 1 ? `Tap · ${taps}` : 'Tap'}
        </Text>
      </View>
    </GestureDetector>
  );
}
