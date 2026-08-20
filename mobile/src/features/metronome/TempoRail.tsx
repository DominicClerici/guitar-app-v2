import { useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AnimatedView } from '@/components/AnimatedView';
import { SquircleView } from '@/components/Squircle';
import { haptics } from '@/lib/haptics';
import { useToken } from '@/lib/tokens';

import { MAX_BPM, MIN_BPM } from './patterns';
import { uiNow } from './uiClock';

/** Travel per BPM. Wide enough to land on a single beat without fighting the finger. */
const PX_PER_BPM = 8;
/** Every tenth graduation is major and carries its number. */
const MAJOR_EVERY = 10;
/** How far the fade eats into each end of the rail. */
const FADE_WIDTH = 44;
/**
 * Minimum spacing between detent haptics. A fast drag crosses BPMs faster than the
 * Taptic engine can answer, and the queue that builds turns the ratchet to mush.
 */
const HAPTIC_GAP_MS = 28;

const FOLLOW = { duration: 160 };

const TICKS = Array.from({ length: MAX_BPM - MIN_BPM + 1 }, (_, i) => MIN_BPM + i);
const MAJORS = TICKS.filter((bpm) => bpm % MAJOR_EVERY === 0);

const STRIP_WIDTH = (TICKS.length - 1) * PX_PER_BPM;

function detent() {
  haptics.selection();
}

interface Props {
  bpm: number;
  onChange: (bpm: number) => void;
}

/**
 * A ruler dragged past a fixed mark. The strip follows the finger continuously and
 * settles onto the whole BPM when you let go, while the value it reports is always
 * the rounded one — so the movement stays smooth and the number never lies.
 */
export function TempoRail({ bpm, onChange }: Props) {
  const tray = useToken('--tray', '#131418');
  const lineSoft = useToken('--line-soft', '#23262d');
  const [width, setWidth] = useState(0);
  const center = width / 2;

  const dragging = useSharedValue(false);
  /** Where the finger went down, in BPM, and how far it has travelled since. */
  const from = useSharedValue(bpm);
  const travelled = useSharedValue(0);
  /** Last whole value handed to React, so a BPM is reported once and not per frame. */
  const reported = useSharedValue(bpm);
  const lastHaptic = useSharedValue(0);

  /**
   * Position in BPM, derived rather than driven: under the finger it is the raw
   * continuous drag, and the rest of the time it eases to whatever the tempo now is.
   * Letting go therefore settles onto the whole number for free, and a tempo set from
   * anywhere else — a stepper, a run of taps — is followed by the same expression.
   */
  const position = useDerivedValue(() => {
    if (!dragging.value) return withTiming(bpm, FOLLOW);
    return Math.max(MIN_BPM, Math.min(MAX_BPM, from.value + travelled.value));
  });

  const pan = Gesture.Pan()
    // Let a vertical scroll through: the rail only wants the horizontal.
    .activeOffsetX([-6, 6])
    .onStart(() => {
      dragging.value = true;
      from.value = bpm;
      reported.value = bpm;
      travelled.value = 0;
      lastHaptic.value = 0;
    })
    .onUpdate((event) => {
      // Drag left and the higher numbers come round, the way a wheel would turn.
      travelled.value = -event.translationX / PX_PER_BPM;

      const whole = Math.round(Math.max(MIN_BPM, Math.min(MAX_BPM, from.value + travelled.value)));
      if (whole === reported.value) return;
      reported.value = whole;
      runOnJS(onChange)(whole);

      const now = uiNow();
      if (now - lastHaptic.value > HAPTIC_GAP_MS) {
        lastHaptic.value = now;
        runOnJS(detent)();
      }
    })
    .onFinalize(() => {
      dragging.value = false;
    });

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: center - (position.value - MIN_BPM) * PX_PER_BPM }],
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={onLayout}
        accessibilityRole="adjustable"
        accessibilityLabel="Tempo"
        accessibilityValue={{ min: MIN_BPM, max: MAX_BPM, now: bpm }}
        className="h-[64px]"
      >
        <SquircleView
          radius={11}
          fill={tray}
          stroke={lineSoft}
          strokeWidth={1}
          clip
          className="absolute inset-0"
        >
          <AnimatedView
            className="absolute inset-y-0 left-0 flex-row items-start pt-[12px]"
            style={[{ width: STRIP_WIDTH + 1 }, stripStyle]}
          >
            {TICKS.map((tick) => (
              <View
                key={tick}
                className={`w-px ${
                  tick % MAJOR_EVERY === 0 ? 'h-[20px] bg-ink-faint' : 'h-[10px] bg-line'
                }`}
                style={{ marginRight: PX_PER_BPM - 1 }}
              />
            ))}

            {MAJORS.map((tick) => (
              <Text
                key={tick}
                className="absolute top-[26px] w-[30px] text-center font-mono text-[9.5px] tracking-[0.5px] text-ink-faint"
                style={{ left: (tick - MIN_BPM) * PX_PER_BPM - 15 }}
              >
                {tick}
              </Text>
            ))}
          </AnimatedView>
        </SquircleView>

        <Fade tray={tray} side="left" />
        <Fade tray={tray} side="right" />

        <View
          className="pointer-events-none absolute inset-y-0 w-[12px] items-center pt-[5px]"
          style={{ left: center - 6 }}
        >
          <View className="h-[7px] w-[7px] rounded-full bg-accent" />
          <View className="mt-[2px] h-[32px] w-[2px] rounded-full bg-accent" />
        </View>
      </View>
    </GestureDetector>
  );
}

/** Ticks arriving out of nothing rather than being cut off at the border. */
function Fade({ tray, side }: { tray: string; side: 'left' | 'right' }) {
  const id = `rail-fade-${side}`;
  const outward = side === 'left';

  return (
    <View
      className={`pointer-events-none absolute inset-y-0 ${outward ? 'left-0' : 'right-0'}`}
      style={{ width: FADE_WIDTH }}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1={outward ? '0' : '1'} y1="0" x2={outward ? '1' : '0'} y2="0">
            <Stop offset="0" stopColor={tray} stopOpacity="1" />
            <Stop offset="1" stopColor={tray} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
