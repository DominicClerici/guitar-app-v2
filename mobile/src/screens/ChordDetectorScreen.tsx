import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CornerStyleProvider, useFace, type CornerStyle } from '@/components/CornerFace';
import { CornerStyleToggle } from '@/components/CornerStyleToggle';
import { IconAction } from '@/components/IconAction';
import { ChordVerdict } from '@/features/chord-detection/ChordVerdict';
import { degreeForPitchClassFrom } from '@/features/chord-detection/degrees';
import { Fretboard } from '@/features/chord-detection/Fretboard';
import { IntervalLattice } from '@/features/chord-detection/IntervalLattice';
import { LabelModeToggle, type LabelMode } from '@/features/chord-detection/LabelModeToggle';
import { ReadingShelf } from '@/features/chord-detection/ReadingShelf';
import { useChordBuilder, type InitialVoicing } from '@/features/chord-detection/useChordBuilder';
import { WarningNotes } from '@/features/chord-detection/WarningNotes';
import { useToken } from '@/lib/tokens';
import { decodeVoicing, encodeVoicing } from '@/lib/voicing-param';

/**
 * Everything the engine knows about one shape. The neck is fixed to the bottom of
 * the screen so it stays under your thumb while the readout scrolls above it, and
 * the whole readout — name, intervals, warnings, and the labels on the board
 * itself — hangs off whichever reading of the shape is currently accepted.
 *
 * A `voicing` param is a chord sent over from the key detector's progression. It
 * arrives with the `root` of the reading that was accepted there, so an Am7 stored
 * as an Am7 opens as one rather than re-ranking to a C6.
 */
export function ChordDetectorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const muted = useToken('--ink-muted', '#9aa0aa');

  const { voicing, root } = useLocalSearchParams<{ voicing?: string; root?: string }>();

  // Read once and held: the builder takes this as initial state, and a new object
  // on every render would say the handoff had changed when nothing had.
  const initial = useMemo<InitialVoicing | undefined>(() => {
    const placed = decodeVoicing(voicing);
    if (placed.length === 0) return undefined;

    const rootPitchClass = Number(root);
    return {
      placed,
      rootPitchClass: Number.isInteger(rootPitchClass) ? rootPitchClass : undefined,
    };
  }, [voicing, root]);

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
  } = useChordBuilder(initial);

  const [labelMode, setLabelMode] = useState<LabelMode>('notes');
  const [corners, setCorners] = useState<CornerStyle>('circular');

  const degreeForPitchClass = useMemo(() => degreeForPitchClassFrom(chord), [chord]);
  const labelForPitchClass = labelMode === 'degrees' ? degreeForPitchClass : nameForPitchClass;

  return (
    <CornerStyleProvider value={corners}>
      <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
        {/* The A/B switch rides in the header: it is the smallest surface on the
            screen, so it is where the corner treatment is hardest to fake. */}
        <View className="h-[44px] flex-row items-center justify-between px-[18px]">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Back"
            className="-ml-[4px] flex-row items-center gap-[6px] py-[6px] pr-[8px] active:opacity-60"
          >
            <SymbolView name="chevron.left" size={15} weight="semibold" tintColor={muted} />
            <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">
              Chord Detector
            </Text>
          </Pressable>

          <CornerStyleToggle value={corners} onChange={setCorners} />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-[18px] pt-[6px] pb-[28px]"
        >
          <ChordVerdict chord={chord} placed={placed} />

          {readings.length > 0 ? (
            <View className="mt-[24px]">
              <ReadingShelf readings={readings} selectedIndex={selectedIndex} onSelect={select} />
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
            {/* Always in the row rather than appearing with the reading: the two
                controls beside it should not move as the shape resolves. */}
            <DroneAction
              label={chord ? `Hold ${chord.name} as a drone` : 'Drone. Build a chord first.'}
              disabled={!chord}
              onPress={() =>
                router.push({
                  pathname: '/drone',
                  params: {
                    voicing: encodeVoicing(placed),
                    root: String(rootPitchClass),
                    play: '1',
                  },
                })
              }
            />
            <IconAction
              symbol="arrow.counterclockwise"
              label="Clear board"
              disabled={placed.length === 0}
              onPress={clear}
            />
          </View>
        </View>
      </View>
    </CornerStyleProvider>
  );
}

/**
 * Sends the shape on the neck to the drone. Sits between the two other keys in
 * the tray and is built like them — the same raised key, widened to carry a word,
 * because handing the chord on is an action on the shape rather than a way out of
 * the screen.
 */
function DroneAction({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const accent = useToken('--accent', '#5ec8c2');
  const faint = useToken('--ink-faint', '#62666e');
  const face = useFace('key', 10);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      className={`h-[50px] flex-row items-center gap-[7px] rounded-[10px] px-[14px] active:opacity-70 ${
        disabled ? 'opacity-45' : ''
      } ${face.className}`}
    >
      {face.paint}
      <SymbolView
        name="speaker.wave.2"
        size={15}
        weight="semibold"
        tintColor={disabled ? faint : accent}
      />
      <Text
        className={`font-mono text-[10px] font-semibold uppercase tracking-[1.5px] ${
          disabled ? 'text-ink-faint' : 'text-accent'
        }`}
      >
        Drone
      </Text>
    </Pressable>
  );
}
