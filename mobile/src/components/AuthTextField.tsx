import { useState, type Ref } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useToken } from '@/lib/tokens';

interface Props extends Omit<TextInputProps, 'className' | 'style' | 'secureTextEntry'> {
  label: string;
  /** Shown under the field in rose, and reddens the hairline. */
  error?: string;
  /** Renders the value masked, with a control to reveal it. */
  secure?: boolean;
  ref?: Ref<TextInput>;
}

/** A labelled field on the Aurora tray face: hairline goes accent on focus, rose on error. */
export function AuthTextField({ label, error, secure = false, ref, ...input }: Props) {
  const faint = useToken('--ink-faint', '#62666e');
  const accent = useToken('--accent', '#5ec8c2');
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const hairline = error ? 'border-rose' : focused ? 'border-accent-line' : 'border-line-soft';

  return (
    <View>
      <Text className="mb-[7px] font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
        {label}
      </Text>

      <View className={`flex-row items-center rounded-[10px] border bg-tray px-[12px] ${hairline}`}>
        <TextInput
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
