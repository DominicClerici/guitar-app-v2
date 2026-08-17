import { useImperativeHandle, type Ref } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { IN_TUNE_CENTS } from './freqToNote';
import { centsTextClass } from './tunerColors';
import { type TunerStatus } from './tunerEngine';
import { TunerScale } from './TunerScale';
import { useTunerSession } from './useTuner';

const EM_DASH = '—';
const MINUS = '−';

function formatCents(cents: number) {
  const rounded = Math.abs(cents) < 0.05 ? 0 : cents;
  const sign = rounded < 0 ? MINUS : '+';
  return `${sign}${Math.abs(rounded).toFixed(1)} ¢`;
}

export type InlineTunerCardRef = {
  /** Give up this card's mic lease. A no-op if it is not holding one. */
  stop: () => void;
};

/**
 * Home-screen tuner. The card itself is the control: tap to start listening, tap again
 * to release the mic. Idle and live states share one layout so starting the tuner wakes
 * the card up rather than resizing it.
 *
 * `stop` is for the section header handing a live session to the tuner sheet: the sheet
 * takes its lease first, so releasing this one leaves the native session untouched.
 */
export function InlineTunerCard({ ref }: { ref?: Ref<InlineTunerCardRef> }) {
  const { status, note, frequency, centsSV, presenceSV, toggle, stop } = useTunerSession();

  useImperativeHandle(ref, () => ({ stop }), [stop]);

  const live = status === 'listening' || status === 'starting';
  const hasReading = live && note !== null;

  const onPress = () => {
    if (status === 'unavailable') return;
    if (status === 'denied') {
      void Linking.openSettings();
      return;
    }
    toggle();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={status === 'unavailable'}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel(status)}
      className="rounded-[13px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface p-[20px]"
    >
      <View className={live ? undefined : 'opacity-45'}>
        <View className="flex-row items-baseline justify-between">
          <Text className="text-[30px] font-semibold tracking-[-0.5px] text-ink">
            {hasReading ? (
              <>
                {note.name}
                <Text className="text-[17px] font-medium text-ink-muted">{note.octave}</Text>
                <Text className="font-mono text-[13px] text-accent">
                  {' · '}
                  {frequency.toFixed(1)} Hz
                </Text>
              </>
            ) : (
              EM_DASH
            )}
          </Text>
          <Text
            className={`font-mono text-[13px] tracking-[0.5px] ${centsTextClass(
              hasReading ? note.cents : null,
            )}`}
          >
            {hasReading ? formatCents(note.cents) : `${EM_DASH} ¢`}
          </Text>
        </View>

        <View className="mt-[20px]">
          <TunerScale centsSV={centsSV} presenceSV={presenceSV} />
        </View>
      </View>

      <View className="mt-[12px] h-px bg-line" />
      <View className="mt-[8px] flex-row justify-between">
        <Text className="font-mono text-[9.5px] tracking-[1px] text-ink-faint">{MINUS}50</Text>
        <Text
          className={`font-mono text-[9.5px] tracking-[1px] ${
            hasReading && Math.abs(note.cents) < IN_TUNE_CENTS ? 'text-accent' : 'text-ink-faint'
          }`}
        >
          {footerLabel(status, note ? note.cents : null)}
        </Text>
        <Text className="font-mono text-[9.5px] tracking-[1px] text-ink-faint">+50</Text>
      </View>
    </Pressable>
  );
}

function footerLabel(status: TunerStatus, cents: number | null): string {
  switch (status) {
    case 'unavailable':
      return 'UNAVAILABLE ON WEB';
    case 'denied':
      return 'MIC ACCESS NEEDED';
    case 'starting':
      return 'WARMING UP';
    case 'listening':
      return cents !== null && Math.abs(cents) < IN_TUNE_CENTS ? 'IN TUNE' : 'LISTENING';
    default:
      return 'TAP TO TUNE';
  }
}

function accessibilityLabel(status: TunerStatus): string {
  switch (status) {
    case 'unavailable':
      return 'Tuner unavailable on this platform';
    case 'denied':
      return 'Microphone access needed — open settings';
    case 'starting':
    case 'listening':
      return 'Tuner listening — tap to stop';
    default:
      return 'Tap to start the tuner';
  }
}
