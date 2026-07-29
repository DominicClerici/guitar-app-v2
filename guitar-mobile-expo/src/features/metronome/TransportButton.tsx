import { SymbolView } from 'expo-symbols';
import { Pressable } from 'react-native';

import { useToken } from '@/lib/tokens';

/** The one thing on the screen you press without looking. */
export function TransportButton({ running, onPress }: { running: boolean; onPress: () => void }) {
  const onAccent = useToken('--on-accent', '#04211f');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={running ? 'Stop the metronome' : 'Start the metronome'}
      className="h-[78px] w-[78px] items-center justify-center rounded-full border border-x-transparent border-t-[rgba(255,255,255,0.4)] border-b-[rgba(0,0,0,0.28)] bg-accent active:opacity-80"
    >
      <SymbolView
        name={running ? 'stop.fill' : 'play.fill'}
        size={27}
        tintColor={onAccent}
        // A triangle centred on its bounding box reads as sitting left of centre.
        style={running ? undefined : { marginLeft: 4 }}
      />
    </Pressable>
  );
}
