import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconAction } from '@/components/IconAction';
import { ChordVerdict } from '@/features/chord-detection/ChordVerdict';
import { degreeForPitchClassFrom } from '@/features/chord-detection/degrees';
import { Fretboard } from '@/features/chord-detection/Fretboard';
import { IntervalLattice } from '@/features/chord-detection/IntervalLattice';
import { LabelModeToggle, type LabelMode } from '@/features/chord-detection/LabelModeToggle';
import { ReadingShelf } from '@/features/chord-detection/ReadingShelf';
import { useChordBuilder } from '@/features/chord-detection/useChordBuilder';
import { WarningNotes } from '@/features/chord-detection/WarningNotes';
import { useToken } from '@/lib/tokens';

/**
 * Everything the engine knows about one shape. The neck is fixed to the bottom of
 * the screen so it stays under your thumb while the readout scrolls above it, and
 * the whole readout — name, intervals, warnings, and the labels on the board
 * itself — hangs off whichever reading of the shape is currently accepted.
 */
export function ChordDetectorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const muted = useToken('--ink-muted', '#9aa0aa');

  const {
    placed,
    readings,
    chord,
    selectedIndex,
    rootPitchClass,
    nameForPitchClass,
    toggle,
    select,
    clear,
  } = useChordBuilder();

  const [labelMode, setLabelMode] = useState<LabelMode>('notes');

  const degreeForPitchClass = useMemo(() => degreeForPitchClassFrom(chord), [chord]);
  const labelForPitchClass = labelMode === 'degrees' ? degreeForPitchClass : nameForPitchClass;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[42px] flex-row items-center justify-between px-[18px]">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="-ml-[4px] flex-row items-center gap-[6px] py-[6px] pr-[8px] active:opacity-60"
        >
          <SymbolView name="chevron.left" size={15} weight="semibold" tintColor={muted} />
          <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">Chord Detector</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-[6px] pb-[28px]"
      >
        <ChordVerdict chord={chord} placed={placed} />

        {readings.length > 0 ? (
          <View className="mt-[24px]">
            <ReadingShelf
              readings={readings}
              selectedIndex={selectedIndex}
              onSelect={select}
            />
          </View>
        ) : null}

        <View className="mt-[26px]">
          <IntervalLattice tones={chord?.chordTones} />
        </View>

        {chord ? (
          <View className="mt-[24px]">
            <WarningNotes warnings={chord.warnings} />
          </View>
        ) : null}
      </ScrollView>

      {/* The instrument, fixed. It sits on the tray so the readout above reads as
          floating over a base plate rather than continuing into one. */}
      <View
        className="border-t border-t-line-soft bg-tray pt-[6px]"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Fretboard
          placed={placed}
          rootPitchClass={rootPitchClass}
          nameForPitchClass={labelForPitchClass}
          onToggle={toggle}
          veilToken="--tray"
        />

        <View className="mt-[10px] flex-row gap-[10px] px-[18px]">
          <LabelModeToggle mode={labelMode} onChange={setLabelMode} />
          <IconAction
            symbol="arrow.counterclockwise"
            label="Clear board"
            disabled={placed.length === 0}
            onPress={clear}
          />
        </View>
      </View>
    </View>
  );
}
