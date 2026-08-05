import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FadingHScroll } from '@/components/FadingHScroll';
import { IconAction } from '@/components/IconAction';
import { Fretboard } from '@/features/chord-detection/Fretboard';
import { useChordBuilder } from '@/features/chord-detection/useChordBuilder';
import { ChipMenu } from '@/features/key-detection/ChipMenu';
import { KeyReadout } from '@/features/key-detection/KeyReadout';
import { ProgressionChips } from '@/features/key-detection/ProgressionChips';
import { useChipMenu } from '@/features/key-detection/useChipMenu';
import {
  buildProgressionChord,
  useKeyDetection,
  type DisplayChord,
} from '@/features/key-detection/useKeyDetection';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { useToken } from '@/lib/tokens';
import { encodeVoicing } from '@/lib/voicing-param';

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

interface Hint {
  text: string;
  dot: string;
  tone: string;
}

/** A coloured dot and its line, matching the colour a chip carries on the board. */
function HintRow({ hint }: { hint: Hint }) {
  return (
    <View className="flex-row items-center gap-[8px]">
      <View className={`h-[7px] w-[7px] rounded-full ${hint.dot}`} />
      <Text className={`font-mono text-[9.5px] uppercase tracking-[1.5px] ${hint.tone}`}>
        {hint.text}
      </Text>
    </View>
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
  const accent = useToken('--accent', '#5ec8c2');

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
  // Which reading pill the user has explicitly locked, if any. Everything else
  // about the board's reading choice is advisory — the key engine renames auto
  // chords freely — so this is the one piece of reading state that gets stored.
  // It dies with the voicing: fretting a note changes what the readings even are.
  const [boardPin, setBoardPin] = useState<number | null>(null);
  // A chip is out of the row and riding a finger. Not a mode you can enter — only
  // a drag in flight — so it is reported up from the row rather than set here.
  const [dragging, setDragging] = useState(false);

  const editing = editId !== null;
  // Order is order whatever the board happens to be doing, so an edit in progress
  // is no reason to refuse a drag. One chord is.
  const canReorder = chords.length >= 2;

  const endEdit = () => {
    setEditId(null);
    setBoardPin(null);
    clearBoard();
  };

  const onToggle = (string: number, fret: number) => {
    setBoardPin(null);
    toggle(string, fret);
  };

  const onClearBoard = () => {
    setBoardPin(null);
    clearBoard();
  };

  /**
   * A pill tap is how a reading gets pinned, and tapping the pinned pill again is
   * how it stops being pinned — the reading stays on screen either way; what
   * changes is whether the key engine is allowed to reconsider it later.
   */
  const onSelectReading = (index: number) => {
    setBoardPin((prev) => (prev === index ? null : index));
    select(index);
  };

  const onAdd = () => {
    if (!chord || isFull) return;
    add(buildProgressionChord(placed, readings, boardPin));
    setBoardPin(null);
    clearBoard();
  };

  const onSave = () => {
    if (!chord || !editId) return;
    replace(editId, buildProgressionChord(placed, readings, boardPin));
    endEdit();
  };

  const onDelete = () => {
    if (editId) remove(editId);
    endEdit();
  };

  const onEditChord = (stored: DisplayChord) => {
    setEditId(stored.id);
    setBoardPin(stored.pinned);
    // Open on the reading the chip is currently showing — the displayed key's
    // choice, or the pin — so the board and the chip agree on arrival.
    load(stored.voicing, stored.readings[stored.readingIndex]?.rootPc);
  };

  /**
   * A tap on the chip already being edited is the way out of the edit: the board is
   * cleared and nothing is written back, so whatever was being tried on the neck is
   * dropped. Saving is the Save button's job and only ever the Save button's job.
   */
  const onTapChord = (stored: DisplayChord) => {
    if (stored.id === editId) {
      endEdit();
      return;
    }
    onEditChord(stored);
  };

  /**
   * Hand a stored chord to the chord detector. Pushed rather than replaced, so this
   * screen stays mounted underneath with the progression, the chosen key and the
   * board exactly as they were — coming back is a pop, not a rebuild.
   */
  const onAnalyzeChord = (stored: DisplayChord) => {
    router.push({
      pathname: '/chord-detector',
      params: {
        voicing: encodeVoicing(stored.voicing),
        root: String(stored.readings[stored.readingIndex]?.rootPc ?? stored.readings[0].rootPc),
      },
    });
  };

  const menu = useChipMenu({
    onSelect: (id) => {
      const stored = chords.find((c) => c.id === id);
      if (stored) onEditChord(stored);
    },
    onAnalyze: (id) => {
      const stored = chords.find((c) => c.id === id);
      if (stored) onAnalyzeChord(stored);
    },
    onDelete: (id) => {
      remove(id);
      if (editId === id) endEdit();
    },
  });

  // The card hangs off a chip. Lose the chip — deleted from the board, or the whole
  // progression reset — and there is nothing left for it to point at.
  const menuTarget = menu.target;
  const menuChord = menuTarget ? chords.find((c) => c.id === menuTarget.id) : undefined;
  if (menuTarget && !menuChord) menu.close();

  const onResetProgression = () => {
    clearProgression();
    menu.close();
    if (editing) endEdit();
  };

  const hasBorrowed = labels.some((label) => !label.isDiatonic);

  const hints: Hint[] = [];
  if (hasBorrowed) {
    hints.push({ text: 'Borrowed from outside the key', dot: 'bg-amber', tone: 'text-amber' });
  }

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
        // A vertical drag belongs to the chip under the finger, not to the page —
        // and while a menu is up the page has to hold still, because the card and
        // the hole in its backdrop are pinned to where the chip was measured.
        scrollEnabled={!dragging && menuTarget === null}
        // The verdict sits at the top and the instrument at the bottom, so a tall
        // screen opens a gap between them rather than stranding the board in the
        // middle. `grow` lets the spacer below claim whatever is left over.
        contentContainerClassName="grow px-[18px] pt-[2px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <KeyReadout estimate={estimate} keyChoice={keyChoice} onSelectKey={setKeyChoice} />

        {/* Hangs off the card rather than the chip row, so a hint reads as a note
            on the verdict and does not drift down the page with the board. */}
        {hints.length > 0 ? (
          <View className="mt-[8px] gap-[6px] px-[2px]">
            {hints.map((hint) => (
              <HintRow key={hint.text} hint={hint} />
            ))}
          </View>
        ) : null}

        <View className="min-h-[20px] grow" />

        {chords.length === 0 ? (
          <Text className="text-[12.5px] leading-[18px] text-ink-muted">
            Chords you add show up here in order. Tap one to put it back on the neck and edit it, or
            hold one for more.
          </Text>
        ) : (
          <ProgressionChips
            chords={chords}
            labels={labels}
            activeId={editId}
            canReorder={canReorder}
            menuTargetId={menuTarget?.id ?? null}
            menuLatched={menu.latched}
            onSelect={onTapChord}
            onReorder={reorder}
            onOpenMenu={(index, anchor) => {
              const stored = chords[index];
              if (stored) menu.open(stored.id, anchor);
            }}
            onFocusMenu={menu.focus}
            onReleaseMenu={menu.release}
            onDismissMenu={menu.close}
            onDragging={setDragging}
          />
        )}

        {/* The name takes only the width it needs; whatever is left is the shelf
            for the alternate readings of the same shape. Whichever reading is
            chosen is what the key engine scores, so an Am7 heard as C6 moves the
            estimate.

            Fixed height: the reading pills are the tallest thing that can land in
            here, so without it the row grows by their overshoot the moment the
            board names a chord. Everything inside is sized to this height. */}
        <View className="mt-[24px] h-[30px] flex-row items-center gap-[14px]">
          <Text
            className={`shrink text-[27px] leading-[30px] font-semibold tracking-[-0.7px] ${
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
                  const pinnedHere = i === boardPin;
                  return (
                    <Pressable
                      key={`${reading.name}-${i}`}
                      onPress={() => onSelectReading(i)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={
                        pinnedHere
                          ? `Read as ${reading.name}, pinned. Tap to let the key decide.`
                          : `Read as ${reading.name}. Tap to pin this reading.`
                      }
                      className={`h-[30px] flex-row items-center justify-center gap-[5px] rounded-full border px-[13px] active:opacity-70 ${
                        on ? 'border-accent-line bg-accent-wash' : 'border-line-soft bg-surface'
                      }`}
                    >
                      {pinnedHere ? (
                        <SymbolView name="pin.fill" size={9} weight="semibold" tintColor={accent} />
                      ) : null}
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
              // Stands in for a reading, so the empty shelf still reads as one.
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
            onToggle={onToggle}
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
                onPress={onClearBoard}
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

      {/* Outside the scroll view on purpose. The chip it belongs to is two scroll
          views deep and both of them clip, so the card has to be drawn up here and
          told in window coordinates where its chip is. */}
      {menuTarget && menuChord ? (
        <ChipMenu
          anchor={menuTarget.anchor}
          focused={menu.focused}
          chordName={menuChord.name}
          onActivate={menu.activate}
          onDismiss={menu.close}
        />
      ) : null}
    </View>
  );
}
