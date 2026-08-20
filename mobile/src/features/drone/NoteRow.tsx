import { Text, View } from 'react-native';

import { Face } from '@/components/Face';
import { toAccidentalGlyphs } from '@/lib/accidentals';

import type { DroneSelection } from './useDrone';

interface Props {
  selection: DroneSelection;
  /** What to say instead of the notes when nothing has been placed. */
  hint: string;
}

/**
 * The notes the board is holding, bottom string up, sitting between the neck and
 * everything that sets the sound. They belong to the neck rather than to the
 * readout above — a chord picked from the catalogue already spells itself in its
 * own name, and repeating it under the title only said the same thing twice.
 */
export function NoteRow({ selection, hint }: Props) {
  return (
    <View className="h-[24px] flex-1 flex-row items-center gap-[5px]">
      {selection.notes.length > 0 ? (
        selection.notes.map((note, index) => (
          <NoteChip key={`${note}-${index}`} note={note} isRoot={index === selection.rootIndex} />
        ))
      ) : (
        <Text className="font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
          {hint}
        </Text>
      )}
    </View>
  );
}

function NoteChip({ note, isRoot }: { note: string; isRoot: boolean }) {
  return (
    <View className="h-[24px] justify-center px-[8px]">
      <Face name={isRoot ? 'accent' : 'card'} radius={7} />
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
