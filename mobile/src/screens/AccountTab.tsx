import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileCard } from '@/features/account';
import { OnboardingPitch, startOnboarding } from '@/features/onboarding';
import { useSession } from '@/lib/auth';
import { useToken } from '@/lib/tokens';

export function AccountTab() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const faint = useToken('--ink-faint', '#62666e');

  // The first read comes off the device keychain, so this is brief — but rendering the pitch
  // during it would sell an account to someone who already has one.
  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size="small" color={faint} />
      </View>
    );
  }

  // A guest has a session but nothing to show in a profile: their name is "Anonymous" and their
  // address is a placeholder the server made up. What they need is the same thing someone with no
  // session at all needs, so the two cases are one view. Signing up from it is what claims their
  // progress — the server moves it onto the real account (BACKEND_PLAN.md §5).
  if (!session || session.user.isAnonymous) {
    return (
      <ScrollView
        className="flex-1 bg-bg"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="grow pt-[24px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        <OnboardingPitch onCreateAccount={() => startOnboarding(router)} />
      </ScrollView>
    );
  }

  return <ProfileCard user={session.user} refetchSession={refetch} />;
}
