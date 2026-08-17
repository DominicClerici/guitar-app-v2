import { SymbolView } from 'expo-symbols';
import { Text } from 'react-native';

import { Button } from '@/components/Button';
import { useToken } from '@/lib/tokens';

/**
 * The way across to the other framing, opposite the chevron that leaves.
 *
 * It points forwards rather than back because it is not an escape from this screen — the two
 * framings are the same screen, and this is a change of what it says it is. The chevron trails the
 * label for that reason: leading one would read as a second way out, in the corner furthest from
 * the one that is.
 *
 * Only the first step has it. Past that an account exists and there is nothing left to choose
 * between, so offering the choice would be offering to start again.
 */
export function ModeLink({ label, onPress }: { label: string; onPress: () => void }) {
  const accent = useToken('--accent', '#5ec8c2');

  return (
    <Button
      variant="link"
      size="inline"
      hitSlop={10}
      className="-mr-[4px]"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <Text className="text-[15px] font-medium tracking-[-0.2px] text-accent">{label}</Text>
      <SymbolView name="chevron.right" size={11} weight="semibold" tintColor={accent} />
    </Button>
  );
}
