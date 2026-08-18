import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountActions, AccountHeader } from '@/features/account';
import { OnboardingPitch, continueWithProvider, startOnboarding } from '@/features/onboarding';
import { AboutCard, PreferenceSettings } from '@/features/settings';
import { signInWithApple, signInWithGoogle, useKnownSession } from '@/lib/auth';
import { useToken } from '@/lib/tokens';

/**
 * The settings tab — the last one, and the only place the account is now shown.
 *
 * It opens on who is signed in, on the one card here, and the settings follow under it as bare rows
 * grouped by subject. The preferences are shown to a guest as well as to an account: a guest has a
 * session too, so theirs are stored and synced the same way, and are carried over if they later
 * sign up (§5).
 */
export function SettingsTab() {
  const { session, unknown } = useKnownSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const faint = useToken('--ink-faint', '#62666e');

  // The first read comes off the device keychain, so this is brief — but rendering the pitch
  // during it would sell an account to someone who already has one. Only the first: every read
  // after it has an answer to show, including the ones signing out sets off (see `useKnownSession`).
  if (unknown) {
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
  const account = session && !session.user.isAnonymous ? session.user : null;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="grow pt-[24px]"
      contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
    >
      {account ? (
        <View className="px-[18px]">
          <AccountHeader user={account} />
        </View>
      ) : (
        <OnboardingPitch
          onCreateAccount={() => startOnboarding(router)}
          onLogIn={() => startOnboarding(router, 'login')}
          // The two providers do not open the flow: they sign in from here and let what comes back
          // decide whether there is a flow to open at all. See `handoff.ts` — this screen is only
          // ever the place it was started from, and it takes no part in what happens after.
          onGoogle={() => void continueWithProvider(router, signInWithGoogle)}
          onApple={() => void continueWithProvider(router, signInWithApple)}
        />
      )}

      <View className="px-[18px]">
        <PreferenceSettings />

        {/* The account's own rows are a section like the others rather than a footer to them: what
            they change is the account, which is a different subject from what the app sounds and
            looks like — and only someone who has one has that subject at all. */}
        {account ? <AccountActions email={account.email} /> : null}

        {/* Outside every section, because it is not a setting. */}
        <View className="mt-[22px]">
          <AboutCard />
        </View>
      </View>
    </ScrollView>
  );
}
