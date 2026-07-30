import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';

import { useToken } from '@/lib/tokens';

import { useFace } from './CornerFace';

type Symbol = ComponentProps<typeof SymbolView>['name'];

interface Props {
  symbol: Symbol;
  label: string;
  disabled?: boolean;
  /** Lit, for a control that toggles a mode the screen is currently in. */
  on?: boolean;
  destructive?: boolean;
  onPress: () => void;
}

/** Square counterpart to a primary CTA — a raised key carrying only its glyph. */
export function IconAction({
  symbol,
  label,
  disabled = false,
  on = false,
  destructive,
  onPress,
}: Props) {
  const ink = useToken('--ink', '#eef0f4');
  const faint = useToken('--ink-faint', '#62666e');
  const accent = useToken('--accent', '#5ec8c2');
  const rose = useToken('--rose', '#e0788f');
  const face = useFace(on ? 'accent' : 'key', 10);

  const tint = disabled ? faint : on ? accent : destructive ? rose : ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: on }}
      accessibilityLabel={label}
      className={`h-[50px] w-[50px] items-center justify-center rounded-[10px] active:opacity-70 ${face.className}`}
    >
      {face.paint}
      <SymbolView name={symbol} size={17} weight="semibold" tintColor={tint} />
    </Pressable>
  );
}
