import { useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Face } from '@/components/Face';
import { authClient, describeAuthError, VERIFY_EMAIL_LINK } from '@/lib/auth';

import { AuthShell, FormError } from './AuthShell';
import { ChangePasswordForm } from './ChangePasswordForm';
import { initials } from './initials';

export interface ProfileUser {
  name: string;
  email: string;
  emailVerified: boolean;
}

interface Props {
  user: ProfileUser;
  /** Re-reads the session, so a newly confirmed address stops showing as unconfirmed. */
  refetchSession: () => void;
}

export function ProfileCard({ user, refetchSession }: Props) {
  const [changing, setChanging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Confirming happens in a browser, outside the app, so the only reliable moment to notice it is
  // when the app comes back to the foreground.
  useEffect(() => {
    if (user.emailVerified) return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refetchSession();
    });

    return () => subscription.remove();
  }, [user.emailVerified, refetchSession]);

  const resendVerification = async () => {
    setFailure(null);
    setNotice(null);
    setSending(true);

    const { error } = await authClient.sendVerificationEmail({
      email: user.email,
      callbackURL: VERIFY_EMAIL_LINK,
    });

    setSending(false);
    if (error) {
      setFailure(describeAuthError(error));
      return;
    }

    setNotice(`Confirmation link sent to ${user.email}.`);
  };

  const signOut = async () => {
    setSigningOut(true);
    const { error } = await authClient.signOut();

    if (error) {
      setSigningOut(false);
      setFailure(describeAuthError(error));
    }
    // On success this component unmounts with the session, so the pending flag is left set.
  };

  return (
    <AuthShell title="Account" blurb="Signed in. Your progress syncs to this account.">
      <FormError message={failure} />

      <View className="flex-row items-center gap-[14px] p-[16px]">
        <Face name="card" radius={13} />

        <View className="h-[44px] w-[44px] items-center justify-center">
          <Face name="accent" radius={22} />
          <Text className="text-[16px] font-semibold text-accent">{initials(user)}</Text>
        </View>

        <View className="flex-1">
          <Text numberOfLines={1} className="text-[16px] font-medium tracking-[-0.3px] text-ink">
            {user.name || 'No name set'}
          </Text>
          <Text numberOfLines={1} className="mt-[2px] text-[13px] text-ink-muted">
            {user.email}
          </Text>
        </View>
      </View>

      {user.emailVerified ? (
        <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
          Email confirmed
        </Text>
      ) : (
        <View className="flex-row items-center justify-between gap-[12px]">
          <Text className="flex-1 text-[13px] leading-[18px] text-amber">
            Your email address isn’t confirmed yet.
          </Text>
          <Button
            variant="link"
            size="inline"
            text="mono"
            hitSlop={8}
            disabled={sending}
            onPress={resendVerification}
          >
            {sending ? 'Sending' : 'Resend'}
          </Button>
        </View>
      )}

      {notice ? <Text className="text-[13px] leading-[18px] text-ink-muted">{notice}</Text> : null}

      {changing ? (
        <ChangePasswordForm
          onCancel={() => setChanging(false)}
          onDone={(message) => {
            setChanging(false);
            setNotice(message);
          }}
        />
      ) : (
        <Button
          variant="quiet"
          size="md"
          radius={11}
          className="w-full"
          onPress={() => {
            setNotice(null);
            setFailure(null);
            setChanging(true);
          }}
        >
          Change password
        </Button>
      )}

      <Button
        variant="destructive"
        size="md"
        radius={11}
        className="w-full"
        pending={signingOut}
        disabled={changing}
        onPress={signOut}
      >
        Sign out
      </Button>
    </AuthShell>
  );
}
