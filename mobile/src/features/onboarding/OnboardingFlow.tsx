import { email as emailSchema } from '@guitar/shared';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import {
  SOCIAL_CANCELLED,
  authClient,
  describeAuthError,
  signInWithApple,
  signInWithGoogle,
  useSession,
  type SocialResult,
} from '@/lib/auth';

import { AccountStep } from './AccountStep';
import { CodeStep } from './CodeStep';
import type { Channel } from './ContactField';
import { NameStep } from './NameStep';
import { StepSlide } from './StepSlide';
import { DEFAULT_DIAL_CODE, isCompletePhone, toE164 } from './phone';
import { nextStep, suggestedName, type OnboardingStep } from './steps';

/**
 * Account creation, as one screen that changes rather than a stack that pushes.
 *
 * Every way in ends in the same place: a session for a real (non-anonymous) account. What happens
 * next is then read off that account by `nextStep` rather than remembered from how it was reached
 * — which is why a returning user falls straight through to the end, someone who quit halfway
 * comes back to what they still owe, and the four entry paths need no branching between them.
 *
 * The one step that is not derived is `code`, because waiting for a code is something this flow is
 * doing rather than something the account is missing. It is entered when one goes out and left
 * when one comes back.
 */

/**
 * Better Auth returns failures rather than throwing, and the two OTP paths agree on the shape of
 * both halves — sending a code answers with nothing but success, and spending one answers with the
 * account it signed in. Restated structurally so the email and phone branches of each call can be
 * one expression rather than two.
 */
type SendResult = { error?: unknown };
type VerifyResult = { data?: { user?: unknown } | null; error?: unknown };

type Busy = 'contact' | 'google' | 'apple' | 'code' | null;

export function OnboardingFlow() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session } = useSession();

  const [step, setStep] = useState<OnboardingStep>('account');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const [channel, setChannel] = useState<Channel>('email');
  const [contact, setContact] = useState('');
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [code, setCode] = useState('');
  /** Bumped whenever a code goes out, which is what restarts the resend countdown. */
  const [sentAt, setSentAt] = useState(0);

  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user;

  const close = useCallback(() => router.back(), [router]);

  const go = useCallback((to: OnboardingStep, heading: 'forward' | 'back' = 'forward') => {
    setDirection(heading);
    setError(null);
    setStep(to);
  }, []);

  /**
   * Where a completed sign-in lands. The account is asked what it still needs rather than told
   * where to go, so this is the same line for a code, for Apple and for Google.
   */
  const advance = useCallback(
    (account: unknown) => {
      const to = nextStep(account as Parameters<typeof nextStep>[0]);
      if (to === 'done' || to === 'account') {
        // `account` here means the sign-in did not take — nothing to collect and nothing signed
        // in — and `done` means there is nothing left to ask. Both are the end of this flow.
        close();
        return;
      }
      go(to);
    },
    [close, go],
  );

  /** The address or number as the server wants it: lowercased, or joined into E.164. */
  const destination =
    channel === 'phone' ? toE164(dialCode, contact) : contact.trim().toLowerCase();

  const ready =
    channel === 'phone'
      ? isCompletePhone(dialCode, contact)
      : emailSchema.safeParse(contact).success;

  const sendCode = useCallback(
    async ({ resending }: { resending: boolean } = { resending: false }) => {
      setBusy(resending ? 'code' : 'contact');
      setError(null);

      const result: SendResult =
        channel === 'phone'
          ? await authClient.phoneNumber.sendOtp({ phoneNumber: destination })
          : await authClient.emailOtp.sendVerificationOtp({
              email: destination,
              type: 'sign-in',
            });

      setBusy(null);

      if (result.error) {
        setError(describeAuthError(result.error as Parameters<typeof describeAuthError>[0]));
        return;
      }

      setCode('');
      setSentAt((count) => count + 1);
      if (!resending) go('code');
    },
    [channel, destination, go],
  );

  const verifyCode = useCallback(
    async (entered: string) => {
      setBusy('code');
      setError(null);

      const result: VerifyResult =
        channel === 'phone'
          ? await authClient.phoneNumber.verify({ phoneNumber: destination, code: entered })
          : await authClient.signIn.emailOtp({ email: destination, otp: entered });

      setBusy(null);

      if (result.error) {
        // The code stays in the boxes, reddened, rather than being cleared out from under someone
        // who mistyped one digit of six.
        setError(describeAuthError(result.error as Parameters<typeof describeAuthError>[0]));
        return;
      }

      advance(result.data?.user);
    },
    [advance, channel, destination],
  );

  const withProvider = useCallback(
    async (which: 'google' | 'apple', run: () => Promise<SocialResult>) => {
      setBusy(which);
      setError(null);

      const result = await run();
      setBusy(null);

      if (!result.ok) {
        // A cancelled sheet is a decision, not a failure. The form comes back and says nothing.
        if (result.error !== SOCIAL_CANCELLED) setError(result.error);
        return;
      }

      advance(result.user);
    },
    [advance],
  );

  // The hardware button belongs to the flow, not the modal: on any step past the first it is a
  // step back, and only the first one lets it close the whole thing.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 'account') return false;
      if (step === 'code') {
        go('account', 'back');
        return true;
      }
      return true;
    });

    return () => subscription.remove();
  }, [step, go]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerClassName="grow px-[18px]"
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 32 }}
      >
        {/* A modal closes rather than goes back, so the affordance is a cross and not a chevron —
            and it stays even though the card can be swiped away, which is not discoverable. On a
            step past the first it is a chevron, because there is now somewhere to go back to. */}
        <Button
          variant="ghost"
          size="inline"
          icon={step === 'account' ? 'xmark' : 'chevron.left'}
          hitSlop={10}
          className="-ml-[4px] self-start"
          accessibilityLabel={step === 'account' ? 'Close' : 'Back'}
          onPress={step === 'account' ? close : () => go('account', 'back')}
        />

        <StepSlide
          step={step}
          direction={direction}
          className="mt-[20px]"
          render={(shown) => {
            if (shown === 'code') {
              return (
                <CodeStep
                  destination={destination}
                  code={code}
                  onChangeCode={setCode}
                  onSubmit={verifyCode}
                  onResend={() => void sendCode({ resending: true })}
                  onBack={() => go('account', 'back')}
                  error={error}
                  pending={busy === 'code'}
                  sentAt={sentAt}
                />
              );
            }

            if (shown === 'name') {
              return <NameStep suggestion={suggestedName(user)} onDone={close} />;
            }

            return (
              <AccountStep
                channel={channel}
                onChangeChannel={(next) => {
                  setChannel(next);
                  setContact('');
                  setError(null);
                }}
                value={contact}
                onChangeValue={setContact}
                dialCode={dialCode}
                onChangeDialCode={setDialCode}
                ready={ready}
                error={error}
                busy={busy === 'code' ? null : busy}
                onSubmit={() => void sendCode()}
                onGoogle={() => void withProvider('google', signInWithGoogle)}
                onApple={() => void withProvider('apple', signInWithApple)}
              />
            );
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
