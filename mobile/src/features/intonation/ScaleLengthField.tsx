import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { PillSelector, type PillOption } from '@/components/PillSelector';
import { useToken } from '@/lib/tokens';

import { MAX_SCALE_INCHES, MIN_SCALE_INCHES, SCALE_PRESETS } from './intonationMath';

const PRESET_OPTIONS: PillOption[] = SCALE_PRESETS.map((preset) => ({
  id: String(preset.inches),
  label: preset.label,
  name: `${preset.label}, ${preset.note}`,
}));

/** Close enough to a preset to be one, in inches. */
const SAME = 0.005;

interface Props {
  inches: number;
  onChange: (inches: number) => void;
}

/**
 * Scale length, which turns a cents reading into millimetres of saddle travel.
 * Presets cover most instruments; the field takes anything else. It only scales
 * the distance estimate — the direction and the cents figure do not depend on it.
 *
 * A length typed into the field that is none of the presets leaves the row with
 * nothing chosen, and the line underneath says so — the presets are the four
 * common answers, not the only ones, and the pill should not claim otherwise.
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
  const preset = SCALE_PRESETS.find((entry) => Math.abs(entry.inches - inches) < SAME);

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

      <View className="mt-[12px]">
        <PillSelector
          options={PRESET_OPTIONS}
          value={preset ? String(preset.inches) : null}
          onChange={(id) => {
            setDraft(null);
            onChange(Number(id));
          }}
          label="Scale length"
        />
      </View>

      {/* The instrument each preset belongs to, which is what most people are
          actually picking by. Fixed height so naming it does not move the card. */}
      <Text className="mt-[8px] h-[13px] text-center font-mono text-[8.5px] uppercase tracking-[1.5px] text-ink-faint">
        {preset ? preset.note : 'Custom length'}
      </Text>
    </View>
  );
}
