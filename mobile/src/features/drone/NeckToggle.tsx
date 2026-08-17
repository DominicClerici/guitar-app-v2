import { Button } from '@/components/Button';
import { FretboardGlyph } from '@/components/FretboardGlyph';
import { useTokens } from '@/lib/tokens';

const TINTS = ['--accent', '--ink'] as const;

interface Props {
  /** The neck is open and picking the notes. */
  active: boolean;
  onPress: () => void;
}

/**
 * Opens the neck, or puts it away. It rides the transport row rather than a
 * segmented control at the top of the screen because it is the same kind of
 * thing as the play key — something you reach for while playing — and because a
 * board that slides in from under the thumb reads as one control doing that,
 * rather than as two modes of a screen.
 */
export function NeckToggle({ active, onPress }: Props) {
  const [accent, ink] = useTokens(TINTS);

  return (
    <Button
      variant={active ? 'soft' : 'secondary'}
      size="lg"
      square
      radius={13}
      accessibilityLabel={active ? 'Hide the neck' : 'Pick notes on the neck'}
      onPress={onPress}
    >
      <FretboardGlyph size={23} color={(active ? accent : ink) ?? '#eef0f4'} />
    </Button>
  );
}
