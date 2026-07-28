import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadingHScroll } from '@/components/FadingHScroll';
import { Fretboard } from '@/features/chord-detection/Fretboard';
import { KeyReadout } from '@/features/key-detection/KeyReadout';
import { ProgressionChips } from '@/features/key-detection/ProgressionChips';
import { useChordBuilder } from '@/features/key-detection/useChordBuilder';
import { buildProgressionChord, useKeyDetection } from '@/features/key-detection/useKeyDetection';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { ProgressionChord } from '@/lib/key-analysis';
import { useToken } from '@/lib/tokens';

type Symbol = ComponentProps<typeof SymbolView>['name'];

const EM_DASH = '—';

interface PrimaryProps {
  label: string;
  symbol: Symbol;
  disabled: boolean;
  onPress: () => void;
}

/** Filled accent CTA. Sinks to a dead surface when there is nothing to commit. */
function PrimaryAction({ label, symbol, disabled, onPress }: PrimaryProps) {
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
      <SymbolView name={symbol} size={13} weight="bold" tintColor={disabled ? faint : onAccent} />
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

interface IconProps {
  symbol: Symbol;
  label: string;
  disabled?: boolean;
  /** Lit, for a control that toggles a mode the screen is currently in. */
  on?: boolean;
  destructive?: boolean;
  onPress: () => void;
}

/** Square counterpart to the CTA — a raised key carrying only its glyph. */
function IconAction({
  symbol,
  label,
  disabled = false,
  on = false,
  destructive,
  onPress,
}: IconProps) {
  const ink = useToken('--ink', '#eef0f4');
  const faint = useToken('--ink-faint', '#62666e');
  const accent = useToken('--accent', '#5ec8c2');
  const rose = useToken('--rose', '#e0788f');

  const tint = disabled ? faint : on ? accent : destructive ? rose : ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: on }}
      accessibilityLabel={label}
      className={`h-[50px] w-[50px] items-center justify-center rounded-[10px] border active:opacity-70 ${
        on
          ? 'border-accent-line bg-accent-wash'
          : 'border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface-raised'
      }`}
    >
      <SymbolView name={symbol} size={17} weight="semibold" tintColor={tint} />
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
    replace,
    remove,
    reorder,
    clear: clearProgression,
  } = useKeyDetection();

  // The board has two jobs: composing a new chord, or standing in for one already
  // in the progression. `editId` is which, and it decides the whole action row.
  const [editId, setEditId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const editing = editId !== null;
  const canReorder = chords.length >= 2 && !editing;
  // Dragging has no meaning once there is one chord left or the board is busy
  // editing, so the mode drops itself rather than waiting to be dismissed.
  if (reordering && !canReorder) setReordering(false);

  const endEdit = () => {
    setEditId(null);
    clearBoard();
  };

  const onAdd = () => {
    if (!chord || isFull) return;
    add(buildProgressionChord(chord.name, placed, chord));
    clearBoard();
  };

  const onSave = () => {
    if (!chord || !editId) return;
    replace(editId, buildProgressionChord(chord.name, placed, chord));
    endEdit();
  };

  const onDelete = () => {
    if (editId) remove(editId);
    endEdit();
  };

  const onEditChord = (stored: ProgressionChord) => {
    setEditId(stored.id);
    load(stored.voicing, stored.feature.rootPc);
  };

  const onResetProgression = () => {
    clearProgression();
    if (editing) endEdit();
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
          onPress={onResetProgression}
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
        // A vertical drag in reorder mode belongs to the chip under the finger,
        // not to the page.
        scrollEnabled={!reordering}
        // The verdict sits at the top and the instrument at the bottom, so a tall
        // screen opens a gap between them rather than stranding the board in the
        // middle. `grow` lets the spacer below claim whatever is left over.
        contentContainerClassName="grow px-[18px] pt-[10px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <KeyReadout estimate={estimate} keyChoice={keyChoice} onSelectKey={setKeyChoice} />

        <View className="min-h-[28px] grow" />

        {chords.length === 0 ? (
          <Text className="text-[12.5px] leading-[18px] text-ink-muted">
            Chords you add show up here in order. Tap one to put it back on the neck and edit it.
          </Text>
        ) : (
          <View>
            <ProgressionChips
              chords={chords}
              labels={labels}
              activeId={editId}
              reordering={reordering}
              canReorder={canReorder}
              onSelect={onEditChord}
              onReorder={reorder}
              onBeginReorder={() => setReordering(true)}
              onEndReorder={() => setReordering(false)}
            />

            {reordering ? (
              <Text className="mt-[12px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-accent">
                Drag a chord to move it
              </Text>
            ) : hasBorrowed ? (
              <Text className="mt-[12px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-amber">
                Amber · borrowed from outside the key
              </Text>
            ) : null}
          </View>
        )}

        {/* The name takes only the width it needs; whatever is left is the shelf
            for the alternate readings of the same shape. Whichever reading is
            chosen is what the key engine scores, so an Am7 heard as C6 moves the
            estimate. */}
        <View className="mt-[24px] flex-row items-center gap-[14px]">
          <Text
            className={`shrink text-[34px] leading-[37px] font-semibold tracking-[-0.9px] ${
              chord ? 'text-ink' : 'text-ink-faint'
            }`}
            numberOfLines={1}
          >
            {chord ? toAccidentalGlyphs(chord.name) : EM_DASH}
          </Text>

          <View className="min-w-0 flex-1">
            {readings.length > 1 ? (
              <FadingHScroll
                contentClassName="flex-row gap-[8px] pr-[4px]"
                fadeClassName="w-[26px]"
                fadeTravel={22}
              >
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
              </FadingHScroll>
            ) : chord ? null : (
              // Sized as a reading would be, so the shelf keeps its height and the
              // row does not shift when the first real label lands in it.
              <Text className="text-[13px] font-medium tracking-[-0.1px] text-ink-faint">
                {EM_DASH}
              </Text>
            )}
          </View>
        </View>

        {/* Full-bleed: cancels the page padding so the neck runs to both screen
            edges. The board's own scroll padding puts fret 0 back on the margin. */}
        <View className="-mx-[18px] mt-[16px]">
          <Fretboard
            placed={placed}
            rootPitchClass={rootPitchClass}
            nameForPitchClass={nameForPitchClass}
            onToggle={toggle}
          />
        </View>

        <View className="mt-[18px] flex-row gap-[10px]">
          {editing ? (
            <>
              <IconAction symbol="trash" label="Delete chord" destructive onPress={onDelete} />
              <IconAction symbol="xmark" label="Cancel edit" onPress={endEdit} />
              <PrimaryAction label="Save" symbol="checkmark" disabled={!chord} onPress={onSave} />
            </>
          ) : (
            <>
              <IconAction
                symbol="arrow.counterclockwise"
                label="Clear board"
                disabled={placed.length === 0}
                onPress={clearBoard}
              />
              <IconAction
                symbol={reordering ? 'checkmark' : 'arrow.left.arrow.right'}
                label={reordering ? 'Done reordering' : 'Reorder chords'}
                disabled={!canReorder}
                on={reordering}
                onPress={() => setReordering(!reordering)}
              />
              <PrimaryAction
                label={isFull ? 'Full' : 'Add chord'}
                symbol="plus"
                disabled={!chord || isFull}
                onPress={onAdd}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
