import { useRef } from 'react';

import { ActionRow, SettingsSection } from '@/features/settings';

import { ChangeEmailSheet, type ChangeEmailSheetRef } from './ChangeEmailSheet';
import { DeleteAccountSheet, type DeleteAccountSheetRef } from './DeleteAccountSheet';
import { SignOutSheet, type SignOutSheetRef } from './SignOutSheet';

/**
 * What can be done to the account itself, as the last section of the settings screen.
 *
 * The wired rows all ask before they act, and none of them acts here: each row only opens its
 * sheet. That is deliberate for the ones that are not finished yet — a row that opens a sheet and
 * stops at its submit reads as a thing still being built — and it is right for signing out as well,
 * since that is not something to do by brushing past a list.
 *
 * The phone number has no sheet at all yet, so it is not offered as a control: faint, unpressable,
 * and saying when instead. See `ActionRow`.
 *
 * Rendered only for a real account: a guest has nothing to sign out of, no address to change, and
 * no account to delete.
 */
export function AccountActions({ email }: { email: string }) {
  const signOut = useRef<SignOutSheetRef>(null);
  const changeEmail = useRef<ChangeEmailSheetRef>(null);
  const deleteAccount = useRef<DeleteAccountSheetRef>(null);

  return (
    <SettingsSection label="Account">
      <ActionRow label="Change email" onPress={() => changeEmail.current?.present()} />
      <ActionRow label="Change phone number" value="Soon" />
      <ActionRow label="Sign out" onPress={() => signOut.current?.present()} />
      <ActionRow
        label="Delete account"
        tone="destructive"
        onPress={() => deleteAccount.current?.present()}
      />

      <SignOutSheet ref={signOut} />
      <ChangeEmailSheet ref={changeEmail} current={email} />
      <DeleteAccountSheet ref={deleteAccount} />
    </SettingsSection>
  );
}
