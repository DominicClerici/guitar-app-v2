import { BottomSheetModal } from '@expo/ui/community/bottom-sheet';
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useToken } from '@/lib/tokens';

import { TapPad } from './TapPad';
import { tempoMarking } from './tapTempo';
import { useTapTempo } from './useTapTempo';

export type BpmSheetRef = {
  present: () => void;
  dismiss: () => void;
};

/**
 * Tap tempo in a native bottom sheet: tap the pad in time and the number above it
 * follows. Three seconds of silence ends the count and the next tap starts a new
 * one. Dismissing throws the session away.
 */
export function BpmSheet({ ref }: { ref?: Ref<BpmSheetRef> }) {
  const sheetRef = useRef<React.ComponentRef<typeof BottomSheetModal>>(null);
  const [visible, setVisible] = useState(false);
  const bg = useToken('--bg', '#0c0d10');

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['88%']}
      enablePanDownToClose
      // The library reads `backgroundColor` off this prop to drive the native sheet's
      // presentation background; there is no className equivalent.
      backgroundStyle={{ backgroundColor: bg }}
      onChange={(index) => setVisible(index >= 0)}
      onDismiss={() => setVisible(false)}
    >
      <BpmSheetBody visible={visible} onClose={() => sheetRef.current?.dismiss()} />
    </BottomSheetModal>
  );
}

function BpmSheetBody({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { bpm, taps, spread, stale, tap, reset } = useTapTempo();

  // The sheet keeps its body mounted between openings, so closing it is what ends
  // the session — otherwise the next open would resume a count from minutes ago.
  useEffect(() => {
    if (!visible) reset();
  }, [visible, reset]);

  const rounded = bpm === null ? null : Math.round(bpm);

  const caption = stale
    ? 'Tap to start again'
    : rounded !== null
      ? tempoMarking(rounded)
      : taps === 1
        ? 'Keep tapping'
        : 'Tap the pad in time';

  const stats =
    rounded === null
      ? ''
      : `${taps} taps${spread === null ? '' : ` · ±${Math.round(spread)} ms`}`;

  return (
    <View className="flex-1 px-[24px] pb-[24px] pt-[8px]">
      <View className="flex-row items-center justify-between py-[8px]">
        <Pressable
          onPress={onClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close BPM finder"
          className="rounded-[10px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface-raised px-[14px] py-[8px]"
        >
          <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-muted">
            Close
          </Text>
        </Pressable>

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

      <View className="items-center">
        <Pressable
          onPress={reset}
          disabled={taps === 0}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityState={{ disabled: taps === 0 }}
          accessibilityLabel="Reset tempo"
          className={`rounded-[10px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface-raised px-[18px] py-[10px] active:opacity-70 ${
            taps === 0 ? 'opacity-40' : ''
          }`}
        >
          <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-muted">
            Reset
          </Text>
        </Pressable>
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
