import { Text, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { ActivityMode, FretPosition, FretWindow } from '@/lib/content';
import { targetLabel } from '@/lib/note-play';
import {
  DOUBLE_INLAY_FRET,
  SINGLE_INLAY_FRETS,
  STRING_COUNT,
  STRING_GAUGE_CLASS,
  STRING_LABELS,
  stringIndexFromWire,
  wireStringFromIndex,
} from '@/lib/theory';

// A read-only neck that lights up as the learner plays.
//
// This is the app's third board, and the quiz's is the one it looks most like — but a quiz board
// is fixed-width and scrolls, and a target scrolled off the edge is exactly the wrong failure
// here. A quiz asks the learner to tap a position they can go and find; an activity asks them to
// play a note they must be able to *see* the whole time, with both hands on the guitar and no
// spare finger to scroll with. So the window fits the screen instead: flex-sized columns, the
// whole fret range always on screen, however wide the round asks for.
//
// The rest follows from that. Nothing here is tappable — the microphone is the input — and a cell
// has three looks rather than a quiz's five: ghosted with its name in guided mode, lit once
// played, and blank until then in from-memory mode.
//
// Board geometry. Tailwind classes have to be static strings, so these numbers live only in the
// classes below and have to move together:
//   open column w-[28px] · fretted columns flex-1 · string row h-[30px] · name gutter w-[16px]

type Marker = 'hit' | 'ghost' | 'next' | 'none';

/**
 * How much detail a cell can carry, from the number of frets on screen.
 *
 * A wide window makes every column narrow, and a note name that no longer fits is worse than one
 * that was never drawn — it clips mid-glyph and reads as a rendering bug. Past thirteen frets the
 * label is dropped and the dot shrinks; the position is still shown, and the counter and the
 * prompt above the board still say what is being looked for.
 */
interface Density {
  dot: string;
  /** Null once the columns are too narrow to letter. */
  label: string | null;
  fret: string;
}

function densityFor(columns: number): Density {
  if (columns <= 8) return { dot: 'h-[26px] w-[26px]', label: 'text-[10px]', fret: 'text-[9px]' };
  if (columns <= 13)
    return { dot: 'h-[21px] w-[21px]', label: 'text-[8.5px]', fret: 'text-[8.5px]' };
  return { dot: 'h-[13px] w-[13px]', label: null, fret: 'text-[8px]' };
}

const MARKER_CLASS: Record<Exclude<Marker, 'none'>, string> = {
  hit: 'bg-accent',
  ghost: 'border border-dashed border-ink-faint',
  next: 'border border-accent-line bg-accent-wash',
};

const MARKER_TEXT_CLASS: Record<Exclude<Marker, 'none'>, string> = {
  hit: 'font-semibold text-on-accent',
  ghost: 'text-ink-faint',
  next: 'text-accent',
};

/** How a marker is announced, after its note name and position. */
const MARKER_STATE: Record<Exclude<Marker, 'none'>, string> = {
  hit: 'played',
  ghost: 'still to find',
  next: 'play this one next',
};

const colClass = (fret: number) => (fret === 0 ? 'w-[28px]' : 'flex-1');

interface Props {
  board: FretWindow;
  targets: readonly FretPosition[];
  /** Indexes into `targets` already found. */
  hits: ReadonlySet<number>;
  mode: ActivityMode;
  /** The one live target of an ordered round. Null when every unhit target is live. */
  nextIndex: number | null;
}

export function ActivityFretboard({ board, targets, hits, mode, nextIndex }: Props) {
  const frets = Array.from(
    { length: board.fretTo - board.fretFrom + 1 },
    (_, offset) => board.fretFrom + offset,
  );
  const rows = Array.from({ length: STRING_COUNT }, (_, row) => row);
  const density = densityFor(frets.length);

  // Wire string numbers land on their row here and nowhere else, which is the only place the
  // 1-based schema and the 0-based board meet.
  const byCell = new Map<string, number>(
    targets.map((target, index) => [`${stringIndexFromWire(target.string)}-${target.fret}`, index]),
  );

  const markerFor = (index: number | undefined): Marker => {
    if (index === undefined) return 'none';
    if (hits.has(index)) return 'hit';
    if (mode === 'hard') return 'none';
    return nextIndex === index ? 'next' : 'ghost';
  };

  return (
    <View className="flex-row px-[18px]">
      <View className="w-[16px] pr-[5px] pt-[7px]">
        {rows.map((row) => (
          <View key={row} className="h-[30px] justify-center">
            <Text className="font-mono text-[9.5px] text-ink-faint">{STRING_LABELS[row]}</Text>
          </View>
        ))}
      </View>

      <View className="flex-1 pt-[7px]">
        {rows.map((row) => (
          <View key={row} className="h-[30px] flex-row">
            {frets.map((fret) => {
              const index = byCell.get(`${row}-${fret}`);
              return (
                <Cell
                  key={fret}
                  fret={fret}
                  first={fret === board.fretFrom}
                  gauge={STRING_GAUGE_CLASS[row]}
                  density={density}
                  marker={markerFor(index)}
                  label={index === undefined ? '' : toAccidentalGlyphs(targetLabel(targets[index]))}
                  position={`string ${wireStringFromIndex(row)}, ${
                    fret === 0 ? 'open' : `fret ${fret}`
                  }`}
                />
              );
            })}
          </View>
        ))}

        <View className="mt-[6px] flex-row">
          {frets.map((fret) => (
            <View key={fret} className={`${colClass(fret)} items-center`}>
              <Inlay fret={fret} />
              <Text
                numberOfLines={1}
                className={`mt-[3px] font-mono ${density.fret} tracking-[0.5px] ${
                  SINGLE_INLAY_FRETS.includes(fret) || fret === DOUBLE_INLAY_FRET
                    ? 'text-ink-muted'
                    : 'text-ink-faint'
                }`}
              >
                {fret}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Cell({
  fret,
  first,
  gauge,
  density,
  marker,
  label,
  position,
}: {
  fret: number;
  /** The leftmost column, which needs an edge of its own when the window starts up the neck. */
  first: boolean;
  gauge: string;
  density: Density;
  marker: Marker;
  label: string;
  position: string;
}) {
  return (
    <View
      // The right border doubles as the fret wire — thick and pale at fret 0, where it is the nut.
      className={`${colClass(fret)} h-full items-center justify-center ${
        fret === 0 ? 'border-r-[3px] border-r-ink-muted' : 'border-r border-r-line-soft'
      } ${first && fret !== 0 ? 'border-l border-l-line-soft' : ''}`}
    >
      <View className="pointer-events-none absolute inset-0 justify-center">
        <View className={`${gauge} bg-ink-faint`} />
      </View>

      {marker === 'none' ? null : (
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={`${label}, ${position}, ${MARKER_STATE[marker]}`}
          className={`${density.dot} items-center justify-center rounded-full ${MARKER_CLASS[marker]}`}
        >
          {density.label ? (
            <Text numberOfLines={1} className={`${density.label} ${MARKER_TEXT_CLASS[marker]}`}>
              {label}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

function Inlay({ fret }: { fret: number }) {
  if (fret === DOUBLE_INLAY_FRET) {
    return (
      <View className="h-[6px] flex-row gap-[3px]">
        <View className="h-[5px] w-[5px] rounded-full bg-line" />
        <View className="h-[5px] w-[5px] rounded-full bg-line" />
      </View>
    );
  }

  return (
    <View className="h-[6px] justify-start">
      {SINGLE_INLAY_FRETS.includes(fret) ? (
        <View className="h-[5px] w-[5px] rounded-full bg-line" />
      ) : null}
    </View>
  );
}
