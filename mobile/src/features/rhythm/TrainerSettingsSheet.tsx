import type { Ref } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Segmented } from '@/components/Segmented';
import { SelectableChip } from '@/components/SelectableChip';
import { Sheet, type SheetRef } from '@/components/Sheet';

import { nameOf, NOTE_VALUES, spokenNameOf, type NoteValue } from './patternGenerator';
import { DEFAULT_PRESET_ID, PRESETS } from './presets';
import {
  DEFAULT_VALUES,
  METERS,
  RAMP_STEPS,
  type Meter,
  type RampStep,
  type TrainerSettings,
} from './trainerSettings';

export type TrainerSettingsSheetRef = SheetRef;

/**
 * Everything about the drill except its tempo, which lives on the screen because it is the control
 * you reach for mid-practice.
 *
 * The two pattern modes are exclusive rather than layered: a preset IS the bar, meter included, so
 * while one is chosen there is no meter to set and no note values to pick. Showing those controls
 * greyed would suggest a preset is a starting point you then edit, which is not what it is.
 */

interface Props {
  ref?: Ref<TrainerSettingsSheetRef>;
  settings: TrainerSettings;
  onChange: (patch: Partial<TrainerSettings>) => void;
  /** Only offered once there is a measurement to throw away. */
  onRecalibrate: (() => void) | null;
}

