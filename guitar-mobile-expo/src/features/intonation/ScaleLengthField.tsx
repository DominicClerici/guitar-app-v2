import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useToken } from '@/lib/tokens';

import { MAX_SCALE_INCHES, MIN_SCALE_INCHES, SCALE_PRESETS } from './intonationMath';

interface Props {
  inches: number;
  onChange: (inches: number) => void;
}

/**
 * Scale length, which turns a cents reading into millimetres of saddle travel.
 * Presets cover most instruments; the field takes anything else. It only scales
 * the distance estimate — the direction and the cents figure do not depend on it.
 */
export function ScaleLengthField({ inches, onChange }: Props) {
  const faint = useToken('--ink-faint', '#62666e');

  // Held as text while being edited so a half-typed "24." is not parsed away
  // under the cursor. Committed on blur, and reverted if it makes no sense.
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const parsed = Number.parseFloat(draft);
    if (Number.isFinite(parsed) && parsed >= MIN_SCALE_INCHES && parsed <= MAX_SCALE_INCHES) {
      onChange(parsed);
    }
    setDraft(null);
  };

  const shown = draft ?? String(inches);

  return (
    <View className="rounded-[13px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface p-[16px]">
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
          Scale length
        </Text>
        <View className="flex-row items-baseline gap-[4px]">
          <TextInput
            value={shown}
            onChangeText={setDraft}
            onBlur={commit}
            onSubmitEditing={commit}
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
            selectionColor={faint}
            accessibilityLabel="Scale length in inches"
            className="min-w-[54px] rounded-[8px] border border-line-soft bg-tray px-[8px] py-[4px] text-right font-mono text-[13px] text-ink"
          />
          <Text className="font-mono text-[11px] text-ink-faint">in</Text>
        </View>
      </View>

      <View className="mt-[12px] flex-row gap-[6px]">
        {SCALE_PRESETS.map((preset) => {
          const on = Math.abs(preset.inches - inches) < 0.005;
          return (
            <Pressable
              key={preset.label}
              onPress={() => {
                setDraft(null);
                onChange(preset.inches);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${preset.label} scale, ${preset.note}`}
              className={`flex-1 items-center rounded-[9px] border py-[8px] active:opacity-70 ${
                on ? 'border-accent-line bg-accent-wash' : 'border-line-soft bg-surface-raised'
              }`}
            >
              <Text
                className={`text-[13px] font-medium tracking-[-0.2px] ${
                  on ? 'text-accent' : 'text-ink-muted'
                }`}
              >
                {preset.label}
              </Text>
              <Text
                className={`mt-[2px] font-mono text-[8.5px] uppercase tracking-[1px] ${
                  on ? 'text-accent' : 'text-ink-faint'
                }`}
              >
                {preset.note}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
