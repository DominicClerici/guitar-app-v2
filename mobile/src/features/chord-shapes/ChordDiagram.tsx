import { Text, View } from 'react-native';

import { STRING_COUNT } from '@/lib/theory';
import type { Voicing } from '@/lib/guitar-voicings';

// The box shows four frets, which is exactly the reach the generator allows, so
// every shape fits without the diagram ever having to scroll or scale.
const ROWS = 4;

// Strings run low E on the left, the way charts are drawn. The engine indexes
// the other way (0 = high e), so this is where the two orders meet: `display`
// walks left to right and hands back the engine's index.
const DISPLAY = Array.from({ length: STRING_COUNT }, (_, i) => STRING_COUNT - 1 - i);
const FRET_ROWS = Array.from({ length: ROWS }, (_, i) => i);

// Tailwind classes have to be static strings, so each size is a fixed set rather
// than anything computed. Card is sized to sit three across at page width.
const SIZES = {
  card: {
    cell: 'w-[15px]',
    row: 'h-[18px]',
    dot: 'h-[13px] w-[13px]',
    dotText: 'text-[8px]',
    head: 'text-[9px]',
    marker: 'text-[8px]',
    markerBox: 'w-[16px]',
  },
  detail: {
    cell: 'w-[24px]',
    row: 'h-[28px]',
    dot: 'h-[21px] w-[21px]',
    dotText: 'text-[11px]',
    head: 'text-[12px]',
    marker: 'text-[10px]',
    markerBox: 'w-[24px]',
  },
} as const;

interface Props {
  voicing: Voicing;
  size?: keyof typeof SIZES;
}

/**
 * A chord box. Six vertical strings, four frets, a dot per fretted note carrying
 * the finger that holds it, and o/× above the nut for what rings open and what
 * stays silent.
 *
 * The window starts at the shape's own position, so a barre chord at the eighth
 * fret is drawn as the same four-fret box as an open chord with an "8fr" marker
 * instead of a nut.
 */
export function ChordDiagram({ voicing, size = 'card' }: Props) {
  const s = SIZES[size];

  // The window is decided by the *highest* fret, not the position. Em is
  // `0 2 2 0 0 0` — position 2, because that is where its lowest finger sits —
  // but it is an open chord and belongs against the nut. Anything reaching past
  // the fourth fret can no longer be drawn there and gets a position marker.
  const fingered = voicing.frets.filter((fret): fret is number => fret !== null && fret > 0);
  const highest = fingered.length > 0 ? Math.max(...fingered) : 0;
  const atNut = highest <= ROWS;
  const base = atNut ? 1 : voicing.position;

  return (
    <View className="flex-row">
      {/* The marker column mirrors the header and nut so "8fr" lands level with
          the first fret rather than being nudged into place by hand. */}
      <View className={`${s.markerBox} items-end pr-[3px]`}>
        <Text className={`font-mono ${s.head} opacity-0`}> </Text>
        <View className="mt-[2px] h-[3px]" />
        <View className={`${s.row} justify-center`}>
          {atNut ? null : (
            <Text className={`font-mono ${s.marker} text-ink-muted`}>{base}fr</Text>
          )}
        </View>
      </View>

      <View>
        {/* Open and muted strings, read above the nut. */}
        <View className="flex-row">
          {DISPLAY.map((string) => {
            const fret = voicing.frets[string];
            return (
              <View key={string} className={`${s.cell} items-center`}>
                <Text
                  className={`font-mono ${s.head} ${
                    fret === null ? 'text-ink-faint' : 'text-ink-muted'
                  }`}
                >
                  {fret === null ? '×' : fret === 0 ? 'o' : ' '}
                </Text>
              </View>
            );
          })}
        </View>

        {/* The nut is a thick bar; further up the neck it is an ordinary fret.
            The slot keeps its height either way so the rows never shift. */}
        <View className="mt-[2px] h-[3px] justify-center">
          <View className={atNut ? 'h-[3px] bg-ink-muted' : 'h-px bg-line'} />
        </View>

        <View>
          {/* Strings run behind the dots, so a dot reads as sitting on one. */}
          <View className="pointer-events-none absolute inset-0 flex-row">
            {DISPLAY.map((string) => (
              <View key={string} className={`${s.cell} items-center`}>
                <View className="w-px flex-1 bg-line" />
              </View>
            ))}
          </View>

          {FRET_ROWS.map((row) => {
            const fret = base + row;
            return (
              <View key={fret} className={`${s.row} flex-row border-b border-b-line-soft`}>
                {DISPLAY.map((string) => (
                  <Cell
                    key={string}
                    size={s}
                    voicing={voicing}
                    string={string}
                    fret={fret}
                  />
                ))}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

interface CellProps {
  size: (typeof SIZES)[keyof typeof SIZES];
  voicing: Voicing;
  string: number;
  fret: number;
}

function Cell({ size, voicing, string, fret }: CellProps) {
  const held = voicing.frets[string] === fret;
  const barre = voicing.barre;
  const underBarre =
    barre !== undefined &&
    barre.fret === fret &&
    string >= barre.firstString &&
    string <= barre.lastString;

  if (underBarre) {
    // Drawn a segment at a time so the bar runs continuously across the strings
    // it covers without any class needing a computed width.
    const isLow = string === barre.lastString;
    const isHigh = string === barre.firstString;
    return (
      <View className={`${size.cell} items-center justify-center`}>
        <View className="absolute inset-0 items-center justify-center">
          <View
            className={`w-full bg-accent ${size.dot} ${isLow ? 'rounded-l-full' : ''} ${
              isHigh ? 'rounded-r-full' : ''
            }`}
          />
        </View>
        {isLow ? (
          <Text className={`${size.dotText} font-bold text-on-accent`}>1</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className={`${size.cell} items-center justify-center`}>
      {held ? (
        <View className={`${size.dot} items-center justify-center rounded-full bg-accent`}>
          <Text className={`${size.dotText} font-bold text-on-accent`}>
            {voicing.fingers[string]}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
