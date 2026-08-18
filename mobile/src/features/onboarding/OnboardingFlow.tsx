import {
  email as emailSchema,
  parseLearningGoals,
  parseSkillLevel,
  type LearningGoal,
  type SkillLevel,
} from '@guitar/shared';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedView } from '@/components/AnimatedView';
import { BottomScrim } from '@/components/BottomScrim';
import { Button } from '@/components/Button';
import { clearCover, curtain, type Arrival } from '@/features/curtain';
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
import { GoalsStep } from './GoalsStep';
import { ModeLink } from './ModeLink';
import { NameStep } from './NameStep';
import { SkillStep } from './SkillStep';
import { StepChrome } from './StepChrome';
import { StepDots } from './StepDots';
import { TermsStep } from './TermsStep';
import { WaitNote } from './WaitNote';
import { landingFor } from './landing';
import { FRAMING, OTHER_MODE, type OnboardingMode } from './mode';
import { DEFAULT_DIAL_CODE, isCompletePhone, toE164 } from './phone';
import {
  isProfileStep,
  nextStep,
  suggestedName,
  type EntryStep,
  type OnboardingStep,
} from './steps';
import { useStepTransition, type Outcome } from './useStepTransition';

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
 *
 * Every step past the name is a write to the account, made as that step is answered rather than
 * banked up for the end. That is what makes a half-finished flow resumable at all: what has been
 * answered is on the account, so what is still owed is whatever is still missing, and quitting
 * costs only the step you were on.
 *
 * Two things belong to the flow rather than to any step: what each step has collected, and the
 * button that submits it. The button is anchored at the foot of the screen and never moves, which
 * is only possible if it is outside the thing that changes — so the steps are controlled, the
 * answers live here, and a step is a question rather than a form. See `useStepTransition` for what
 * happens between one question and the next.
 *
 * "Log in" is not a second flow, and there is no branch here for it. Since where a sign-in lands is
 * read off the account rather than off which screen asked, both framings can do everything the
 * other can: a login with an unknown address makes an account and asks the rest of the questions, a
 * sign-up with a known one lets someone straight back in. So the mode is wording, and the link
 * between the two is a move that lands back on the step it left (see `mode.ts`).
 */

/**
 * Better Auth returns failures rather than throwing, and the two OTP paths agree on the shape of
 * both halves — sending a code answers with nothing but success, and spending one answers with the
 * account it signed in. Restated structurally so the email and phone branches of each call can be
 * one expression rather than two.
 */
type SendResult = { error?: unknown };
type VerifyResult = { data?: { user?: unknown } | null; error?: unknown };

/**
 * What one step is allowed to write. Taken from the client rather than restated, so the fields are
 * exactly those declared in `inferAdditionalFields` — misspell one here and this stops compiling
 * rather than silently posting a key the server ignores.
 */
type ProfilePatch = Parameters<typeof authClient.updateUser>[0];

/**
 * What the chevron does on each step, where it does anything.
 *
 * `account` is absent because leaving the first step leaves the flow, which is a different act and
 * handled separately. `name` is absent for a different reason: by then the account exists, and
 * there is no earlier step left to go back to — the form that made it is not somewhere you can
 * return to.
 */
const BACK: Partial<Record<OnboardingStep, OnboardingStep>> = {
  code: 'account',
  skill: 'name',
  goals: 'skill',
  terms: 'goals',
};

/** What the floating button costs the page above the safe area: 14px, the 50px button, 14px. */
const DOCK_H = 78;

/** The anchored button, as the step showing decides it. Null on a step that has no use for one. */
interface Action {
  label: string;
  /** Whether the step has been answered well enough to be submitted. */
  ready: boolean;
  press: () => void;
}

