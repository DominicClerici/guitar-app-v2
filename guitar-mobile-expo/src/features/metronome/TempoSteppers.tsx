import * as Haptics from 'expo-haptics';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useToken } from '@/lib/tokens';

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
  const ink = useToken('--ink', '#eef0f4');

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
    void Haptics.selectionAsync();
    delay.current = setTimeout(() => {
      repeat.current = setInterval(onStep, REPEAT_EVERY);
    }, REPEAT_DELAY);
  };

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={stopRepeating}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-[46px] w-[54px] items-center justify-center rounded-[10px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface-raised active:opacity-70"
    >
      <SymbolView name={symbol} size={15} weight="semibold" tintColor={ink} />
    </Pressable>
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
        className="h-[46px] flex-1 items-center justify-center rounded-[10px] border border-accent-line bg-accent-wash active:opacity-70"
      >
        <Text className="font-mono text-[11px] uppercase tracking-[4px] text-accent">
          {taps > 1 ? `Tap · ${taps}` : 'Tap'}
        </Text>
      </View>
    </GestureDetector>
  );
}
