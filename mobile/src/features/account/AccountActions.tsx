import { useRef } from 'react';
import { View } from 'react-native';

import { ActionRow } from '@/features/settings';

import { ChangeEmailSheet, type ChangeEmailSheetRef } from './ChangeEmailSheet';
import { DeleteAccountSheet, type DeleteAccountSheetRef } from './DeleteAccountSheet';
import { SignOutSheet, type SignOutSheetRef } from './SignOutSheet';

/**
 * What can be done to the account itself, as the last rows of the settings card.
 *
 * All three ask before they act, and none of them acts here: each row only opens its sheet. That is
 * deliberate for the two that are not wired yet — a row that did nothing at all would read as
 * broken, where a row that opens a sheet and stops at its submit reads as a thing still being
 * built — and it is right for the third as well, since signing out is not something to do by
 * brushing past a list.
 *
 * Rendered only for a real account: a guest has nothing to sign out of, no address to change, and
 * no account to delete.
 */
export function AccountActions({ email }: { email: string }) {
  const signOut = useRef<SignOutSheetRef>(null);
  const changeEmail = useRef<ChangeEmailSheetRef>(null);
  const deleteAccount = useRef<DeleteAccountSheetRef>(null);

  return (
    <View>
      <ActionRow label="Change email" onPress={() => changeEmail.current?.present()} />
      <ActionRow label="Sign out" onPress={() => signOut.current?.present()} />
      <ActionRow
        label="Delete account"
        tone="destructive"
        onPress={() => deleteAccount.current?.present()}
      />

      <SignOutSheet ref={signOut} />
      <ChangeEmailSheet ref={changeEmail} current={email} />
      <DeleteAccountSheet ref={deleteAccount} />
    </View>
  );
}
