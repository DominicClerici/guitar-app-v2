import { OTP_LENGTH } from '@guitar/shared';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { Paint } from '@/components/buttonFace';
import { Face } from '@/components/Face';
import { useToken } from '@/lib/tokens';

/**
 * The six boxes a code is typed into.
 *
 * One real `TextInput`, invisible and stretched across all six, with the boxes drawn underneath
 * it. Six separate fields would mean six refs, focus juggling on every keystroke, and a backspace
 * that has to guess which box it belongs to — and iOS will only autofill a code from a message
 * into a single field, which is the whole point of the screen going quickly.
 *
 * The caret is drawn rather than native: a hidden input has no caret to show, and a box that never
 * says where you are reads as broken the moment a digit goes in wrong.
 */

const BOXES = Array.from({ length: OTP_LENGTH }, (_, index) => index);

export function OtpField({
  value,
  onChange,
  onComplete,
  error = false,
  editable = true,
  autoFocus = true,
}: {
  value: string;
  onChange: (code: string) => void;
  /** Fired once the last digit lands, so nobody has to press a button to submit six digits. */
  onComplete: (code: string) => void;
  error?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
}) {
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(autoFocus);
  const accent = useToken('--accent', '#5ec8c2');

  const accept = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(digits);
    if (digits.length === OTP_LENGTH) onComplete(digits);
  };

  return (
    <Pressable
      onPress={() => input.current?.focus()}
      accessibilityLabel={`${OTP_LENGTH}-digit code`}
      accessibilityRole="none"
      className="flex-row gap-[8px]"
    >
      {BOXES.map((index) => {
        const digit = value[index];
        const here = focused && index === Math.min(value.length, OTP_LENGTH - 1);

        const edge: Paint = error
          ? '--rose'
          : here
            ? '--accent-line'
            : digit
              ? '--line'
              : '--line-soft';

        return (
          <View key={index} className="h-[54px] flex-1 items-center justify-center">
            <Face fill="--tray" stroke={edge} radius={12} />
            {digit ? (
              <Text
                className={`text-[22px] font-semibold tracking-[-0.4px] ${
                  error ? 'text-rose' : 'text-ink'
                }`}
              >
                {digit}
              </Text>
            ) : here ? (
              <View className="h-[22px] w-[2px] rounded-full" style={{ backgroundColor: accent }} />
            ) : null}
          </View>
        );
      })}

      {/* Over the whole row rather than beside it, so a tap anywhere lands in the field that is
          actually collecting the code. Transparent instead of hidden: an input that is not laid
          out cannot be focused, and one with no size cannot receive the autofill. */}
      <TextInput
        ref={input}
        value={value}
        onChangeText={accept}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={editable}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={OTP_LENGTH}
        caretHidden
        accessibilityLabel={`${OTP_LENGTH}-digit code`}
        className="absolute inset-0 text-transparent opacity-0"
      />
    </Pressable>
  );
}
