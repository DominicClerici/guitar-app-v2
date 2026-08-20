import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useState, type Ref } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useToken } from '@/lib/tokens';

import type { Paint } from './buttonFace';
import { Face } from './Face';

interface Props extends Omit<TextInputProps, 'className' | 'style' | 'secureTextEntry'> {
  label: string;
  /** Shown under the field in rose, and reddens the hairline. */
  error?: string;
  /** Renders the value masked, with a control to reveal it. */
  secure?: boolean;
  /**
   * Swaps in the sheet library's own input. A bottom sheet only lifts clear of the keyboard for
   * fields it is told about, and a plain `TextInput` inside one is left underneath it.
   */
  sheet?: boolean;
  ref?: Ref<TextInput>;
}

/** A labelled field on the Aurora tray face: hairline goes accent on focus, rose on error. */
export function AuthTextField({
  label,
  error,
  secure = false,
  sheet = false,
  ref,
  ...input
}: Props) {
  const faint = useToken('--ink-faint', '#62666e');
  const accent = useToken('--accent', '#5ec8c2');
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const hairline: Paint = error ? '--rose' : focused ? '--accent-line' : '--line-soft';
  // Fixed for the life of a field — nothing moves in or out of a sheet — so this never remounts.
  // The cast is a declaration mismatch only: the sheet's input is a `TextInput` that has told the
  // sheet about itself, but it declares its own ref as possibly `undefined`, which no `TextInput`
  // ref ever is. The runtime instance handed back is the same one either way.
  const Input: typeof TextInput = sheet
    ? (BottomSheetTextInput as unknown as typeof TextInput)
    : TextInput;

  return (
    <View>
      <Text className="mb-[7px] font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
        {label}
      </Text>

      <View className="flex-row items-center px-[12px]">
        <Face fill="--tray" stroke={hairline} radius={10} />
        <Input
          ref={ref}
          {...input}
          secureTextEntry={secure && !revealed}
          onFocus={(event) => {
            setFocused(true);
            input.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            input.onBlur?.(event);
          }}
          placeholderTextColor={faint}
          selectionColor={accent}
          accessibilityLabel={label}
          className="h-[44px] flex-1 text-[15px] tracking-[-0.2px] text-ink"
        />

        {secure ? (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? `Hide ${label}` : `Show ${label}`}
            hitSlop={8}
            className="pl-[10px] active:opacity-60"
          >
            <Text className="font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
              {revealed ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {error ? <Text className="mt-[6px] text-[12px] text-rose">{error}</Text> : null}
    </View>
  );
}
