import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { PillSelector } from '@/components/PillSelector';
import { canUseApple, canUseGoogle } from '@/lib/auth';

import { ContactField, type Channel } from './ContactField';
import { GoogleMark } from './GoogleMark';

/**
 * Step one: how someone wants to be reached, and the address or number to reach them at.
 *
 * All four ways in are equal here — none of them is a "sign up" as opposed to a "sign in". A code
 * or a provider token proves who someone is; whether an account already existed is the server's
 * business, and what the flow does next is decided by what the resulting account is missing rather
 * than by which button was pressed.
 */

const CHANNELS = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
];

interface Props {
  channel: Channel;
  onChangeChannel: (channel: Channel) => void;
  value: string;
  onChangeValue: (value: string) => void;
  dialCode: string;
  onChangeDialCode: (dialCode: string) => void;
  /** Whether there is enough in the field to be worth a round trip. */
  ready: boolean;
  error: string | null;
  /** Which request is in flight, so only the control that started it shows it. */
  busy: 'contact' | 'google' | 'apple' | null;
  onSubmit: () => void;
  onGoogle: () => void;
  onApple: () => void;
}

export function AccountStep({
  channel,
  onChangeChannel,
  value,
  onChangeValue,
  dialCode,
  onChangeDialCode,
  ready,
  error,
  busy,
  onSubmit,
  onGoogle,
  onApple,
}: Props) {
  const working = busy !== null;
  const providers = canUseGoogle || canUseApple;

  return (
    <View>
      <Text className="text-[28px] leading-[32px] font-semibold tracking-[-0.7px] text-ink">
        Create your account
      </Text>
      <Text className="mt-[8px] text-[14px] leading-[20px] text-ink-muted">
        We’ll send you a code to confirm it’s you. No password to remember.
      </Text>

      <PillSelector
        options={CHANNELS}
        value={channel}
        onChange={(id) => onChangeChannel(id as Channel)}
        label="Contact method"
        className="mt-[22px] w-[168px]"
      />

      <View className="mt-[12px] gap-[14px]">
        <ContactField
          channel={channel}
          value={value}
          onChangeValue={onChangeValue}
          dialCode={dialCode}
          onChangeDialCode={onChangeDialCode}
          // A failure that belongs to the field is shown under it. There is no separate form-wide
          // error slot on this step: everything that can go wrong here is about what was typed or
          // about reaching the server, and both read as a comment on the one field.
          error={error ?? undefined}
          editable={!working}
          onSubmit={ready ? onSubmit : undefined}
        />

        <Button
          variant="primary"
          size="lg"
          radius={13}
          className="w-full"
          disabled={!ready}
          pending={busy === 'contact'}
          onPress={onSubmit}
        >
          Continue
        </Button>
      </View>

      {providers ? (
        <>
          <View className="mt-[26px] flex-row items-center gap-[12px]">
            <View className="h-px flex-1 bg-line-soft" />
            <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
              Or
            </Text>
            <View className="h-px flex-1 bg-line-soft" />
          </View>

          <View className="mt-[16px] gap-[10px]">
            {canUseApple ? (
              <Button
                variant="secondary"
                size="lg"
                radius={13}
                icon="apple.logo"
                className="w-full"
                disabled={working && busy !== 'apple'}
                pending={busy === 'apple'}
                onPress={onApple}
              >
                Continue with Apple
              </Button>
            ) : null}

            {canUseGoogle ? (
              <Button
                variant="secondary"
                size="lg"
                radius={13}
                className="w-full gap-[8px]"
                accessibilityLabel="Continue with Google"
                disabled={working && busy !== 'google'}
                pending={busy === 'google'}
                onPress={onGoogle}
              >
                <GoogleMark size={17} />
                <Text className="text-[16px] font-medium tracking-[-0.3px] text-ink">
                  Continue with Google
                </Text>
              </Button>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
}
