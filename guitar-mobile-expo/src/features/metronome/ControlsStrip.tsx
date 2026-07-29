import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useToken } from '@/lib/tokens';

import { VOICES } from './clickVoices';
import { MAX_BEATS, MIN_BEATS, SUBDIVISIONS } from './patterns';
import { Segmented } from './Segmented';

interface Props {
  beats: number;
  perBeat: number;
  voiceId: string;
  haptics: boolean;
  onBeats: (beats: number) => void;
  onPerBeat: (perBeat: number) => void;
  onVoice: (id: string) => void;
  onHaptics: (enabled: boolean) => void;
}

/** Everything that shapes the click, one setting to a line. */
export function ControlsStrip({
  beats,
  perBeat,
  voiceId,
  haptics,
  onBeats,
  onPerBeat,
  onVoice,
  onHaptics,
}: Props) {
  return (
    <View className="rounded-[13px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface px-[16px]">
      <Row label="Subdivision">
        <Segmented
          segments={SUBDIVISIONS.map((subdivision) => ({
            id: subdivision.id,
            label: subdivision.label,
            content: (
              <Dots count={subdivision.perBeat} selected={subdivision.perBeat === perBeat} />
            ),
          }))}
          value={SUBDIVISIONS.find((s) => s.perBeat === perBeat)?.id ?? SUBDIVISIONS[0].id}
          onChange={(id) => {
            const found = SUBDIVISIONS.find((s) => s.id === id);
            if (found) onPerBeat(found.perBeat);
          }}
        />
      </Row>

      <Row label="Beats per bar">
        <View className="flex-row items-center gap-[6px] rounded-[9px] border border-line-soft bg-tray p-[3px]">
          <MiniButton
            symbol="minus"
            label="One beat fewer"
            disabled={beats <= MIN_BEATS}
            onPress={() => onBeats(beats - 1)}
          />
          <Text className="w-[22px] text-center font-mono text-[14px] text-ink">{beats}</Text>
          <MiniButton
            symbol="plus"
            label="One beat more"
            disabled={beats >= MAX_BEATS}
            onPress={() => onBeats(beats + 1)}
          />
        </View>
      </Row>

      <Row label="Sound">
        <Segmented
          segments={VOICES.map((voice) => ({
            id: voice.id,
            label: voice.label,
            content: (
              <Text
                className={`text-[12.5px] font-medium tracking-[-0.1px] ${
                  voice.id === voiceId ? 'text-accent' : 'text-ink-muted'
                }`}
              >
                {voice.label}
              </Text>
            ),
          }))}
          value={voiceId}
          onChange={onVoice}
        />
      </Row>

      <Row label="Haptics" last>
        <Pressable
          onPress={() => onHaptics(!haptics)}
          accessibilityRole="switch"
          accessibilityState={{ checked: haptics }}
          accessibilityLabel="Pulse on every beat"
          className={`h-[32px] w-[62px] items-center justify-center rounded-[8px] border active:opacity-70 ${
            haptics ? 'border-accent-line bg-accent-wash' : 'border-line-soft bg-tray'
          }`}
        >
          <Text
            className={`font-mono text-[10px] uppercase tracking-[1.5px] ${
              haptics ? 'text-accent' : 'text-ink-faint'
            }`}
          >
            {haptics ? 'On' : 'Off'}
          </Text>
        </Pressable>
      </Row>
    </View>
  );
}

function Row({ label, last, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <View
      className={`min-h-[58px] flex-row items-center justify-between gap-[12px] py-[11px] ${
        last ? '' : 'border-b border-b-line-soft'
      }`}
    >
      <Text className="font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-ink-faint">
        {label}
      </Text>
      {children}
    </View>
  );
}

/** One dot per click in the beat, the first of them being the beat itself. */
function Dots({ count, selected }: { count: number; selected: boolean }) {
  return (
    <View className="flex-row items-center gap-[3px]">
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          className={`h-[5px] w-[5px] rounded-full ${
            selected ? (i === 0 ? 'bg-accent' : 'bg-accent-line') : i === 0 ? 'bg-ink' : 'bg-ink-faint'
          }`}
        />
      ))}
    </View>
  );
}

function MiniButton({
  symbol,
  label,
  disabled,
  onPress,
}: {
  symbol: SFSymbol;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const ink = useToken('--ink', '#eef0f4');
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      className="h-[26px] w-[30px] items-center justify-center rounded-[6px] active:opacity-60"
    >
      <SymbolView name={symbol} size={12} weight="semibold" tintColor={disabled ? faint : ink} />
    </Pressable>
  );
}
