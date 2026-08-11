import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Sheet, type SheetRef } from '@/components/Sheet';

import { TapPad } from './TapPad';
import { tempoMarking } from './tapTempo';
import { useTapTempo } from './useTapTempo';

export type BpmSheetRef = SheetRef;

/**
 * Tap tempo in a bottom sheet: tap the pad in time and the number above it
 * follows. A short silence ends the count and the next tap starts a new one.
 * Dismissing throws the session away.
 *
 * `onUseTempo` fires after the sheet has finished closing rather than at the press,
 * so a screen pushed in response is not racing a modal that is still on its way out.
 */
export function BpmSheet({
  ref,
  onUseTempo,
}: {
  ref?: Ref<BpmSheetRef>;
  onUseTempo?: (bpm: number) => void;
}) {
  const sheetRef = useRef<SheetRef>(null);
  const [visible, setVisible] = useState(false);
  const handing = useRef<number | null>(null);

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
      // No snap points on purpose: a fixed detent both stretched the pad out of
      // square and left the buttons fighting it for the leftover height. The
      // content decides its own height instead.
      ref={sheetRef}
      onVisibleChange={setVisible}
      onDismiss={() => {
        setVisible(false);
        const bpm = handing.current;
        handing.current = null;
        if (bpm !== null) onUseTempo?.(bpm);
      }}
    >
      <BpmSheetBody
        visible={visible}
        onClose={() => sheetRef.current?.dismiss()}
        onUse={(bpm) => {
          handing.current = bpm;
          sheetRef.current?.dismiss();
        }}
      />
    </Sheet>
  );
}

function BpmSheetBody({
  visible,
  onClose,
  onUse,
}: {
  visible: boolean;
  onClose: () => void;
  onUse: (bpm: number) => void;
}) {
  const { bpm, taps, spread, stale, tap, reset } = useTapTempo();

  // The sheet keeps its body mounted between openings, so closing it is what ends
  // the session — otherwise the next open would resume a count from minutes ago.
  useEffect(() => {
    if (!visible) reset();
  }, [visible, reset]);

  const rounded = bpm === null ? null : Math.round(bpm);
  const handoffReady = rounded !== null && stale;

  const caption = stale
    ? 'Tap to start again'
    : rounded !== null
      ? tempoMarking(rounded)
      : taps === 1
        ? 'Keep tapping'
        : 'Tap the pad in time';

  const stats =
    rounded === null ? '' : `${taps} taps${spread === null ? '' : ` · ±${Math.round(spread)} ms`}`;

  return (
    <View className="px-[24px] pb-[24px] pt-[8px]">
      <View className="flex-row items-center justify-between py-[8px]">
        <Button
          variant="secondary"
          size="sm"
          text="mono"
          hitSlop={8}
          accessibilityLabel="Close BPM finder"
          onPress={onClose}
        >
          Close
        </Button>

        <ModeSwitch />
      </View>

      <View className="mt-[16px] items-center">
        <Text
          className={`text-[96px] font-semibold leading-[102px] tracking-[-4px] ${
            stale ? 'text-ink-faint' : 'text-ink'
          }`}
        >
          {rounded ?? '—'}
        </Text>

        <Text className="mt-[2px] font-mono text-[11px] uppercase tracking-[3px] text-ink-faint">
          BPM
        </Text>

        {/* Both lines keep their height whether or not they have anything to say,
            so the pad below never shifts as a reading comes in. */}
        <Text
          className={`mt-[14px] h-[15px] font-mono text-[11px] uppercase tracking-[2.5px] ${
            rounded !== null && !stale ? 'text-accent' : 'text-ink-faint'
          }`}
        >
          {caption}
        </Text>

        <Text className="mt-[6px] h-[14px] font-mono text-[10px] uppercase tracking-[1.5px] text-ink-faint">
          {stats}
        </Text>
      </View>

      <TapPad onTap={tap} />

      <View className="items-center gap-[12px]">
        {/* Held back until the count has timed out: mid-tap the reading is still
            moving, and handing over a number you were about to improve on is
            worse than waiting the moment out. */}
        <Button
          variant="primary"
          size="lg"
          icon="metronome"
          disabled={!handoffReady}
          className="w-full"
          accessibilityLabel={
            handoffReady
              ? `Open the metronome at ${rounded} beats per minute`
              : 'Set in metronome. Available once you stop tapping.'
          }
          onPress={() => {
            if (rounded !== null) onUse(rounded);
          }}
        >
          Set in Metronome
        </Button>

        <Button
          variant="secondary"
          size="sm"
          text="mono"
          disabled={taps === 0}
          hitSlop={8}
          accessibilityLabel="Reset tempo"
          onPress={reset}
        >
          Reset
        </Button>
      </View>
    </View>
  );
}

/**
 * The seat for mic-based detection. Tapping is the only way in for now, so this is
 * a label rather than a control — it turns into a real switch when Listen lands.
 */
function ModeSwitch() {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel="Tap mode. Listening for tempo is not available yet."
      className="flex-row items-center rounded-[9px] border border-line-soft bg-tray p-[2px]"
    >
      <View className="rounded-[7px] bg-surface-raised px-[12px] py-[5px]">
        <Text className="font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink">Tap</Text>
      </View>
      <View className="px-[12px] py-[5px]">
        <Text className="font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
          Listen
        </Text>
      </View>
    </View>
  );
}
