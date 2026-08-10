import { Text } from 'react-native';

import type { CornerStyle } from './CornerFace';
import { Segmented } from './Segmented';

const CORNERS: { id: CornerStyle; label: string; hint: string }[] = [
  { id: 'circular', label: 'Round', hint: 'Ordinary quarter-circle corners' },
  { id: 'continuous', label: 'Squircle', hint: 'Apple-style continuous corners' },
];

/**
 * A/B: how every rounded face on the screen draws its corners. Same nominal
 * radii either way — only the curve between edge and corner changes. The switch
 * itself is one of the surfaces under test, so it shows its own answer.
 *
 * Rides in a screen's header, above a `CornerStyleProvider` holding the same state.
 */
export function CornerStyleToggle({
  value,
  onChange,
}: {
  value: CornerStyle;
  onChange: (style: CornerStyle) => void;
}) {
  return (
    <Segmented
      segments={CORNERS.map((option) => ({
        id: option.id,
        label: option.hint,
        content: (
          <Text
            className={`text-[11.5px] font-medium tracking-[-0.1px] ${
              option.id === value ? 'text-accent' : 'text-ink-muted'
            }`}
          >
            {option.label}
          </Text>
        ),
      }))}
      value={value}
      onChange={(id) => onChange(id as CornerStyle)}
    />
  );
}
