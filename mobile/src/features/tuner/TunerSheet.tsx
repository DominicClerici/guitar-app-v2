import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import {
  InteractionManager,
  Linking,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { Button } from '@/components/Button';
import { Sheet, type SheetRef } from '@/components/Sheet';

import { IN_TUNE_CENTS } from './freqToNote';
import { useNoteName } from './useNoteName';
import { SeismographChart, SeismographFrame } from './SeismographChart';
import { centsTextClass, useTunerColors } from './tunerColors';
import { type TunerStatus } from './tunerEngine';
import { useTuner, useTunerSession } from './useTuner';

export type TunerSheetRef = SheetRef;

/**
 * Full tuner in a bottom sheet: oversized note readout over a rolling seismograph
 * trace. Opening it acquires the mic; dismissing releases it.
 *
 * Mounted by `ToolsTab`, which presents it from the pinned Tuner card, and by
 * `HomeTab`, which hands it over from the inline card.
 *
 * The mic lease is held out here rather than in the body — the body only mounts
 * once the modal presents, which is too late for two reasons. The session gets a
 * head start on the open animation instead of warming up behind it, and because
 * `present()` takes the lease synchronously, a caller can release a lease it was
 * already holding straight afterwards without the count ever reaching zero. A
 * tuner that was already listening therefore stays listening across the handoff.
 */
export function TunerSheet({ ref }: { ref?: Ref<TunerSheetRef> }) {
  const sheetRef = useRef<SheetRef>(null);
  const [visible, setVisible] = useState(false);
  const { start, stop } = useTunerSession();

  useImperativeHandle(
    ref,
    () => ({
      present: () => {
        void start();
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }),
    [start],
  );

  const close = () => {
    setVisible(false);
    stop();
  };

  return (
    <Sheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      onVisibleChange={(next) => (next ? setVisible(true) : close())}
      onDismiss={close}
    >
      <TunerSheetBody visible={visible} onStart={start} />
    </Sheet>
  );
}

const SNAP_POINTS = ['92%'];

function TunerSheetBody({ visible, onStart }: { visible: boolean; onStart: () => Promise<void> }) {
  const { status, note, frequency, centsSV, claritySV, presenceSV, frameSV } = useTuner();
  const nameOf = useNoteName();
  const colors = useTunerColors();
  const { height: screenHeight } = useWindowDimensions();

  // The 60-row chart drops frames if it mounts during the sheet's open animation, so it
  // waits for interactions to settle. The static frame holds the slot meanwhile, at the
  // same measured size, so the live chart drops in without a flash. The mic does not
  // wait with it — `TunerSheet` already has it running by now.
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
    if (!visible) return;
    const task = InteractionManager.runAfterInteractions(() => setLive(true));
    return () => task.cancel();
  }, [visible]);

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
      <View className="flex-1 items-center">
        {/* The reference pitch rides the top-right of the note's line rather than sitting in
            the row, so the oversized note stays optically centred. */}
        <View className="mt-[12px] w-full">
          <AnimatedView className="flex-row items-end justify-center" style={noteOpacity}>
            <Text className="text-[110px] font-semibold leading-[118px] tracking-[-4px] text-ink">
              {note ? nameOf(note.midi) : '—'}
            </Text>
            {note ? (
              <Text className="mb-[26px] ml-[4px] text-[26px] font-medium text-ink-muted">
                {note.octave}
              </Text>
            ) : null}
          </AnimatedView>
          <Text className="absolute right-0 top-0 font-mono text-[10px] uppercase tracking-[2.5px] text-ink-faint">
            A=440
          </Text>
        </View>

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
        <View
          className="mt-[24px] w-full flex-1 overflow-hidden rounded-[16px] border border-line-soft bg-tray p-[14px]"
          style={{ maxHeight: screenHeight / 2 }}
        >
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

        {/* Capping the chart can leave slack below it; the pill takes it so it stays
            anchored to the bottom of the sheet rather than floating mid-air. */}
        <View className="mt-auto pt-[20px]">
          <StatusPill
            status={status}
            inTune={note !== null && Math.abs(note.cents) < IN_TUNE_CENTS}
            onStart={onStart}
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
    <Button
      variant="quiet"
      size="md"
      radius={999}
      // The pill goes on saying what the tuner is doing while it is doing it;
      // there is just nothing to press until it stops.
      disabled={listening || status === 'starting' || status === 'unavailable'}
      accessibilityLabel={label}
      onPress={() => (denied ? void Linking.openSettings() : void onStart())}
    >
      <View className={`h-[8px] w-[8px] rounded-full ${dotClass}`} />
      <Text className="font-mono text-[10.5px] uppercase tracking-[1.5px] text-ink-muted">
        {label}
      </Text>
    </Button>
  );
}
