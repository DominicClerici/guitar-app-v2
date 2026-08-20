import { useState, type Ref } from 'react';
import { Text, TextInput, View } from 'react-native';

import type { Paint } from '@/components/buttonFace';
import { Face } from '@/components/Face';
import { useToken } from '@/lib/tokens';

import { formatNational, nationalDigits, sanitizeDialCode } from './phone';

/**
 * The one field the account step collects, in whichever of its two forms is showing.
 *
 * The two are one component because they are one field: the switcher above them changes what is
 * being asked for, not which control is asking. Keeping them apart would mean two focus states,
 * two hairlines and two error slots to keep in step for no gain.
 */

export type Channel = 'email' | 'phone';

interface Props {
  channel: Channel;
  /** An address, or the national part of a number — the dial code is held separately. */
  value: string;
  onChangeValue: (value: string) => void;
  dialCode: string;
  onChangeDialCode: (dialCode: string) => void;
  error?: string;
  editable?: boolean;
  onSubmit?: () => void;
  ref?: Ref<TextInput>;
}

export function ContactField({
  channel,
  value,
  onChangeValue,
  dialCode,
  onChangeDialCode,
  error,
  editable = true,
  onSubmit,
  ref,
}: Props) {
  const [focused, setFocused] = useState(false);
  const faint = useToken('--ink-faint', '#62666e');
  const accent = useToken('--accent', '#5ec8c2');

  const hairline: Paint = error ? '--rose' : focused ? '--accent-line' : '--line-soft';
  const phone = channel === 'phone';

  return (
    <View>
      <View className="flex-row items-center">
        <Face fill="--tray" stroke={hairline} radius={12} />
        {phone ? (
          <>
            {/* Sized to its content rather than given a share of the row: a `+1` and a `+358`
                are different widths, and a fixed box would leave one of them adrift. */}
            <TextInput
              value={dialCode}
              onChangeText={(raw) => onChangeDialCode(sanitizeDialCode(raw))}
              editable={editable}
              keyboardType="phone-pad"
              maxLength={4}
              selectionColor={accent}
              accessibilityLabel="Country code"
              className="h-[52px] min-w-[46px] pl-[14px] text-center text-[16px] tracking-[-0.2px] text-ink-muted"
            />
            <View className="h-[24px] w-px bg-line-soft" />
          </>
        ) : null}

        <TextInput
          ref={ref}
          // Formatted on the way out and stripped on the way back in, so the state stays digits
          // and the grouping can never be typed into or deleted a bracket at a time.
          value={phone ? formatNational(dialCode, value) : value}
          onChangeText={(raw) => onChangeValue(phone ? nationalDigits(raw) : raw)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmit}
          editable={editable}
          placeholder={phone ? '(555) 123-4567' : 'you@example.com'}
          placeholderTextColor={faint}
          selectionColor={accent}
          keyboardType={phone ? 'phone-pad' : 'email-address'}
          textContentType={phone ? 'telephoneNumber' : 'emailAddress'}
          autoComplete={phone ? 'tel' : 'email'}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          accessibilityLabel={phone ? 'Phone number' : 'Email address'}
          className={`h-[52px] flex-1 text-[16px] tracking-[-0.2px] text-ink ${
            phone ? 'px-[10px]' : 'px-[14px]'
          }`}
        />
      </View>

      {error ? <Text className="mt-[8px] text-[12.5px] text-rose">{error}</Text> : null}
    </View>
  );
}
