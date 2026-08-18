import { useImperativeHandle, useRef, type Ref } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Sheet, type SheetRef } from '@/components/Sheet';

import { SheetHeading } from './SheetHeading';
import { leaveAccount } from './leaveAccount';

export type SignOutSheetRef = SheetRef;

/**
 * Signing out, asked once.
 *
 * The question is worth asking because the answer is not obvious from the button: what leaves with
 * a session is the local database, and someone who reads "sign out" as "close the app" would find
 * their pathways gone. The blurb says the true thing instead — nothing is lost, because everything
 * is on the account it is being signed out of.
 *
 * Answering it is the last thing this sheet does. What follows belongs to the curtain — including
 * this sheet's own dismissal, which happens under it rather than in front of it, and including a
 * failure, which by then has no button left to sit beneath and is reported as a toast instead.
 */
export function SignOutSheet({ ref }: { ref?: Ref<SignOutSheetRef> }) {
  const insets = useSafeAreaInsets();
  const sheet = useRef<SheetRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheet.current?.present(),
      dismiss: () => sheet.current?.dismiss(),
    }),
    [],
  );

  // Nothing here changes on the press, and that is the point: the curtain is over this sheet in
  // the same frame and takes every touch from then on, so there is no second press to guard
  // against and no waiting to report. A button that swapped itself for a spinner would be one more
  // thing moving under a curtain that is still see-through. The tab swaps to the pitch when the
  // session finally goes, so the sheet is dismissed then too — under the cover, with it.
  const signOut = () => leaveAccount({ onCovered: () => sheet.current?.dismiss() });

  return (
    <Sheet ref={sheet}>
      <View className="gap-[18px] px-[18px] pt-[6px]" style={{ paddingBottom: insets.bottom + 18 }}>
        <SheetHeading
          title="Sign out?"
          blurb="Your progress stays on this account and comes back when you sign in again — here or on another device."
        />

        <View className="gap-[9px]">
          <Button
            variant="destructive"
            size="lg"
            radius={12}
            className="w-full"
            onPress={signOut}
          >
            Sign out
          </Button>
          <Button
            variant="quiet"
            size="lg"
            radius={12}
            className="w-full"
            onPress={() => sheet.current?.dismiss()}
          >
            Cancel
          </Button>
        </View>
      </View>
    </Sheet>
  );
}
