import { useRef } from 'react';

import { AccountSummary, type AccountSummaryUser } from './AccountSummary';
import { EditProfileSheet, type EditProfileSheetRef } from './EditProfileSheet';

/**
 * The account at the top of Settings, and the sheet it opens.
 *
 * The two are one component because the heading is the only way into the profile — there is no
 * Edit button beside it. That is the whole of the design: what you can change is the thing you are
 * already looking at, so you press it.
 */
export function AccountHeader({ user }: { user: AccountSummaryUser }) {
  const profile = useRef<EditProfileSheetRef>(null);

  return (
    <>
      <AccountSummary user={user} onPress={() => profile.current?.present()} />
      <EditProfileSheet ref={profile} user={user} />
    </>
  );
}
