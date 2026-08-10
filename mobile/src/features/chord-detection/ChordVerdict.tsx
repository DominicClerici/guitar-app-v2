import { Text, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { ChordResult } from '@/lib/chord-analysis';

import type { PlacedNote } from './useChordDetection';
import { voicingChart } from './voicing';

const EM_DASH = '—';
const MIN_NOTES = 3;

const MICRO = 'font-mono text-[9.5px] uppercase tracking-[1.5px]';

/**
 * The verdict: what the shape is called, on its own line so a long symbol never
 * has to share width. Beneath it the analysis on the left and the voicing that
 * produced it on the right — the same chord read two ways, out and in.
 */
export function ChordVerdict({
  chord,
  placed,
}: {
  chord: ChordResult | undefined;
  placed: PlacedNote[];
}) {
  const tones = chord?.chordTones;

  return (
    <View>
      <Text
        className={`text-[40px] leading-[44px] font-semibold tracking-[-1.1px] ${
          chord ? 'text-ink' : 'text-ink-faint'
        }`}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {chord ? toAccidentalGlyphs(chord.name) : EM_DASH}
      </Text>

      <View className="mt-[9px] flex-row items-center justify-between gap-[12px]">
        <Text className={`${MICRO} shrink text-ink-faint`} numberOfLines={1}>
          {tones
            ? `Root ${toAccidentalGlyphs(tones.root)}${
                tones.bass ? ` · Bass ${toAccidentalGlyphs(tones.bass)}` : ''
              }`
            : placed.length < MIN_NOTES
              ? `${placed.length} of ${MIN_NOTES} notes`
              : 'No reading'}
        </Text>

        <Text className={`${MICRO} text-ink-muted`}>{voicingChart(placed).join(' ')}</Text>
      </View>
    </View>
  );
}
