import { email as emailSchema } from '@guitar/shared';
import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthTextField } from '@/components/AuthTextField';
import { Button } from '@/components/Button';
import { Sheet, type SheetRef } from '@/components/Sheet';

import { SheetHeading } from './SheetHeading';

export type ChangeEmailSheetRef = SheetRef;

interface Props {
  ref?: Ref<ChangeEmailSheetRef>;
  /** Shown as what is being moved away from, so the change is legible before it is typed. */
  current: string;
}

/**
 * The address on the account, changed.
 *
 * Inert by request: the server side of this does not exist yet, so the submit does nothing. What is
 * real is the shape check — the field rejects an address the server would reject anyway, which is
 * the half of this that is worth having in place before the other half arrives.
 */
export function ChangeEmailSheet({ ref, current }: Props) {
  const insets = useSafeAreaInsets();
  const sheet = useRef<SheetRef>(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheet.current?.present(),
      dismiss: () => sheet.current?.dismiss(),
    }),
    [],
  );

  const reset = () => {
    setAddress('');
    setError(null);
  };

  const submit = () => {
    const parsed = emailSchema.safeParse(address);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'That does not look like an email address');
      return;
    }

    if (parsed.data === current.toLowerCase()) {
      setError('That is already the address on this account');
      return;
    }

    setError(null);
    // Nothing to send it to yet. The check above is the whole of what this button does today.
  };

  return (
    <Sheet ref={sheet} onDismiss={reset}>
      <View className="gap-[18px] px-[18px] pt-[6px]" style={{ paddingBottom: insets.bottom + 18 }}>
        <SheetHeading
          title="Change email"
          blurb={`Signed in as ${current}. We’ll send a confirmation link to the new address, and it stays the old one until you follow it.`}
        />

        <AuthTextField
          sheet
          label="New email"
          value={address}
          onChangeText={setAddress}
          error={error ?? undefined}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="go"
          onSubmitEditing={submit}
        />

        <Button variant="soft" size="md" radius={11} className="w-full" onPress={submit}>
          Send confirmation
        </Button>
      </View>
    </Sheet>
  );
}