export function OnboardingFlow({
  opened = 'create',
  handed = null,
  failed = null,
}: {
  opened?: OnboardingMode;
  /**
   * The step a sign-in run outside this flow handed it, or null for a flow that was opened rather
   * than handed over. Set means the screen is arriving under a cover: it takes the cover away and
   * fades itself up, which is the far half of a movement the screen before it began.
   */
  handed?: EntryStep | null;
  /** What that sign-in failed with, said on the step it handed over. */
  failed?: string | null;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: session, isPending: sessionPending } = useSession();

  const user = session?.user;

  /**
   * The cover the hand-off came under, taken away as this screen puts its first step up.
   *
   * At once rather than faded: what is underneath the cover by now is this screen, black and with
   * nothing on it yet, so there is nothing to dissolve between. The one thing that must not happen
   * is the other order — a cover lifting before the screen that replaces it exists, which is the
   * push being watched.
   */
  useEffect(() => {
    if (handed) clearCover();
  }, [handed]);

  /**
   * Leaving the flow, which for a completed one is not a pop but a welcome that happens to pop.
   *
   * The order is the whole thing. The greeting goes up first, over the empty black screen this
   * flow has already faded its last step out to — so it costs nothing to look at — and the pop is
   * handed to it rather than done here, to be run on the frame the greeting has the screen to
   * itself. By the time it dissolves, what is underneath is the screen the person left to sign in
   * from, already showing them signed in.
   *
   * No greeting is the ordinary way out and the majority of them: the chevron, the hardware
   * button, and a sign-in that did not take. Someone who backed out of the flow is not to be
   * congratulated for it.
   */
  const close = useCallback(
    (greeting?: Arrival) => {
      if (!greeting) {
        router.back();
        return;
      }

      curtain({ ...greeting, onCovered: () => router.back() });
    },
    [router],
  );

  /**
   * Where the flow opens, for an account that is part way through.
   *
   * Derived rather than seeded in an effect: the session is not necessarily resolved on the first
   * render, and a step written into state once it arrives would be a setState inside an effect —
   * a cascading render, which the compiler's lint rejects and which would flash the account form
   * on the way past. As a derivation it is simply right on whichever render the session lands.
   *
   * `done` falls back to the account form because nothing here can act on it: something opened
   * this flow deliberately, and closing it out from under that caller is not this component's
   * decision to make.
   *
   * A handed-over step wins over all of it, and has to: the sign-in that named it happened a moment
   * ago on another screen, and the session store has not necessarily caught up with it yet. Asked
   * again here, the account would answer with what it was before it was signed into — which is the
   * form the person has just finished with, fading up over the step they had actually reached.
   */
  const owed = sessionPending ? 'account' : nextStep(user);
  const resting: OnboardingStep = handed ?? (owed === 'done' ? 'account' : owed);

  const { shown, error, setError, moving, note, contentStyle, frameStyle, noteStyle, begin } =
    useStepTransition({ resting, onLeave: close, arriving: handed !== null, failed });

  /**
   * Which framing is showing, seeded by whatever opened the flow and the flow's own from then on.
   *
   * State rather than a route param it keeps writing back: the link across is not a navigation —
   * nothing is pushed and back still leaves the flow rather than unwinding a create/login/create
   * ping-pong. The param is only how this was entered.
   */
  const [mode, setMode] = useState<OnboardingMode>(opened);

  const [channel, setChannel] = useState<Channel>('email');
  const [contact, setContact] = useState('');
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [code, setCode] = useState('');
  /** Bumped whenever a code goes out, which is what restarts the resend countdown. */
  const [sentAt, setSentAt] = useState(0);
  /** The one request that does not move the flow, and so shows itself where it was started. */
  const [resending, setResending] = useState(false);

  /**
   * What each profile step has collected, held as "nothing has been touched yet" rather than as the
   * answer itself.
   *
   * Null means the account's own value still stands, which is what makes a resumed flow show what
   * was saved without an effect copying it into state the moment the session lands. The skill step
   * needs the wrapper because null is also one of its answers — deselecting the chosen card is not
   * the same as never having seen the step.
   */
  const [typedName, setTypedName] = useState<string | null>(null);
  const [pickedSkill, setPickedSkill] = useState<{ level: SkillLevel | null } | null>(null);
  const [pickedGoals, setPickedGoals] = useState<readonly LearningGoal[] | null>(null);
  const [pickedEmails, setPickedEmails] = useState<boolean | null>(null);
  // Agreement is never carried over: reaching the terms step means it has not been given yet, so
  // there is nothing to restore and a pre-ticked box would be claiming otherwise.
  const [agreed, setAgreed] = useState(false);

  // What the account already says, falling back to what a provider suggested — so stepping back to
  // the name lands on the name that was entered, not on the suggestion it may have replaced.
  const saved = typeof user?.name === 'string' && user.name.trim() ? user.name : suggestedName(user);
  const name = typedName ?? saved;

  // `no_answer` is not a card, so an account that skipped the step comes back to nothing selected —
  // which is what it looks like to have skipped it.
  const answered = parseSkillLevel(user?.skillLevel);
  const skill = pickedSkill ? pickedSkill.level : answered === 'no_answer' ? null : answered;

  const goals = pickedGoals ?? parseLearningGoals(user?.goals) ?? [];
  const emails = pickedEmails ?? (user?.marketingEmails === true);

  /** The address or number as the server wants it: lowercased, or joined into E.164. */
  const destination =
    channel === 'phone' ? toE164(dialCode, contact) : contact.trim().toLowerCase();

  const reachable =
    channel === 'phone'
      ? isCompletePhone(dialCode, contact)
      : emailSchema.safeParse(contact).success;

  /**
   * One profile answer, written to the account and then stepped past.
   *
   * The step is named by the caller rather than re-derived from the session, because the session
   * has not necessarily caught up with the write that just succeeded — and a step derived from a
   * stale account would be the one just answered.
   */
  const saveProfile = useCallback(
    async (patch: ProfilePatch, to: OnboardingStep): Promise<Outcome> => {
      const result: SendResult = await authClient.updateUser(patch);

      // Nothing advances. A step whose answer did not reach the server is a step still owed, and
      // moving on would lose the answer and put the question back on the next launch.
      if (result.error) {
        return { error: describeAuthError(result.error as Parameters<typeof describeAuthError>[0]) };
      }

      return { to };
    },
    [],
  );

  /** The last answer, and the only step whose success is also an arrival. */
  const acceptTerms = useCallback(async (): Promise<Outcome<Arrival>> => {
    const outcome = await saveProfile(
      { termsAcceptedAt: new Date(), marketingEmails: emails },
      // The last answer, so there is no step after it — the flow is over the moment the account
      // has everything.
      'done',
    );

    // The account became complete here, however many times it has signed in before, so this is the
    // welcome in rather than the welcome back. Only on the write that landed: a terms step that
    // failed to save is a terms step still owed.
    if (!('to' in outcome)) return outcome;

    return { ...outcome, leaving: { kind: 'new', name: name.trim() } };
  }, [emails, name, saveProfile]);

  const sendCode = useCallback(async (): Promise<Outcome> => {
    const result: SendResult =
      channel === 'phone'
        ? await authClient.phoneNumber.sendOtp({ phoneNumber: destination })
        : await authClient.emailOtp.sendVerificationOtp({ email: destination, type: 'sign-in' });

    if (result.error) {
      return { error: describeAuthError(result.error as Parameters<typeof describeAuthError>[0]) };
    }

    setCode('');
    setSentAt((count) => count + 1);
    return { to: 'code' };
  }, [channel, destination]);

  /**
   * Where a completed sign-in lands, as a move — the same line for a code, for Apple and for
   * Google, since all three ask the account rather than remembering which button was pressed.
   *
   * The rule itself is `landingFor`, which the settings tab needs too and which is therefore not
   * this screen's to keep (see `landing.ts`). All this adds is the one thing that is local: a
   * sign-in that did not take is `account` there and the end of the flow here, because a flow whose
   * first step signed nobody in has nothing left to show.
   */
  const landing = (account: unknown): Outcome<Arrival> => {
    const { step, greeting } = landingFor(account);
    return { to: step === 'account' ? 'done' : step, leaving: greeting };
  };

  const verifyCode = useCallback(
    async (entered: string): Promise<Outcome<Arrival>> => {
      const result: VerifyResult =
        channel === 'phone'
          ? await authClient.phoneNumber.verify({ phoneNumber: destination, code: entered })
          : await authClient.signIn.emailOtp({ email: destination, otp: entered });

      // The code stays in the boxes, reddened, rather than being cleared out from under someone
      // who mistyped one digit of six.
      if (result.error) {
        return { error: describeAuthError(result.error as Parameters<typeof describeAuthError>[0]) };
      }

      return landing(result.data?.user);
    },
    [channel, destination],
  );

  /** Another code, without leaving the step — so it shows itself on the control that asked. */
  const resend = useCallback(async () => {
    setResending(true);
    setError(null);

    const result: SendResult =
      channel === 'phone'
        ? await authClient.phoneNumber.sendOtp({ phoneNumber: destination })
        : await authClient.emailOtp.sendVerificationOtp({ email: destination, type: 'sign-in' });

    setResending(false);

    if (result.error) {
      setError(describeAuthError(result.error as Parameters<typeof describeAuthError>[0]));
      return;
    }

    setCode('');
    setSentAt((count) => count + 1);
  }, [channel, destination, setError]);

  const withProvider = (run: () => Promise<SocialResult>) => {
    begin({
      // The provider's own sheet is over this screen for as long as it takes, and a screen
      // apologising for a wait underneath it is talking about someone else's delay.
      patience: false,
      // And the whole screen goes, not just the question on it. A provider answers everything the
      // frame offers — the button submits the field the sheet has just made irrelevant, and the
      // link across offers a framing that has stopped applying — so leaving them up would leave a
      // screen behind that nothing on it could still do. It is also what makes this the same
      // movement whether the sheet was reached from here or from the account screen, where there
      // was no frame to leave: both ways in end on an empty screen, and both come back to a whole
      // one, so a person who used either cannot tell which of them they used.
      frame: true,
      task: async () => {
        const result = await run();

        // A cancelled sheet is a decision, not a failure. The step comes back and says nothing.
        if (!result.ok) {
          return { error: result.error === SOCIAL_CANCELLED ? null : result.error };
        }

        return landing(result.user);
      },
    });
  };

  const back = BACK[shown];

  // The hardware button belongs to the flow rather than to the stack, and follows the chevron
  // exactly: a step back where there is one, and out of the flow where there is not. Mid-transition
  // it is swallowed, for the same reason the chevron stops taking taps.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (moving) return true;
      if (!back) return false;

      begin({ to: back });
      return true;
    });

    return () => subscription.remove();
  }, [back, begin, moving]);

  /**
   * What the anchored button is on the step showing.
   *
   * Read off `shown` rather than off where the flow is heading, so it changes at the moment the
   * question does — which is the moment nothing is on screen to see it change.
   */
  const action = ((): Action | null => {
    switch (shown) {
      case 'account':
        return {
          label: 'Continue',
          ready: reachable,
          press: () => begin({ task: sendCode }),
        };
      case 'name':
        return {
          label: 'Continue',
          ready: name.trim().length > 0,
          press: () => {
            // The one step whose answer is typed and whose successor's is not. Sent away here, as
            // the step starts to fall, rather than left to go by itself when the field unmounts —
            // which would be halfway through, and would take the anchored button down with it just
            // as the next question was arriving. All the movement belongs to the leaving half.
            Keyboard.dismiss();
            begin({ task: () => saveProfile({ name: name.trim() }, 'skill') });
          },
        };
      case 'skill':
        return {
          label: 'Continue',
          ready: true,
          press: () => begin({ task: () => saveProfile({ skillLevel: skill ?? 'no_answer' }, 'goals') }),
        };
      case 'goals':
        return {
          label: 'Continue',
          ready: true,
          // A copy of the set, since what is stored must not go on changing with the screen.
          press: () => begin({ task: () => saveProfile({ goals: [...goals] }, 'terms') }),
        };
      case 'terms':
        return {
          label: 'Finish',
          ready: agreed,
          press: () => begin({ task: acceptTerms }),
        };
      // The code verifies itself on the sixth digit, so there is nothing for a button to do.
      default:
        return null;
    }
  })();

  const step = ((): ReactNode => {
    switch (shown) {
      case 'code':
        return (
          <CodeStep
            destination={destination}
            code={code}
            onChangeCode={setCode}
            onSubmit={(entered) => begin({ task: () => verifyCode(entered) })}
            onResend={() => void resend()}
            onBack={() => begin({ to: 'account' })}
            error={error}
            resending={resending}
            sentAt={sentAt}
          />
        );
      case 'name':
        return (
          <NameStep
            value={name}
            onChange={setTypedName}
            error={error}
            onSubmit={action?.ready ? action.press : undefined}
          />
        );
      case 'skill':
        return (
          <SkillStep value={skill} onChange={(level) => setPickedSkill({ level })} error={error} />
        );
      case 'goals':
        return <GoalsStep value={goals} onChange={setPickedGoals} error={error} />;
      case 'terms':
        return (
          <TermsStep
            agreed={agreed}
            onAgreed={setAgreed}
            emails={emails}
            onEmails={setPickedEmails}
            error={error}
          />
        );
      default:
        return (
          <AccountStep
            mode={mode}
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
            error={error}
            onSubmit={action?.ready ? action.press : undefined}
            onGoogle={() => withProvider(signInWithGoogle)}
            onApple={() => withProvider(signInWithApple)}
          />
        );
    }
  })();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg"
    >
      {/* Outside the scroll, so the rail marking progress is one thing that holds still while the
          questions come and go past it — and animated only for the one move that takes the whole
          screen rather than the question on it, where holding still would be holding on. */}
      <AnimatedView
        className="flex-row items-center justify-between px-[18px]"
        style={[{ paddingTop: insets.top + 10 }, frameStyle]}
      >
        {/* The flow is pushed rather than presented, so back from a step with nothing behind it
            leaves the flow, and reads as one. The steps that do have something behind them go
            back within the flow instead of unwinding the push — which is why the same chevron
            has two destinations, and why `name` takes the leaving one: the account exists by
            then, and the form that made it is not somewhere to return to. */}
        <Button
          variant="ghost"
          size="inline"
          icon="chevron.left"
          hitSlop={10}
          className="-ml-[4px]"
          accessibilityLabel={back ? 'Back' : 'Close'}
          // Guarded here rather than by `disabled`, which would repaint a face this button does
          // not have. Mid-transition the press is simply dropped.
          onPress={() => {
            if (moving) return;
            if (back) begin({ to: back });
            else close();
          }}
        />

        {/* One slot, two things that are never both wanted: the rail once an account exists, and
            the way across between the two framings before one does. Sharing it is what keeps
            either of them at the end of the row — side by side, the hidden one would still be
            holding its space and pushing the other in from the edge. */}
        <StepChrome shown={isProfileStep(shown) || shown === 'account'}>
          {isProfileStep(shown) ? (
            <StepDots step={shown} />
          ) : (
            <ModeLink
              label={FRAMING[mode].other}
              // A move that lands back where it started, carrying a different name for itself. The
              // question is untouched on the way past — what was typed into it is just as good an
              // answer to the other framing.
              onPress={() => begin({ to: 'account', arrive: () => setMode(OTHER_MODE[mode]) })}
            />
          )}
        </StepChrome>
      </AnimatedView>

      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerClassName="grow px-[18px] pt-[20px]"
          // Room for the button to float over rather than sit on: a step long enough to scroll can
          // still be read to its last line.
          contentContainerStyle={{ paddingBottom: insets.bottom + DOCK_H + 12 }}
        >
          {/* Inert while it is leaving: what is under a finger halfway through a fade is a
              question that has already been answered. */}
          <AnimatedView style={contentStyle} pointerEvents={moving ? 'none' : 'auto'}>
            {step}
          </AnimatedView>
        </ScrollView>

        {note ? (
          // Centred in what is actually empty rather than in the whole box: the foot of the screen
          // belongs to the button, whether or not the step showing has one.
          <View
            pointerEvents="none"
            className="absolute inset-x-0 top-0"
            style={{ bottom: insets.bottom + DOCK_H }}
          >
            <WaitNote style={noteStyle} />
          </View>
        ) : null}

        {/* Floating rather than shelved. A bar with an edge would cut the screen in two and hold
            the same amount of it whether there was anything under the button or not; the scrim
            takes only what it needs to stay legible, and content passes out of sight under it
            instead of stopping at a line. Nothing here but the button takes a touch, so the page
            still scrolls beneath it.

            Inside the flex child rather than beside it: what the keyboard shortens is this box, so
            anchoring to its foot is anchoring above the keyboard without depending on how absolute
            children read a parent's padding. */}
        <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0">
          <BottomScrim />

          <AnimatedView
            pointerEvents="box-none"
            className="px-[18px] pt-[14px]"
            style={[{ paddingBottom: insets.bottom + 14 }, frameStyle]}
          >
            {/* Two fades over one button, and they are about different things: `StepChrome` is
                whether this step has anything for it to do, and the frame is whether the screen it
                belongs to is here at all. Multiplying them is the right answer to both — a step
                with no button arrives with none. */}
            <StepChrome shown={action !== null}>
              <Button
                variant="primary"
                size="lg"
                // Clamped by the native layer to half the height, which is what makes it a pill —
                // and a squircle one, so its corners ease the way every other face in Aurora does.
                radius={999}
                className="w-full"
                // Held true where there is no action, so the face of a button on its way out does
                // not change colour while it fades. `begin` is what actually refuses a press
                // mid-move; a button that greyed out for the length of a transition would be
                // reporting on the network, which is the one thing this button never does.
                disabled={action ? !action.ready : false}
                onPress={() => action?.press()}
              >
                {action?.label ?? 'Continue'}
              </Button>
            </StepChrome>
          </AnimatedView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
