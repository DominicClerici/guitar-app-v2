import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useToken } from '@/lib/tokens';

import { useFace } from './CornerFace';

type Variant = 'primary' | 'quiet' | 'destructive';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  pending?: boolean;
  disabled?: boolean;
}

const TEXT: Record<Variant, string> = {
  primary: 'text-accent',
  quiet: 'text-ink-muted',
  destructive: 'text-rose',
};

/**
 * Full-width submit. While pending it keeps its label and adds a spinner beside it, so the button
 * does not change width mid-press and the user can still read what they asked for.
 */
export function AuthButton({
  label,
  onPress,
  variant = 'primary',
  pending = false,
  disabled = false,
}: Props) {
  const face = useFace(variant === 'primary' ? 'accent' : 'key', 11);
  const spinner = useToken(variant === 'primary' ? '--accent' : '--ink-muted', '#5ec8c2');
  const inert = disabled || pending;

  return (
    <Pressable
      onPress={onPress}
      disabled={inert}
      accessibilityRole="button"
      accessibilityState={{ disabled: inert, busy: pending }}
      accessibilityLabel={label}
      className={`h-[46px] flex-row items-center justify-center gap-[8px] rounded-[11px] active:opacity-70 ${
        inert ? 'opacity-45' : ''
      } ${face.className}`}
    >
      {face.paint}
      <Text className={`text-[15px] font-medium tracking-[-0.2px] ${TEXT[variant]}`}>{label}</Text>
      {pending ? (
        <View className="absolute right-[16px]">
          <ActivityIndicator size="small" color={spinner} />
        </View>
      ) : null}
    </Pressable>
  );
}
