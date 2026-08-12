import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { useToken } from '@/lib/tokens';

import { Button } from './Button';

interface Props {
  running: boolean;
  /** What is being started or stopped, for the screen reader. */
  what: string;
  /** Nothing to play yet. The key stays where it is and goes cold. */
  disabled?: boolean;
  onPress: () => void;
}

/**
 * The one thing on the screen you press without looking: the `xl` key, rounded
 * all the way to a circle. The glyph is a child rather than `icon` because the
 * play triangle needs nudging off centre and a symbol placed by the button
 * cannot be.
 */
export function TransportButton({ running, what, disabled = false, onPress }: Props) {
  const onAccent = useToken('--on-accent', '#04211f');
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Button
      size="xl"
      square
      radius={999}
      disabled={disabled}
      accessibilityLabel={`${running ? 'Stop' : 'Start'} the ${what}`}
      onPress={onPress}
    >
      {/* A triangle centred on its bounding box reads as sitting left of centre. */}
      <View className={running ? '' : 'ml-[4px]'}>
        <SymbolView
          name={running ? 'stop.fill' : 'play.fill'}
          size={27}
          tintColor={disabled ? faint : onAccent}
        />
      </View>
    </Button>
  );
}
