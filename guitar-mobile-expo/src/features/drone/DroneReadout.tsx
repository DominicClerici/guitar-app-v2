import { Text, View } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { useFace } from '@/components/CornerFace';
import { toAccidentalGlyphs } from '@/lib/accidentals';

import type { DroneSelection } from './useDrone';

/** One half of a breath. Slow enough to be felt rather than watched. */
const BREATH_MS = 2800;
const EASE = { duration: BREATH_MS, easing: Easing.inOut(Easing.quad) };

interface Props {
  selection: DroneSelection;
  running: boolean;
  /** Mono caption fields, shown after the status. */
  detail: string[];
  /** What to say instead of the notes when nothing is selected. */
  hint: string;
}

/**
 * What is being held, and whether it is being held. The aura behind it breathes
 * at the rate the pad does, so the screen says the drone is running from across
 * a room — nothing else on the page has to move.
 */
export function DroneReadout({ selection, running, detail, hint }: Props) {
  const has = selection.notes.length > 0;

  const aura = useAnimatedStyle(
    () => ({
      opacity: running
        ? withSequence(
            withTiming(0.45, { duration: 700 }),
            withRepeat(withTiming(1, EASE), -1, true),
          )
        : withTiming(0, { duration: 700 }),
      transform: [
        {
          scale: running
            ? withSequence(
                withTiming(0.95, { duration: 700 }),
                withRepeat(withTiming(1.14, EASE), -1, true),
              )
            : withTiming(0.9, { duration: 700 }),
        },
      ],
    }),
    [running],
  );

  return (
    <View className="items-center justify-center py-[6px]">
      <View className="pointer-events-none absolute inset-0 items-center justify-center">
        <AnimatedView
          className="h-[168px] w-[168px] rounded-full bg-accent-wash"
          style={aura}
        />
      </View>

      <Text
        className={`text-[42px] font-semibold leading-[48px] tracking-[-1.2px] ${
          has ? 'text-ink' : 'text-ink-faint'
        }`}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {toAccidentalGlyphs(selection.title)}
      </Text>

      <View className="mt-[10px] h-[24px] flex-row items-center gap-[5px]">
        {has ? (
          selection.notes.map((note, index) => (
            <NoteChip
              key={`${note}-${index}`}
              note={note}
              isRoot={index === selection.rootIndex}
            />
          ))
        ) : (
          <Text className="font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
            {hint}
          </Text>
        )}
      </View>

      <Text className="mt-[9px] font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
        <Text className={running ? 'text-accent' : undefined}>
          {running ? 'Sounding' : 'Silent'}
        </Text>
        {detail.map((field) => ` · ${field}`).join('')}
      </Text>
    </View>
  );
}

function NoteChip({ note, isRoot }: { note: string; isRoot: boolean }) {
  const face = useFace(isRoot ? 'accent' : 'quiet', 7);

  return (
    <View className={`h-[24px] justify-center rounded-[7px] px-[8px] ${face.className}`}>
      {face.paint}
      <Text
        className={`font-mono text-[11px] tracking-[0.5px] ${
          isRoot ? 'text-accent' : 'text-ink-muted'
        }`}
      >
        {toAccidentalGlyphs(note)}
      </Text>
    </View>
  );
}
