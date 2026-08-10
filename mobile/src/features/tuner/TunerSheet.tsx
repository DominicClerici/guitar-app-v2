import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import {
  InteractionManager,
  Linking,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { Sheet, type SheetRef } from '@/components/Sheet';

import { IN_TUNE_CENTS } from './freqToNote';
import { SeismographChart, SeismographFrame } from './SeismographChart';
import { centsTextClass, useTunerColors } from './tunerColors';
import { type TunerStatus } from './tunerEngine';
import { useTunerSession } from './useTuner';

export type TunerSheetRef = SheetRef;

/**
 * Full tuner in a bottom sheet: oversized note readout over a rolling seismograph
 * trace. Opening it acquires the mic; dismissing releases it.
 *
 * Mounted by `ToolsTab`, which presents it from the pinned Tuner card.
 */
export function TunerSheet({ ref }: { ref?: Ref<TunerSheetRef> }) {
  const sheetRef = useRef<SheetRef>(null);
  const [visible, setVisible] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }),
    [],
  );

  return (
    <Sheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      onVisibleChange={setVisible}
      onDismiss={() => setVisible(false)}
    >
      <TunerSheetBody visible={visible} onClose={() => sheetRef.current?.dismiss()} />
    </Sheet>
  );
}

const SNAP_POINTS = ['92%'];

function TunerSheetBody({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { status, note, frequency, centsSV, claritySV, presenceSV, frameSV, start, stop } =
    useTunerSession();
  const colors = useTunerColors();

  // The 60-row chart drops frames if it mounts during the sheet's open animation, so both
  // it and the mic wait for interactions to settle. The static frame holds the slot
  // meanwhile, at the same measured size, so the live chart drops in without a flash.
  const [live, setLive] = useState(false);
  const [chart, setChart] = useState({ width: 0, height: 0 });

  // Reset during render on close rather than in the effect, so the next open starts
  // deferred again instead of inheriting the previous session's `live`.
  const [wasVisible, setWasVisible] = useState(visible);
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (!visible) setLive(false);
  }

  useEffect(() => {
    if (!visible) {
      stop();
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => {
      setLive(true);
      void start();
    });
    return () => task.cancel();
  }, [visible, start, stop]);

  const onChartLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setChart({ width, height });
  };

  // A weak or ambiguous signal reads as faint rather than as a confidently wrong note.
  const noteOpacity = useAnimatedStyle(() => ({
    opacity: 0.25 + 0.75 * Math.min(1, claritySV.value / 0.85),
  }));

  const centsClass = centsTextClass(note ? note.cents : null);

  return (
    <View className="flex-1 px-[24px] pb-[24px] pt-[8px]">
      <View className="flex-row items-center justify-between py-[8px]">
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close tuner"
          className="rounded-[10px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface-raised px-[14px] py-[8px]"
        >
          <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-muted">
            Close
          </Text>
        </Pressable>
        <Text className="font-mono text-[10px] uppercase tracking-[2.5px] text-ink-faint">
          A=440
        </Text>
      </View>

      <View className="flex-1 items-center">
        <AnimatedView className="mt-[12px] flex-row items-end" style={noteOpacity}>
          <Text className="text-[110px] font-semibold leading-[118px] tracking-[-4px] text-ink">
            {note ? note.name : '—'}
          </Text>
          {note ? (
            <Text className="mb-[26px] ml-[4px] text-[26px] font-medium text-ink-muted">
              {note.octave}
            </Text>
          ) : null}
        </AnimatedView>

        <Text className={`mt-[4px] font-mono text-[13px] uppercase tracking-[2px] ${centsClass}`}>
          {note
            ? `${note.cents >= 0 ? '+' : '−'}${Math.abs(note.cents).toFixed(1)} cents`
            : '— cents'}
        </Text>

        <Text className="mt-[6px] font-mono text-[11px] tracking-[1px] text-ink-faint">
          {note ? `${frequency.toFixed(1)} Hz` : '—'}
        </Text>

        {/* The chart draws inside the well's padding: onLayout measures the padded inner
            slot, so bars and guides never touch the border. */}
        <View className="mt-[24px] w-full flex-1 overflow-hidden rounded-[16px] border border-line-soft bg-tray p-[14px]">
          <View className="flex-1" onLayout={onChartLayout}>
            {chart.width > 0 && chart.height > 0 ? (
              live ? (
                <SeismographChart
                  centsSV={centsSV}
                  presenceSV={presenceSV}
                  frameSV={frameSV}
                  width={chart.width}
                  height={chart.height}
                />
              ) : (
                <SeismographFrame width={chart.width} height={chart.height} colors={colors} />
              )
            ) : null}
          </View>
        </View>

        <View className="mt-[20px]">
          <StatusPill
            status={status}
            inTune={note !== null && Math.abs(note.cents) < IN_TUNE_CENTS}
            onStart={start}
          />
        </View>
      </View>
    </View>
  );
}

function StatusPill({
  status,
  inTune,
  onStart,
}: {
  status: TunerStatus;
  inTune: boolean;
  onStart: () => Promise<void>;
}) {
  const denied = status === 'denied';
  const listening = status === 'listening';

  const dotClass = denied
    ? 'bg-rose'
    : listening
      ? inTune
        ? 'bg-accent'
        : 'bg-amber'
      : status === 'starting'
        ? 'bg-amber'
        : 'bg-line';

  const label = denied
    ? 'Mic access needed — tap to open settings'
    : listening
      ? inTune
        ? 'In tune'
        : 'Listening'
      : status === 'starting'
        ? 'Warming up'
        : status === 'unavailable'
          ? 'Unavailable on this platform'
          : 'Tap to start';

  return (
    <Pressable
      onPress={() => (denied ? void Linking.openSettings() : void onStart())}
      disabled={listening || status === 'starting' || status === 'unavailable'}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center gap-[9px] rounded-full border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface px-[18px] py-[11px]"
    >
      <View className={`h-[8px] w-[8px] rounded-full ${dotClass}`} />
      <Text className="font-mono text-[10.5px] uppercase tracking-[1.5px] text-ink-muted">
        {label}
      </Text>
    </Pressable>
  );
}
