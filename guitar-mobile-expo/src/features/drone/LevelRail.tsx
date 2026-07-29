import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useToken } from '@/lib/tokens';

/** Matches the thumb's `w-[16px]`; the two have to move together. */
const THUMB = 16;

interface Props {
  level: number;
  onChange: (level: number) => void;
}

/**
 * Volume, kept where the thumb already is. A drone is set against something else
 * you are playing, so the level is adjusted far more often than anything else on
 * the screen — it earns a permanent place rather than a trip into a panel.
 */
export function LevelRail({ level, onChange }: Props) {
  const faint = useToken('--ink-faint', '#62666e');
  const [width, setWidth] = useState(0);

  const report = (x: number) => {
    if (width <= 0) return;
    onChange(Math.max(0, Math.min(1, x / width)));
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((event) => {
      runOnJS(report)(event.x);
    })
    .onUpdate((event) => {
      runOnJS(report)(event.x);
    });

  const travel = Math.max(0, width - THUMB);

  return (
    <View className="flex-row items-center gap-[10px] px-[18px]">
      <SymbolView name="speaker.fill" size={11} tintColor={faint} />

      <GestureDetector gesture={pan}>
        <View
          onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
          accessibilityRole="adjustable"
          accessibilityLabel="Drone level"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(level * 100) }}
          className="h-[30px] flex-1 justify-center"
        >
          <View className="h-[5px] overflow-hidden rounded-full bg-line">
            <View className="h-full rounded-full bg-accent" style={{ width: `${level * 100}%` }} />
          </View>

          {/* Absolute, so it rides over the track rather than in the flow: the
              container centres its children and this one has to sit at a
              position instead. */}
          <View
            className="absolute top-[7px] h-[16px] w-[16px] rounded-full border border-accent-line bg-surface-raised"
            style={{ left: level * travel }}
          />
        </View>
      </GestureDetector>

      <SymbolView name="speaker.wave.3.fill" size={13} tintColor={faint} />
    </View>
  );
}
