import { PillSelector, type PillOption } from '@/components/PillSelector';

export type LabelMode = 'notes' | 'degrees';

const MODES: PillOption[] = [
  { id: 'notes', label: 'Notes', name: 'Note names' },
  { id: 'degrees', label: 'Degrees', name: 'Scale degrees' },
];

/**
 * What the dots on the neck say. Notes name the pitches; degrees name their jobs
 * in whichever reading is lit, which is what turns a shape you can play into a
 * shape you can move.
 *
 * The two readings are a thing you sweep between to see the same board twice, so
 * it carries the pill you can drag rather than a pair of keys you tap.
 */
export function LabelModeToggle({
  mode,
  onChange,
}: {
  mode: LabelMode;
  onChange: (mode: LabelMode) => void;
}) {
  return (
    <PillSelector
      options={MODES}
      value={mode}
      onChange={(id) => onChange(id as LabelMode)}
      label="Neck labels"
      className="flex-1"
    />
  );
}
