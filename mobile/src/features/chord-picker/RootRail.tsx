import { SelectableChips, type ChipItem } from '@/components/SelectableChip';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { ROOTS, type RootName } from '@/lib/chord-library';

interface Props {
  root: RootName;
  onChange: (root: RootName) => void;
}

/**
 * All seventeen root spellings, chromatic with the enharmonic pairs adjacent.
 * F♯ and G♭ are both here because they are both real answers — the drone sounds
 * the same either way, and the chord it names does not.
 */
export function RootRail({ root, onChange }: Props) {
  const items: ChipItem[] = ROOTS.map((name) => ({
    id: name,
    label: toAccidentalGlyphs(name),
    accessibilityLabel: `Root ${name}`,
    // A spelling sits behind the naturals it lies between, so the chromatic run
    // still reads as a keyboard rather than as seventeen equal keys.
    muted: name.length > 1,
  }));

  return (
    <SelectableChips
      items={items}
      value={root}
      onChange={(id) => onChange(id as RootName)}
      className="px-[18px]"
      chipClassName="min-w-[40px]"
      scroll
    />
  );
}
