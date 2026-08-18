import { useMemo, type Ref } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SelectableChips, type ChipItem } from '@/components/SelectableChip';
import { Segmented } from '@/components/Segmented';
import { Sheet, type SheetRef } from '@/components/Sheet';
import { chromaticName, toAccidentalGlyphs, type AccidentalSide } from '@/lib/accidentals';
import { DEFAULT_ROAM_EVERY, type KeyPolicy, type TrainerConfig } from '@/lib/ear-training';
import { useAccidentalSide } from '@/lib/preferences';

import { DegreeCircle } from './DegreeCircle';

export type TrainerConfigSheetRef = SheetRef;

/** The smallest set a question can choose between. */
const MIN_DEGREES = 2;

/** The picker's copy of the circle, sized to sit inside a sheet. */
const PICKER_SIZE = 264;

interface Props {
  ref?: Ref<TrainerConfigSheetRef>;
  config: TrainerConfig;
  onDegrees: (degrees: number[]) => void;
  onKeyPolicy: (policy: KeyPolicy) => void;
}

/**
 * What Free Play lets you decide: which degrees are in play, and where the
 * tonic lives. The picker is the same fifths circle the trainer answers on —
 * choosing degrees on the map they will be asked on is half of knowing it.
 */
export function TrainerConfigSheet({ ref, config, onDegrees, onKeyPolicy }: Props) {
  const insets = useSafeAreaInsets();
  const side = useAccidentalSide(TRAINER_FALLBACK);
  const tonics = useMemo(() => tonicChips(side), [side]);
  const fixed = config.keyPolicy.mode === 'fixed';
  // The key to return to when switching back from roaming.
  const heldTonic = config.keyPolicy.mode === 'fixed' ? config.keyPolicy.tonicPc : 0;

  const toggleDegree = (degree: number) => {
    const has = config.degrees.includes(degree);
    if (has && config.degrees.length <= MIN_DEGREES) return;
    onDegrees(
      has
        ? config.degrees.filter((d) => d !== degree)
        : [...config.degrees, degree].sort((a, b) => a - b),
    );
  };

  return (
    <Sheet ref={ref}>
      <View className="px-[18px] pt-[6px]" style={{ paddingBottom: insets.bottom + 18 }}>
        <SectionLabel label="Degrees in play" />

        <View className="mt-[16px] items-center">
          <DegreeCircle
            size={PICKER_SIZE}
            activeDegrees={config.degrees}
            dimInactive
            emphasizeActive
            onPress={toggleDegree}
          />
        </View>

        <Text className="mt-[14px] text-center font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
          Tap to add or drop · at least {MIN_DEGREES} stay in
        </Text>

        <View className="mt-[26px]">
          <SectionLabel label="Key" />
        </View>

        <View className="mt-[14px] flex-row justify-center">
          <Segmented
            segments={[
              {
                id: 'fixed',
                label: 'Hold one key',
                content: <SegmentText text="Fixed" selected={fixed} />,
              },
              {
                id: 'roaming',
                label: `Move to a new key every ${DEFAULT_ROAM_EVERY} questions`,
                content: <SegmentText text="Roaming" selected={!fixed} />,
              },
            ]}
            value={config.keyPolicy.mode}
            onChange={(id) =>
              onKeyPolicy(
                id === 'fixed'
                  ? { mode: 'fixed', tonicPc: heldTonic }
                  : { mode: 'roaming', everyN: DEFAULT_ROAM_EVERY },
              )
            }
          />
        </View>

        {config.keyPolicy.mode === 'fixed' ? (
          <SelectableChips
            items={tonics}
            value={String(config.keyPolicy.tonicPc)}
            onChange={(id) => onKeyPolicy({ mode: 'fixed', tonicPc: Number(id) })}
            size="xs"
            text="mono"
            className="mt-[16px] justify-center"
            chipClassName="min-w-[42px]"
          />
        ) : (
          <Text className="mt-[16px] text-center font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
            The drone moves every {DEFAULT_ROAM_EVERY} questions
          </Text>
        )}
      </View>
    </Sheet>
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

/**
 * How the drone's twelve homes are spelled with nothing to spell them against — sharps, which is
 * what this chip row has always shown and how the chromatic ladder is counted going up. Any of the
 * twelve is as good a home as any other here, so the spelling is a free choice and the user's wins.
 */
export const TRAINER_FALLBACK: AccidentalSide = 'sharp';

/** The twelve keys the drone can be held in, keyed by pitch class. */
function tonicChips(side: AccidentalSide): ChipItem[] {
  return Array.from({ length: 12 }, (_, pc) => {
    const name = chromaticName(pc, side);
    return {
      id: String(pc),
      label: toAccidentalGlyphs(name),
      accessibilityLabel: `Key of ${name}`,
    };
  });
}
