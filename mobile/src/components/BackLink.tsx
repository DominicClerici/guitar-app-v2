import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Text } from 'react-native';

import { useToken } from '@/lib/tokens';

import { Button } from './Button';

/**
 * The way back, in the top-left of every screen that has one: a chevron and the
 * name of where you are.
 *
 * The chevron is muted and the title is not, which is the one thing a plain
 * `Button icon` cannot do — a variant tints its glyph and its label the same
 * colour. So both come in as children and the button contributes the tap
 * target, the press feedback and the semantics.
 *
 * Without a `title` it is the chevron alone, for a header that spends the rest
 * of the row on something else and names where you are outside the button.
 *
 * The negative margin pulls the chevron out to the screen's own padding edge,
 * where the eye expects it; the tap target it would otherwise lose comes back
 * as `hitSlop`.
 */
export function BackLink({ title, onPress }: { title?: string; onPress?: () => void }) {
  const router = useRouter();
  const muted = useToken('--ink-muted', '#9aa0aa');

  return (
    <Button
      variant="ghost"
      size="inline"
      hitSlop={10}
      className={title === undefined ? '-ml-[4px] pr-[4px]' : '-ml-[4px] pr-[8px]'}
      accessibilityLabel="Back"
      onPress={onPress ?? router.back}
    >
      <SymbolView name="chevron.left" size={15} weight="semibold" tintColor={muted} />
      {title === undefined ? null : (
        <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">{title}</Text>
      )}
    </Button>
  );
}
