import { Pressable, Text, View } from 'react-native';

import { FadingHScroll } from '@/components/FadingHScroll';
import type { FretPosition } from '@/lib/content';

// A read/write neck for a `fretboard` question.
//
// The chord detector's `Fretboard` is the app's other one and was the first candidate, but it
// cannot answer a quiz question: it is pinned to a 15-fret neck at a hard-coded pixel width, and
// every cell is labelled with the note sounding there — which hands the learner the answer to
// exactly the questions this kind exists to ask. Its string indices also run 0 = high e, where the
// quiz schema counts from 1. So this is a second, smaller board rather than a reuse: no labels,
// a fret count the question chooses, and 1-based strings.
//
// Board geometry. Tailwind classes have to be static strings, so these numbers live only in the
// classes below and have to move together:
//   open column w-[36px] · fretted column w-[46px] · string row h-[30px]

/** Beyond this the board stops being a board. Content asking for more is drawn to here. */
const MAX_FRETS = 22;

const STRING_COUNT = 6;

/** Top row down. String 1 is the high E, as everywhere in the quiz schema. */
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'] as const;
const STRING_LINE = ['h-px', 'h-px', 'h-[1.25px]', 'h-[1.5px]', 'h-[1.75px]', 'h-[2px]'] as const;

const SINGLE_INLAYS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_INLAY = 12;

const colClass = (fret: number) => (fret === 0 ? 'w-[36px]' : 'w-[46px]');

const key = (position: FretPosition) => `${position.string}-${position.fret}`;

interface Props {
  /** How many frets past the nut the question's board shows. */
  frets: number;
  selected: readonly FretPosition[];
  onToggle: (position: FretPosition) => void;
  /** After the check the board stops taking taps and starts showing the answer. */
  checked: boolean;
  answer: readonly FretPosition[];
}

export function QuizFretboard({ frets, selected, onToggle, checked, answer }: Props) {
  const columns = Array.from({ length: Math.min(Math.max(frets, 1), MAX_FRETS) + 1 }, (_, f) => f);
  const strings = Array.from({ length: STRING_COUNT }, (_, s) => s);

  const picked = new Set(selected.map(key));
  const wanted = new Set(answer.map(key));

  return (
    <View className="mt-[16px] flex-row">
      {/* Outside the scroller so the string it names stays readable however far up the neck
          the learner has scrolled. `pt-[8px]` matches the scroller's own content padding. */}
      <View className="pl-[18px] pr-[6px] pt-[8px]">
        {strings.map((row) => (
          <View key={row} className="h-[30px] justify-center">
            <Text className="font-mono text-[9.5px] text-ink-faint">{STRING_NAMES[row]}</Text>
          </View>
        ))}
      </View>

      <View className="flex-1">
        <FadingHScroll contentClassName="pr-[18px] py-[8px]">
          <View>
            {strings.map((row) => {
              const string = row + 1;

              return (
                <View key={string} className="h-[30px] flex-row">
                  {columns.map((fret) => (
                    <Cell
                      key={fret}
                      fret={fret}
                      line={STRING_LINE[row]}
                      state={cellState(key({ string, fret }), picked, wanted, checked)}
                      onPress={() => onToggle({ string, fret })}
                      disabled={checked}
                      label={`String ${string}, ${fret === 0 ? 'open' : `fret ${fret}`}`}
                    />
                  ))}
                </View>
              );
            })}

            <View className="mt-[6px] flex-row">
              {columns.map((fret) => (
                <View key={fret} className={`${colClass(fret)} items-center`}>
                  <Inlay fret={fret} />
                  <Text
                    className={`mt-[3px] font-mono text-[9px] tracking-[0.5px] ${
                      SINGLE_INLAYS.has(fret) || fret === DOUBLE_INLAY
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
        </FadingHScroll>
      </View>
    </View>
  );
}

/**
 * `missed` is the one worth spelling out: a position the answer wanted and the learner did not
 * place. Without it a wrong answer only says which taps were bad, never which were absent.
 */
type CellState = 'empty' | 'picked' | 'right' | 'wrong' | 'missed';

function cellState(
  id: string,
  picked: ReadonlySet<string>,
  wanted: ReadonlySet<string>,
  checked: boolean,
): CellState {
  if (!checked) return picked.has(id) ? 'picked' : 'empty';
  if (picked.has(id)) return wanted.has(id) ? 'right' : 'wrong';
  return wanted.has(id) ? 'missed' : 'empty';
}

function Cell({
  fret,
  line,
  state,
  onPress,
  disabled,
  label,
}: {
  fret: number;
  line: string;
  state: CellState;
  onPress: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        selected: state === 'picked' || state === 'right' || state === 'wrong',
      }}
      // The right border doubles as the fret wire — thick and pale at fret 0, where it is the nut.
      className={`${colClass(fret)} h-full items-center justify-center ${
        fret === 0 ? 'border-r-[3px] border-r-ink-muted' : 'border-r border-r-line-soft'
      }`}
    >
      <View className="pointer-events-none absolute inset-0 justify-center">
        <View className={`${line} bg-ink-faint`} />
      </View>
      <Marker state={state} />
    </Pressable>
  );
}

function Marker({ state }: { state: CellState }) {
  switch (state) {
    case 'empty':
      return null;
    case 'picked':
      return (
        <View className="h-[20px] w-[20px] rounded-full border border-accent bg-accent-wash" />
      );
    case 'right':
      return <View className="h-[20px] w-[20px] rounded-full bg-accent" />;
    case 'wrong':
      return <View className="h-[20px] w-[20px] rounded-full border border-rose bg-rose-wash" />;
    case 'missed':
      // Hollow and dashed: somewhere the answer wanted a note and none was placed.
      return (
        <View className="h-[20px] w-[20px] rounded-full border border-dashed border-accent-line" />
      );
  }
}

function Inlay({ fret }: { fret: number }) {
  if (fret === DOUBLE_INLAY) {
    return (
      <View className="h-[6px] flex-row gap-[3px]">
        <View className="h-[5px] w-[5px] rounded-full bg-line" />
        <View className="h-[5px] w-[5px] rounded-full bg-line" />
      </View>
    );
  }

  return (
    <View className="h-[6px] justify-start">
      {SINGLE_INLAYS.has(fret) ? <View className="h-[5px] w-[5px] rounded-full bg-line" /> : null}
    </View>
  );
}
