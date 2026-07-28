import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fretboard } from '@/features/chord-detection/Fretboard';
import { KeyReadout } from '@/features/key-detection/KeyReadout';
import { ProgressionChips } from '@/features/key-detection/ProgressionChips';
import { useChordBuilder } from '@/features/key-detection/useChordBuilder';
import {
  buildProgressionChord,
  MAX_CHORDS,
  useKeyDetection,
} from '@/features/key-detection/useKeyDetection';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { ProgressionChord } from '@/lib/key-analysis';
import { useToken } from '@/lib/tokens';

const EM_DASH = '—';
const MIN_NOTES = 3;

function SectionLabel({ label, trailing }: { label: string; trailing?: string }) {
  return (
    <View className="flex-row items-center gap-[12px]">
      <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
        {label}
      </Text>
      <View className="h-px flex-1 bg-line-soft" />
      {trailing ? (
        <Text className="font-mono text-[10px] tracking-[1.5px] text-ink-faint">{trailing}</Text>
      ) : null}
    </View>
  );
}

interface ActionProps {
  label: string;
  disabled: boolean;
  onPress: () => void;
}

/** Filled accent CTA. Sinks to a dead surface when there is nothing to add. */
function PrimaryAction({ label, disabled, onPress }: ActionProps) {
  const onAccent = useToken('--on-accent', '#04211f');
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      className={`h-[50px] flex-1 flex-row items-center justify-center gap-[9px] rounded-[10px] border active:opacity-80 ${
        disabled
          ? 'border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface'
          : 'border-t-[rgba(255,255,255,0.4)] border-x-transparent border-b-[rgba(0,0,0,0.28)] bg-accent'
      }`}
    >
      <SymbolView name="plus" size={13} weight="bold" tintColor={disabled ? faint : onAccent} />
      <Text
        className={`text-[15px] font-bold tracking-[0.3px] ${
          disabled ? 'text-ink-faint' : 'text-on-accent'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Quiet counterpart to the CTA — a raised chip rather than a filled key. */
function SecondaryAction({ label, disabled, onPress }: ActionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      className="h-[50px] flex-1 items-center justify-center rounded-[10px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface-raised active:opacity-70"
    >
      <Text
        className={`text-[15px] font-semibold tracking-[-0.2px] ${
          disabled ? 'text-ink-faint' : 'text-ink'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Build a progression chord by chord on the neck and the engine names the key it
 * sits in. The board is the input, the chip row is the progression, and the
 * readout at the bottom is the verdict.
 */
export function KeyDetectorScreen() {
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
    clear: clearBoard,
    load,
  } = useChordBuilder();

  const {
    chords,
    estimate,
    labels,
    keyChoice,
    setKeyChoice,
    isFull,
    add,
    remove,
    clear: clearProgression,
  } = useKeyDetection();

  // Which stored chord the neck is currently showing, so its chip reads as the
  // source of what's on the board. Any edit to the voicing ends that.
  const [shownId, setShownId] = useState<string | null>(null);

  const onToggle = (string: number, fret: number) => {
    setShownId(null);
    toggle(string, fret);
  };

  const onClearBoard = () => {
    setShownId(null);
    clearBoard();
  };

  const onAdd = () => {
    if (!chord || isFull) return;
    add(buildProgressionChord(chord.name, placed, chord));
    setShownId(null);
    clearBoard();
  };

  const onShowChord = (stored: ProgressionChord) => {
    setShownId(stored.id);
    load(stored.voicing, stored.feature.rootPc);
  };

  const hasBorrowed = labels.some((label) => !label.isDiatonic);

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="h-[52px] flex-row items-center justify-between px-[18px]">
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back"
          className="-ml-[4px] flex-row items-center gap-[6px] py-[6px] pr-[8px] active:opacity-60"
        >
          <SymbolView name="chevron.left" size={15} weight="semibold" tintColor={muted} />
          <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">Key Detector</Text>
        </Pressable>

        <Pressable
          onPress={clearProgression}
          disabled={chords.length === 0}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Reset progression"
          className="py-[6px] active:opacity-60"
        >
          <Text
            className={`font-mono text-[10px] font-semibold uppercase tracking-[2px] ${
              chords.length === 0 ? 'text-ink-faint' : 'text-accent'
            }`}
          >
            Reset
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-[10px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Full-bleed: cancels the page padding so the neck runs to both screen
            edges. The board's own scroll padding puts fret 0 back on the margin. */}
        <View className="-mx-[18px]">
          <Fretboard
            placed={placed}
            rootPitchClass={rootPitchClass}
            nameForPitchClass={nameForPitchClass}
            onToggle={onToggle}
          />
        </View>

        <View className="mt-[16px] flex-row items-baseline gap-[12px]">
          <Text
            className={`text-[34px] leading-[37px] font-semibold tracking-[-0.9px] ${
              chord ? 'text-ink' : 'text-ink-faint'
            }`}
            numberOfLines={1}
          >
            {chord ? toAccidentalGlyphs(chord.name) : EM_DASH}
          </Text>
          {chord ? null : (
            <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
              {placed.length === 0
                ? `Tap ${MIN_NOTES} notes`
                : `${placed.length} of ${MIN_NOTES} notes`}
            </Text>
          )}
        </View>

        {/* Alternate readings of the same shape. Whichever is chosen is what the
            key engine scores, so an Am7 heard as C6 changes the estimate. */}
        {readings.length > 1 ? (
          <View className="mt-[14px] flex-row flex-wrap gap-[8px]">
            {readings.map((reading, i) => {
              const on = i === selectedIndex;
              return (
                <Pressable
                  key={`${reading.name}-${i}`}
                  onPress={() => select(i)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`Read as ${reading.name}`}
                  className={`rounded-full border px-[13px] py-[7px] active:opacity-70 ${
                    on ? 'border-accent-line bg-accent-wash' : 'border-line-soft bg-surface'
                  }`}
                >
                  <Text
                    className={`text-[13px] font-medium tracking-[-0.1px] ${
                      on ? 'text-accent' : 'text-ink-muted'
                    }`}
                  >
                    {toAccidentalGlyphs(reading.name)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View className="mt-[20px] flex-row gap-[10px]">
          <SecondaryAction
            label="Clear board"
            disabled={placed.length === 0}
            onPress={onClearBoard}
          />
          <PrimaryAction
            label={isFull ? 'Full' : 'Add chord'}
            disabled={!chord || isFull}
            onPress={onAdd}
          />
        </View>

        <View className="mt-[32px]">
          <SectionLabel label="Progression" trailing={`${chords.length} / ${MAX_CHORDS}`} />

          {chords.length === 0 ? (
            <Text className="mt-[14px] text-[12.5px] leading-[18px] text-ink-muted">
              Chords you add show up here in order. Tap one to put its shape back on the neck.
            </Text>
          ) : (
            <View className="mt-[14px]">
              <ProgressionChips
                chords={chords}
                labels={labels}
                activeId={shownId}
                onSelect={onShowChord}
                onRemove={remove}
              />
              {hasBorrowed ? (
                <Text className="mt-[14px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-amber">
                  Amber · borrowed from outside the key
                </Text>
              ) : null}
            </View>
          )}
        </View>

        <View className="mt-[28px]">
          <KeyReadout estimate={estimate} keyChoice={keyChoice} onSelectKey={setKeyChoice} />
        </View>
      </ScrollView>
    </View>
  );
}
