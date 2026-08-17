import { useImperativeHandle, type Ref } from 'react';
import { Text, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';

import { Fretboard } from './Fretboard';
import { useChordDetection, type PlacedNote } from './useChordDetection';

const EM_DASH = '—';
const MIN_NOTES = 3;

export type InlineChordDetectorBoard = {
  placed: PlacedNote[];
  /** Root of the reading being shown, so the full screen opens on the same one. */
  rootPitchClass: number | null;
};

export type InlineChordDetectorRef = {
  /** Whatever is on the neck right now, for handing over to the chord detector screen. */
  board: () => InlineChordDetectorBoard;
};

/**
 * Home-screen chord detection. Build a voicing on the neck and the engine's best
 * reading of it appears underneath — the name only, no alternates or interval detail.
 *
 * The board is read through a ref rather than lifted: the section header above only
 * needs it at the moment it is tapped, and holding it here keeps a tap on the neck
 * from re-rendering the whole home screen.
 */
export function InlineChordDetector({ ref }: { ref?: Ref<InlineChordDetectorRef> }) {
  const { placed, chord, rootPitchClass, nameForPitchClass, toggle } = useChordDetection();

  useImperativeHandle(ref, () => ({ board: () => ({ placed, rootPitchClass }) }), [
    placed,
    rootPitchClass,
  ]);

  return (
    <View>
      {/* Full-bleed: cancels the home screen's 18px page padding so the neck runs
          to both screen edges. The board's own scroll padding puts fret 0 back on
          the page margin at rest. */}
      <View className="-mx-[18px]">
        <Fretboard
          placed={placed}
          rootPitchClass={rootPitchClass}
          nameForPitchClass={nameForPitchClass}
          onToggle={toggle}
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
    </View>
  );
}
