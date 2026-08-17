import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Sheet, type SheetRef } from '@/components/Sheet';
import { authClient, describeAuthError } from '@/lib/auth';

import { FormError } from './AuthShell';
import { SheetHeading } from './SheetHeading';

export type SignOutSheetRef = SheetRef;

/**
 * Signing out, asked once.
 *
 * The question is worth asking because the answer is not obvious from the button: what leaves with
 * a session is the local database, and someone who reads "sign out" as "close the app" would find
 * their pathways gone. The blurb says the true thing instead — nothing is lost, because everything
 * is on the account it is being signed out of.
 */
export function SignOutSheet({ ref }: { ref?: Ref<SignOutSheetRef> }) {
  const insets = useSafeAreaInsets();
  const sheet = useRef<SheetRef>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheet.current?.present(),
      dismiss: () => sheet.current?.dismiss(),
    }),
    [],
  );

  const signOut = async () => {
    setFailure(null);
    setPending(true);

    const { error } = await authClient.signOut();

    if (error) {
      setPending(false);
      setFailure(describeAuthError(error));
      return;
    }

    // On success the tab swaps to the pitch under the sheet, so the sheet has to go with it. The
    // pending flag is left set — this sheet is on its way out either way.
    sheet.current?.dismiss();
  };

  return (
    <Sheet ref={sheet} onDismiss={() => setFailure(null)}>
      <View className="gap-[18px] px-[18px] pt-[6px]" style={{ paddingBottom: insets.bottom + 18 }}>
        <SheetHeading
          title="Sign out?"
          blurb="Your progress stays on this account and comes back when you sign in again — here or on another device."
        />

        <FormError message={failure} />

        <View className="gap-[9px]">
          <Button
            variant="destructive"
            size="lg"
            radius={12}
            className="w-full"
            pending={pending}
            onPress={signOut}
          >
            Sign out
          </Button>
          <Button
            variant="quiet"
            size="lg"
            radius={12}
            className="w-full"
            disabled={pending}
            onPress={() => sheet.current?.dismiss()}
          >
            Cancel
          </Button>
        </View>
      </View>
    </Sheet>
  );
}
