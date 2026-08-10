import { ActivityIndicator, View } from 'react-native';

import { ProfileCard, SignedOutView } from '@/features/account';
import { useSession } from '@/lib/auth';
import { useToken } from '@/lib/tokens';

export function AccountTab() {
  const { data: session, isPending, refetch } = useSession();
  const faint = useToken('--ink-faint', '#62666e');

  // The first read comes off the device keychain, so this is brief — but rendering the sign-in
  // form during it would flash a form at someone who is already signed in.
  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="small" color={faint} />
      </View>
    );
  }

  if (!session) return <SignedOutView />;

  // A guest has a session but nothing to show in a profile: their name is "Anonymous" and their
  // address is a placeholder the server made up. What they need is the way out of being a guest,
  // which is the same pair of forms (BACKEND_PLAN.md §5). No sign-out either — there is no
  // credential to sign back in with, so it would destroy the account rather than leave it.
  if (session.user.isAnonymous) return <SignedOutView guest />;

  return <ProfileCard user={session.user} refetchSession={refetch} />;
}