export function TrainerSettingsSheet({ ref, settings, onChange, onRecalibrate }: Props) {
  const insets = useSafeAreaInsets();
  // Bound once, so the narrowing survives into the callbacks below — `settings.source` inside a
  // closure is a property TypeScript has to assume could have changed by the time it runs.
  const source = settings.source;
  const generating = source.mode === 'generate';
  const values = source.mode === 'generate' ? source.values : DEFAULT_VALUES;

  const toggleValue = (value: NoteValue) => {
    if (source.mode !== 'generate') return;
    const has = values.includes(value);
    // The last one stays: an empty set has nothing to compose from, and a bar of silence is not a
    // rhythm anyone asked to practise.
    if (has && values.length <= 1) return;
    onChange({
      source: {
        ...source,
        values: has ? values.filter((v) => v !== value) : [...values, value],
      },
    });
  };

  return (
    <Sheet ref={ref} snapPoints={['86%']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-[6px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <SectionLabel label="Input" />
        <View className="mt-[14px] flex-row">
          <Segmented
            segments={[
              {
                id: 'mic',
                label: 'Listen through the microphone',
                content: <SegmentText text="Microphone" selected={settings.input === 'mic'} />,
              },
              {
                id: 'tap',
                label: 'Tap the screen instead',
                content: <SegmentText text="Tap" selected={settings.input === 'tap'} />,
              },
            ]}
            value={settings.input}
            onChange={(id) => onChange({ input: id === 'tap' ? 'tap' : 'mic' })}
          />
        </View>
        <Hint>
          {settings.input === 'mic'
            ? 'Mute the strings and pick the rhythm. Two bars of calibration come first, once.'
            : 'Tap the pad in time. Nothing is recorded and there is nothing to calibrate.'}
        </Hint>

        {onRecalibrate ? (
          <Button
            variant="quiet"
            size="sm"
            text="mono"
            radius={10}
            className="mt-[12px] self-start"
            accessibilityLabel="Measure the room again"
            onPress={onRecalibrate}
          >
            Recalibrate
          </Button>
        ) : null}

        <View className="mt-[26px]">
          <SectionLabel label="Pattern" />
        </View>
        <View className="mt-[14px] flex-row">
          <Segmented
            segments={[
              {
                id: 'preset',
                label: 'Choose a written rhythm',
                content: <SegmentText text="Preset" selected={!generating} />,
              },
              {
                id: 'generate',
                label: 'Compose one from note values',
                content: <SegmentText text="Generate" selected={generating} />,
              },
            ]}
            value={source.mode}
            onChange={(id) =>
              onChange({
                source:
                  id === 'generate'
                    ? { mode: 'generate', values: DEFAULT_VALUES, rests: true }
                    : { mode: 'preset', id: DEFAULT_PRESET_ID },
              })
            }
          />
        </View>

        {source.mode === 'preset' ? (
          <View className="mt-[16px]">
            {PRESETS.map((preset) => (
              <PresetRow
                key={preset.id}
                name={preset.name}
                hint={preset.hint}
                meter={preset.beatsPerBar}
                selected={preset.id === source.id}
                onPress={() => onChange({ source: { mode: 'preset', id: preset.id } })}
              />
            ))}
          </View>
        ) : (
          <>
            <Text className="mt-[18px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
              Note values in play
            </Text>
            <View className="mt-[10px] flex-row flex-wrap gap-[6px]">
              {NOTE_VALUES.map((value) => (
                <SelectableChip
                  key={value}
                  selected={values.includes(value)}
                  size="sm"
                  accessibilityLabel={spokenNameOf(value)}
                  onPress={() => toggleValue(value)}
                >
                  {nameOf(value)}
                </SelectableChip>
              ))}
              <SelectableChip
                selected={source.mode === 'generate' && source.rests}
                size="sm"
                accessibilityLabel="Allow rests in the pattern"
                onPress={() => {
                  if (source.mode !== 'generate') return;
                  onChange({ source: { ...source, rests: !source.rests } });
                }}
              >
                Rests
              </SelectableChip>
            </View>
            <Hint>The grid is only as fine as the shortest value you pick.</Hint>

            <Text className="mt-[20px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
              Beats per bar
            </Text>
            <View className="mt-[10px] flex-row">
              <Segmented
                segments={METERS.map((beats) => ({
                  id: String(beats),
                  label: `${beats} beats to a bar`,
                  content: (
                    <SegmentText text={String(beats)} selected={beats === settings.beatsPerBar} />
                  ),
                }))}
                value={String(settings.beatsPerBar)}
                onChange={(id) => onChange({ beatsPerBar: Number(id) as Meter })}
              />
            </View>
          </>
        )}

        <View className="mt-[26px]">
          <SectionLabel label="Auto tempo" />
        </View>
        <View className="mt-[14px] flex-row">
          <Segmented
            segments={[
              {
                id: 'off',
                label: 'Leave the tempo where you put it',
                content: <SegmentText text="Off" selected={!settings.ramp.enabled} />,
              },
              {
                id: 'on',
                label: 'Move the tempo with how you play',
                content: <SegmentText text="On" selected={settings.ramp.enabled} />,
              },
            ]}
            value={settings.ramp.enabled ? 'on' : 'off'}
            onChange={(id) => onChange({ ramp: { ...settings.ramp, enabled: id === 'on' } })}
          />
        </View>

        {settings.ramp.enabled ? (
          <>
            <Text className="mt-[18px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
              Step
            </Text>
            <View className="mt-[10px] flex-row">
              <Segmented
                segments={RAMP_STEPS.map((step) => ({
                  id: String(step),
                  label: `${step} BPM a step`,
                  content: <SegmentText text={`+${step}`} selected={step === settings.ramp.step} />,
                }))}
                value={String(settings.ramp.step)}
                onChange={(id) =>
                  onChange({ ramp: { ...settings.ramp, step: Number(id) as RampStep } })
                }
              />
            </View>
            <Hint>
              Two clean passes in a row move it up. One that falls apart moves it back down.
            </Hint>
          </>
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

function PresetRow({
  name,
  hint,
  meter,
  selected,
  onPress,
}: {
  name: string;
  hint: string;
  meter: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <SelectableChip
      selected={selected}
      size="md"
      radius={11}
      className="mt-[6px] w-full"
      accessibilityLabel={`${name}, ${meter} beats to a bar. ${hint}`}
      onPress={onPress}
    >
      <View className="w-full flex-row items-center gap-[10px]">
        <View className="flex-1">
          <Text
            className={`text-[14px] font-medium tracking-[-0.1px] ${
              selected ? 'text-accent' : 'text-ink'
            }`}
          >
            {name}
          </Text>
          <Text className="mt-[2px] text-[12px] leading-[16px] text-ink-muted">{hint}</Text>
        </View>
        <Text className="font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
          {meter}/4
        </Text>
      </View>
    </SelectableChip>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-[12px]">
      <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
        {label}
      </Text>
      <View className="h-px flex-1 bg-line-soft" />
    </View>
  );
}

function SegmentText({ text, selected }: { text: string; selected: boolean }) {
  return (
    <Text
      className={`text-[12.5px] font-medium tracking-[-0.1px] ${
        selected ? 'text-accent' : 'text-ink-muted'
      }`}
    >
      {text}
    </Text>
  );
}

function Hint({ children }: { children: string }) {
  return <Text className="mt-[10px] text-[12.5px] leading-[18px] text-ink-muted">{children}</Text>;
}
