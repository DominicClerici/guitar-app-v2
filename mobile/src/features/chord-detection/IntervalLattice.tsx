import { Text, View } from 'react-native';

import { useFace } from '@/components/CornerFace';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { EMPTY_CHORD_TONES, type ChordTones, type IntervalSlot } from '@/lib/chord-analysis';

// Every slot occupies one seventh of the width whether or not its row fills all
// seven, so the columns line up down the panel and the five-slot seventh row
// ends ragged rather than stretching to meet the others.
const COLUMN = 'w-[14.2857%]';

interface Row {
  label: string;
  slots: IntervalSlot[];
}

/**
 * The chord as a panel of nineteen fixed slots. Every slot is always drawn — an
 * interval the voicing doesn't play sits unlit rather than disappearing, so a
 * missing third reads as a gap you can see instead of a fact you have to be told,
 * and nothing on the panel moves when the chord changes.
 */
export function IntervalLattice({ tones }: { tones: ChordTones | undefined }) {
  const grid = tones ?? EMPTY_CHORD_TONES;

  const rows: Row[] = [
    { label: 'Triad', slots: grid.triad },
    { label: 'Seventh', slots: grid.seventh },
    { label: 'Extensions', slots: grid.extensions },
  ];

  return (
    <View className="gap-[16px]">
      {rows.map((row) => (
        <View key={row.label}>
          <Rule label={row.label} />
          <View className="mt-[8px] flex-row">
            {row.slots.map((slot) => (
              <Slot key={slot.interval} slot={slot} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Row heading, the same cap-and-hairline the tool catalogue uses for its sections. */
function Rule({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-[12px]">
      <Text className="font-mono text-[9.5px] font-semibold uppercase tracking-[2px] text-ink-faint">
        {label}
      </Text>
      <View className="h-px flex-1 bg-line-soft" />
    </View>
  );
}

function Slot({ slot }: { slot: IntervalSlot }) {
  const note = slot.note;
  const lit = note !== null;
  // Altered tones keep the panel's grammar but change its colour, so the spicy
  // ones announce themselves without needing a legend.
  const tone = slot.altered ? 'text-amber' : 'text-accent';
  const face = useFace(lit ? 'key' : 'bare', 8);

  return (
    <View className={`${COLUMN} px-[2px]`}>
      <View className={`h-[46px] items-center justify-center rounded-[8px] ${face.className}`}>
        {face.paint}
        <Text
          className={`font-mono text-[8.5px] tracking-[0.3px] ${lit ? tone : 'text-ink-faint'}`}
          numberOfLines={1}
        >
          {toAccidentalGlyphs(slot.interval)}
        </Text>
        {note !== null ? (
          <Text
            className="mt-[3px] text-[13px] font-semibold tracking-[-0.2px] text-ink"
            numberOfLines={1}
          >
            {toAccidentalGlyphs(note)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
