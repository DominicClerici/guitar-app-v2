import type { ColorVision } from '@guitar/shared';
import { Text, View } from 'react-native';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { huePalette } from '@/lib/color-vision';
import { STRING_GAUGE_CLASS } from '@/lib/theory';

import { PREVIEW_FRETS, PREVIEW_NOTES } from './colorVision';

// Board geometry. Tailwind classes have to be static strings, so the numbers live only in the
// classes below and have to move together:
//   open column w-[34px] · fretted column w-[52px] · string row h-[30px]
//   board w-[242px] (= 34 + 4 × 52)
// Smaller than the boards you play on, because this one is not played on — it is the size a dot
// has to survive being read at, which is the question the palette is here to answer.

const FRETS = Array.from({ length: PREVIEW_FRETS }, (_, fret) => fret);
const STRINGS = Array.from({ length: STRING_GAUGE_CLASS.length }, (_, string) => string);

const NOTE_AT = new Map(PREVIEW_NOTES.map((note) => [`${note.string}-${note.fret}`, note]));

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
 */
export function ColorVisionPreview({ mode }: { mode: ColorVision }) {
  const palette = huePalette(mode);

  return (
    <View className="w-[242px] self-center">
      {STRINGS.map((string) => (
        <View key={string} className="h-[30px] flex-row">
          {/* Under the dots, so a note reads as stopping the string rather than sitting beside it. */}
          <View className="pointer-events-none absolute inset-0 justify-center">
            <View className={`${STRING_GAUGE_CLASS[string]} bg-ink-faint`} />
          </View>

          {FRETS.map((fret) => {
            const note = NOTE_AT.get(`${string}-${fret}`);

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
