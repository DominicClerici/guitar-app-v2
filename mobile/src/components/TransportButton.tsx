import { SymbolView } from 'expo-symbols';
import { Pressable } from 'react-native';

import { useToken } from '@/lib/tokens';

interface Props {
  running: boolean;
  /** What is being started or stopped, for the screen reader. */
  what: string;
  /** Nothing to play yet. The key stays where it is and goes cold. */
  disabled?: boolean;
  onPress: () => void;
}

/** The one thing on the screen you press without looking. */
export function TransportButton({ running, what, disabled = false, onPress }: Props) {
  const onAccent = useToken('--on-accent', '#04211f');
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={`${running ? 'Stop' : 'Start'} the ${what}`}
      className={`h-[78px] w-[78px] items-center justify-center rounded-full active:opacity-80 ${
        disabled
          ? 'bg-surface-raised'
          : 'border border-x-transparent border-t-[rgba(255,255,255,0.4)] border-b-[rgba(0,0,0,0.28)] bg-accent'
      }`}
    >
      <SymbolView
        name={running ? 'stop.fill' : 'play.fill'}
        size={27}
        tintColor={disabled ? faint : onAccent}
        // A triangle centred on its bounding box reads as sitting left of centre.
        style={running ? undefined : { marginLeft: 4 }}
      />
    </Pressable>
  );
}
