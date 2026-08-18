import type { ColorVision } from '@guitar/shared';
import { Text, View } from 'react-native';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useUniwind } from 'uniwind';

import { AnimatedView } from '@/components/AnimatedView';
import { huePalette } from '@/lib/color-vision';
import { useAccidentalSide, useTuning } from '@/lib/preferences';
import { STRING_GAUGE_CLASS } from '@/lib/theory';
import { TUNING_FALLBACK } from '@/lib/tuning';

import { PREVIEW_FRETS, previewNotes } from './colorVision';

// Board geometry. Tailwind classes have to be static strings, so the numbers live only in the
// classes below and have to move together:
//   open column w-[34px] · fretted column w-[52px] · string row h-[30px]
//   board w-[242px] (= 34 + 4 × 52)
// Smaller than the boards you play on, because this one is not played on — it is the size a dot
// has to survive being read at, which is the question the palette is here to answer.

const FRETS = Array.from({ length: PREVIEW_FRETS }, (_, fret) => fret);
const STRINGS = Array.from({ length: STRING_GAUGE_CLASS.length }, (_, string) => string);

/** Long enough to be seen as a change from the last palette, short enough not to be a wait. */
const SWAP = { duration: 220 };

const colClass = (fret: number) => (fret === 0 ? 'w-[34px]' : 'w-[52px]');

/**
 * A fingering on a neck, drawn in the palette a mode would give it.
 *
 * The sheet's whole argument is here rather than in the words above it: four hues at the size the
 * app actually uses them, on the background it uses them on, with the note names printed over the
 * top. A row of swatches would flatter every palette equally.
 *
 * The colours cross-fade rather than cut, so a chip pressed while you are looking at the board
 * shows you the two palettes as a difference — which is the comparison being made — instead of
 * replacing one picture with another and leaving you to remember the first.
 *
 * Drawn in the palette of the theme that is actually on, since each theme has its own four sets.
 * `useUniwind` resolves `system` down to the appearance in force rather than the stored word, and
 * re-renders this when the phone crosses over — so the board is never showing a set of colours
 * against a background they are not the set for.
 */
export function ColorVisionPreview({ mode }: { mode: ColorVision }) {
  const { theme } = useUniwind();
  const palette = huePalette(mode, theme);
  // The dots stay where they are; what they are called follows the user's own strings. The
  // spelling falls to flats where nothing settles it, for the reason a tuning does: a slackened
  // string is E flat and never D sharp. `previewNotes` memoises on the pair.
  const notes = previewNotes(useTuning(), useAccidentalSide(TUNING_FALLBACK));
  const noteAt = new Map(notes.map((note) => [`${note.string}-${note.fret}`, note]));

  return (
    <View className="w-[242px] self-center">
      {STRINGS.map((string) => (
        <View key={string} className="h-[30px] flex-row">
          {/* Under the dots, so a note reads as stopping the string rather than sitting beside it. */}
          <View className="pointer-events-none absolute inset-0 justify-center">
            <View className={`${STRING_GAUGE_CLASS[string]} bg-ink-faint`} />
          </View>

          {FRETS.map((fret) => {
            const note = noteAt.get(`${string}-${fret}`);

            return (
              <View
                key={fret}
                className={`${colClass(fret)} h-full items-center justify-center ${
                  // The nut: the same wire, thick and pale, the way every board here draws it.
                  fret === 0 ? 'border-r-[3px] border-r-ink-muted' : 'border-r border-r-line-soft'
                }`}
              >
                {note ? (
                  <Dot label={note.label} color={note.role && palette[note.role]} />
                ) : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function Dot({ label, color }: { label: string; color: string | null }) {
  if (color === null) return <PlainDot label={label} />;

  return <HueDot label={label} color={color} />;
}

/** A note the palette has nothing to say about: present, outlined, and out of the comparison. */
function PlainDot({ label }: { label: string }) {
  return (
    <View className="h-[22px] w-[22px] items-center justify-center rounded-full border border-line bg-surface-raised">
      <Text className="text-[9.5px] font-bold text-ink-muted">{label}</Text>
    </View>
  );
}

/**
 * A coded note, filled rather than outlined.
 *
 * The app outlines its lesser tones and fills only the root, but an outline is a hairline's worth
 * of colour — too little of it to judge a palette by. Filling every coded dot is the preview
 * overstating its case in one direction only: hues that stay apart here are not guaranteed to at
 * hairline weight, and hues that merge here merge everywhere.
 */
function HueDot({ label, color }: { label: string; color: string }) {
  const face = useAnimatedStyle(() => ({ backgroundColor: withTiming(color, SWAP) }));

  return (
    <AnimatedView
      className="h-[22px] w-[22px] items-center justify-center rounded-full"
      style={face}
    >
      <Text className="text-[9.5px] font-bold text-bg">{label}</Text>
    </AnimatedView>
  );
}
