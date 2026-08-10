import { useEffect, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';

import { AuthButton } from '@/components/AuthButton';
import { useFace } from '@/components/CornerFace';
import { authClient, describeAuthError, VERIFY_EMAIL_LINK } from '@/lib/auth';

import { AuthShell, FormError } from './AuthShell';
import { ChangePasswordForm } from './ChangePasswordForm';

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

/** Up to two initials from the name, falling back to the address when there is no name. */
function initials({ name, email }: ProfileUser): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((word) => word[0]);
  return (letters.length ? letters.join('') : email.slice(0, 1)).toUpperCase();
}

export function ProfileCard({ user, refetchSession }: Props) {
  const card = useFace('card', 13);
  const avatar = useFace('accent', 22);

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

      <View
        className={`flex-row items-center gap-[14px] rounded-[13px] p-[16px] ${card.className}`}
      >
        {card.paint}

        <View
          className={`h-[44px] w-[44px] items-center justify-center rounded-[22px] ${avatar.className}`}
        >
          {avatar.paint}
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
          <Pressable
            onPress={resendVerification}
            disabled={sending}
            accessibilityRole="button"
            accessibilityState={{ disabled: sending, busy: sending }}
            hitSlop={8}
            className="active:opacity-60"
          >
            <Text className="font-mono text-[9.5px] uppercase tracking-[1.5px] text-accent">
              {sending ? 'Sending' : 'Resend'}
            </Text>
          </Pressable>
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
        <AuthButton
          label="Change password"
          variant="quiet"
          onPress={() => {
            setNotice(null);
            setFailure(null);
            setChanging(true);
          }}
        />
      )}

      <AuthButton
        label="Sign out"
        variant="destructive"
        onPress={signOut}
        pending={signingOut}
        disabled={changing}
      />
    </AuthShell>
  );
}
