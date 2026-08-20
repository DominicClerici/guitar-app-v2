import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { Face } from '@/components/Face';
import { useToken } from '@/lib/tokens';

import type { Direction } from './intonationMath';

interface Props {
  direction: Direction;
}

/**
 * A string seen from the side: nut on the left, saddle on the right, and the
 * direction the saddle travels. "Toward the neck" and "away from the neck" are
 * only unambiguous once you can see which end is which.
 */
export function SaddleDiagram({ direction }: Props) {
  const accent = useToken('--accent', '#5ec8c2');
  const faint = useToken('--ink-faint', '#62666e');

  const moving = direction !== 'none';
  const toward = direction === 'toward';
  const tint = moving ? accent : faint;

  return (
    <View className="px-[16px] py-[14px]">
      <Face name="tray" radius={12} />
      <View className="flex-row items-center">
        <View className="items-center">
          <View className="h-[26px] w-[3px] rounded-full bg-ink-faint" />
          <Text className="mt-[6px] font-mono text-[8.5px] uppercase tracking-[1px] text-ink-faint">
            Nut
          </Text>
        </View>

        {/* The string itself, with the 12th fret marked at its midpoint — the
            reference the whole measurement is built on. */}
        <View className="mb-[16px] flex-1">
          <View className="h-px w-full bg-line" />
          <View className="absolute left-1/2 -ml-[0.5px] h-[10px] w-px -translate-y-[5px] bg-line" />
        </View>

        <View className="mb-[16px] w-[40px] flex-row items-center justify-center gap-[2px]">
          {moving ? (
            <>
              {toward ? (
                <SymbolView name="chevron.left" size={10} weight="bold" tintColor={tint} />
              ) : null}
              <View className="h-[14px] w-[6px] rounded-[2px] bg-accent" />
              {toward ? null : (
                <SymbolView name="chevron.right" size={10} weight="bold" tintColor={tint} />
              )}
            </>
          ) : (
            <View className="h-[14px] w-[6px] rounded-[2px] bg-ink-faint" />
          )}
        </View>

        <View className="items-center">
          <View className="h-[26px] w-[3px] rounded-full bg-ink-faint" />
          <Text className="mt-[6px] font-mono text-[8.5px] uppercase tracking-[1px] text-ink-faint">
            Bridge
          </Text>
        </View>
      </View>

      <Text
        className={`mt-[2px] text-center font-mono text-[9.5px] uppercase tracking-[1.5px] ${
          moving ? 'text-accent' : 'text-ink-faint'
        }`}
      >
        {direction === 'none'
          ? 'Saddle stays put'
          : toward
            ? 'Saddle moves toward the neck'
            : 'Saddle moves away from the neck'}
      </Text>
    </View>
  );
}
