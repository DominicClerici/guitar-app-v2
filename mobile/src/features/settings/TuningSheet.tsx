import {
  formatTuning,
  preferenceEntry,
  STANDARD_TUNING,
  tuningRangeFor,
  type AccidentalPreference,
} from '@guitar/shared';
import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { SelectableChips } from '@/components/SelectableChip';
import { Sheet, type SheetRef } from '@/components/Sheet';
import { Ticker } from '@/components/Ticker';
import { usePreferenceWriter } from '@/lib/preferences';
import { toast } from '@/lib/toast';

import { isSettled, shownChoice, type Pending } from './choice';
import {
  noteNameOf,
  presetMatching,
  storedIndexOf,
  stringsLowToHigh,
  TUNING_PRESETS,
  tuningFrom,
  tuningWithString,
} from './tuning';

const STANDARD = formatTuning(STANDARD_TUNING);
const STRING_COUNT = STANDARD_TUNING.length;

/** No chip is chosen, for a tuning that is nobody's preset. `SelectableChips` picks by id. */
const NO_PRESET = '';

const PRESET_CHIPS = TUNING_PRESETS.map((preset) => ({ id: preset.id, label: preset.name }));

export type TuningSheetRef = SheetRef;

interface Props {
  ref?: Ref<TuningSheetRef>;
  /** What the database holds for the tuning right now. */
  stored: string;
  /** How a black key is spelled, which is the user's own setting two rows up. */
  accidentals: AccidentalPreference;
}

/**
 * The tuning, by preset or one string at a time.
 *
 * There is no save: any change writes the whole tuning and asks for a sync, the same as any other
 * preference, so the sheet has nothing to hold and nothing to lose if it is swiped away mid-thought
 * (BACKEND_PLAN.md §6). What that costs is a control that could sit on a value the database never
 * took, so the pending choice from `choice.ts` covers the beat between the write and the live query
 * noticing it — over the whole tuning rather than per string, because one write is what happened.
 *
 * The chips and the tickers are one control read two ways rather than two controls to keep in step:
 * a chip writes six strings at once, and which chip is lit is asked of the strings themselves. So
 * walking to DADGAD a half step at a time lights DADGAD, and moving off it puts the light out,
 * without either half having to tell the other anything.
 *
 * Reset is the tombstone rather than a write of the same six numbers (§7): the difference matters
 * on a second device, where a stored standard tuning would otherwise beat a later default.
 */
export function TuningSheet({ ref, stored, accidentals }: Props) {
  const insets = useSafeAreaInsets();
  const sheet = useRef<SheetRef>(null);
  const { set, reset } = usePreferenceWriter();
  const [pending, setPending] = useState<Pending<string> | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheet.current?.present(),
      dismiss: () => sheet.current?.dismiss(),
    }),
    [],
  );

  // Adjusted during render for the reason `PreferenceRow` gives: an effect would show the answer a
  // frame after the store already had it.
  if (isSettled(stored, pending)) setPending(null);

  const shown = shownChoice(stored, pending);
  const tuning = tuningFrom(shown);

  const write = (value: string) => {
    const entry = preferenceEntry.safeParse({ key: 'tuning', value });

    if (entry.success && set(entry.data)) {
      setPending({ value, from: stored });
      return;
    }

    setPending(null);
    toast.error('Something went wrong');
  };

  const tune = (position: number, pitch: number) =>
    write(tuningWithString(tuning, storedIndexOf(position), pitch));

  const choosePreset = (id: string) => {
    const preset = TUNING_PRESETS.find((candidate) => candidate.id === id);
    // Pressing the lit chip is not an undo — it is already this tuning, so there is nothing to
    // write and nothing to say.
    if (preset && preset.tuning !== shown) write(preset.tuning);
  };

  const restore = () => {
    if (reset('tuning')) {
      setPending({ value: STANDARD, from: stored });
      return;
    }

    setPending(null);
    toast.error('Something went wrong');
  };

  return (
    <Sheet ref={sheet}>
      <View className="px-[18px] pt-[6px]" style={{ paddingBottom: insets.bottom + 18 }}>
        <Text className="text-[18px] font-semibold tracking-[-0.4px] text-ink">Default tuning</Text>
        <Text className="mt-[6px] text-[13px] leading-[19px] text-ink-muted">
          The tuning the rest of the app assumes: the note under every fret, the shapes it draws for
          a chord, and what the tuner listens for. Pick a preset or move a string a half step at a
          time — changes are kept as you make them.
        </Text>

        <SelectableChips
          items={PRESET_CHIPS}
          value={presetMatching(shown)?.id ?? NO_PRESET}
          onChange={choosePreset}
          className="mt-[16px]"
        />

        <View className="mt-[18px] flex-row gap-[8px]">
          {stringsLowToHigh(tuning).map((pitch, position) => {
            const number = STRING_COUNT - position;
            const { min, max } = tuningRangeFor(storedIndexOf(position));

            return (
              <View key={number} className="flex-1 items-center gap-[8px]">
                <Ticker
                  orientation="vertical"
                  value={pitch}
                  onChange={(next) => tune(position, next)}
                  min={min}
                  max={max}
                  // Nine pitches from end to end, so a run would overshoot what it saves.
                  repeatOnHold={false}
                  format={(value) => noteNameOf(value, accidentals)}
                  label={`String ${number}`}
                  className="h-[104px] w-full"
                />
                <Text className="font-mono text-[10px] text-ink-faint">{number}</Text>
              </View>
            );
          })}
        </View>

        <Button
          variant="ghost"
          size="sm"
          text="mono"
          radius={10}
          className="mt-[14px] self-center"
          disabled={shown === STANDARD}
          onPress={restore}
        >
          Reset to default
        </Button>
      </View>
    </Sheet>
  );
}
