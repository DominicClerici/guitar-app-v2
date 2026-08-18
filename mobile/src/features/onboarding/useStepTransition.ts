import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ARRIVE, ARRIVE_MS, TRAVEL } from '@/lib/motion';

import type { OnboardingStep } from './steps';

/**
 * One step leaving and the next arriving, with whatever the step owed the server happening in the
 * gap between them.
 *
 * The shape of a move is fixed and does not vary with what it is waiting for: the answered step
 * falls away, there is a beat of nothing, and the next one rises into the space. The request goes
 * out as the fall begins, so in the ordinary case — a round trip shorter than the fall — it has
 * already landed by the time anything is waiting on it, and the move is the same length whether
 * anything was saved or not. That is the point: the button is pressed, the screen answers
 * immediately, and the network is something the screen never had to mention.
 *
 * When the network *is* slower than that, the move stalls at the empty point rather than rushing
 * the arrival. Nothing is said about it for the first sixth of a second past the moment the next
 * step was due, because most of what overruns overruns by very little and a spinner that flashes is
 * worse than the wait it announces. Past that the apology fades up, and it is an apology — the wait
 * is this screen's fault, not the person's.
 *
 * A failure is a move that arrives back where it set off from. The step comes up carrying its
 * error, in the same movement it would have used for the next one, because a form that snaps back
 * has nowhere to put the explanation.
 *
 * The frame — the chevron, the link across, the anchored button — ordinarily holds still through
 * all of this, which is the point of it living outside the step. One move takes it too: a provider,
 * whose sheet answers the whole screen at once rather than the question on it. Nothing that is left
 * behind still applies, so nothing is left behind, and what comes back is a whole screen arriving
 * rather than a question changing inside a frame that was never in doubt.
 */

/**
 * The fall, the beat of nothing, and the rise — the rise being the app's ordinary arrival rather
 * than anything this flow invented, so the welcome that plays after the last step can continue the
 * same movement (`lib/motion`).
 */
const OUT_MS = 250;
const GAP_MS = 250;
const IN_MS = ARRIVE_MS;

/** How long past the earliest arrival the empty point may last before the wait is admitted to. */
const PATIENCE_MS = 150;
const NOTE_IN_MS = 150;
const NOTE_OUT_MS = 100;

/** Away on an accelerating curve, back on a decelerating one, so the pair reads as one movement. */
const OUT = { duration: OUT_MS, easing: Easing.in(Easing.cubic) };
const IN = ARRIVE;
const NOTE_IN = { duration: NOTE_IN_MS, easing: Easing.out(Easing.quad) };
const NOTE_OUT = { duration: NOTE_OUT_MS, easing: Easing.in(Easing.quad) };

/**
 * How a step's work answers: with somewhere to go, or with a reason it is not going anywhere.
 *
 * A null error is a refusal rather than a failure — a provider sheet someone dismissed — and comes
 * back to the same step with nothing to say about it.
 *
 * A move that goes to `done` may also carry something out of the flow with it, which is handed to
 * `onLeave` when the flow ends. What that something is belongs to the caller and is opaque here:
 * this hook moves questions on and off a screen and has no opinion about what any of them meant.
 * It travels with the outcome rather than beside it, because the moment the flow ends is a good
 * deal later than the moment its last request answered, and anything held in between would have to
 * be held somewhere the movement cannot see.
 */
export type Outcome<Leaving = never> =
  | { to: OnboardingStep; leaving?: Leaving }
  | { error: string | null };

export type Task<Leaving = never> = () => Promise<Outcome<Leaving>>;

interface Move<Leaving> {
  /** Where this goes, for a move with nothing to wait for. Ignored when a `task` names its own. */
  to?: OnboardingStep;
  /** The step's work, started as the fall begins. */
  task?: Task<Leaving>;
  /**
   * Something other than the step to change as the swap happens.
   *
   * Run in the same commit that puts the next question up, which is the one moment nothing is on
   * screen to see it change. A move that only rewords the step it lands back on — the way across
   * between signing up and signing in — is the reason this exists: setting the wording at the press
   * instead would change it under the step that is still falling.
   */
  arrive?: () => void;
  /**
   * Whether an overrun may raise the apology. False for work that is visibly someone else's — a
   * provider sheet is on top of this screen, and a screen apologising underneath it is noise.
   */
  patience?: boolean;
  /**
   * Whether the frame goes with the step. False for an ordinary answer, where the chevron and the
   * button are the parts of the screen that were never in question; true for a hand-off to
   * somewhere else entirely, where leaving them behind would be leaving a screen half here.
   */
  frame?: boolean;
}

export function useStepTransition<Leaving = never>({
  resting,
  onLeave,
  arriving = false,
  failed = null,
}: {
  /** Where the flow sits before it has moved itself anywhere — read off the account. */
  resting: OnboardingStep;
  /**
   * The flow is over: the last answer landed, or the sign-in did not take. Carrying whatever the
   * move that ended it named, and nothing where it named nothing — which is every way out that is
   * not an arrival.
   */
  onLeave: (leaving: Leaving | undefined) => void;
  /**
   * Whether this screen was entered under a cover rather than opened.
   *
   * Everything starts hidden and plays the arriving half of a move on the first frame, which is
   * what continues the movement the screen it was handed over from had already begun. The same
   * half, not a copy of it: what comes up is a whole screen, frame included, exactly as it would
   * after a provider answered on the step itself.
   */
  arriving?: boolean;
  /** What the hand-off failed with, said on the step it opens on. */
  failed?: string | null;
}) {
  /**
   * The step this has moved to, or null while it has moved nowhere.
   *
   * Null defers to `resting`, which is what lands a half-finished account on the first thing it
   * still owes. From the first move onwards this is the only thing consulted: every profile write
   * refreshes the session, and a step re-derived from that would jump ahead of the screen.
   */
  const [arrived, setArrived] = useState<OnboardingStep | null>(null);
  /**
   * Which half of a move the content is in the middle of, or null before the first one.
   *
   * State, and a fresh object each time, because this is what the animation is driven from: the
   * rise belongs to the step that is rising, and starting it in the same breath as the setState
   * that swaps the steps over would run it on the UI thread for the frame or two before React had
   * committed — a flash of the question that was just answered, fading back in. Going through
   * state puts both halves after a commit, which is where they belong. It also keeps every write
   * to `fade` and `lift` in one place, which the compiler insists on anyway.
   */
  const [half, setHalf] = useState<{ of: 'out' | 'in'; frame?: boolean } | null>(
    // A screen entered under a cover is already halfway through a move somebody else started: its
    // step has been decided and nothing of it is on the glass yet, which is precisely the state the
    // arriving half begins from.
    arriving ? { of: 'in' } : null,
  );
  const [error, setError] = useState<string | null>(failed);
  const [moving, setMoving] = useState(arriving);
  /** Whether the apology is mounted. Its opacity is animated separately. */
  const [note, setNote] = useState(false);

  const fade = useSharedValue(arriving ? 0 : 1);
  const lift = useSharedValue(arriving ? -TRAVEL : 0);
  /** The chevron, the link across and the anchored button, which only some moves take with them. */
  const frame = useSharedValue(arriving ? 0 : 1);
  const noteFade = useSharedValue(0);

  const shown = arrived ?? resting;

  /** Everything a move has scheduled, so a screen that goes away takes its timers with it. */
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /**
   * The guard, in a ref rather than in `moving`: two presses can land in one tick, and state read
   * back in the same tick is still the state before the first of them.
   */
  const busy = useRef(arriving);

  useEffect(() => {
    const scheduled = timers.current;
    return () => scheduled.forEach(clearTimeout);
  }, []);

  /**
   * The movement itself, both halves of it, run after the commit that asked for them.
   *
   * Ahead of everything else that touches these two values because the compiler will not let a
   * shared value be written once the render has handed it to a hook, and this is the hook that
   * writes them.
   */
  useEffect(() => {
    if (!half) return;

    if (half.of === 'out') {
      fade.value = withTiming(0, OUT);
      lift.value = withTiming(TRAVEL, OUT);
      // Fading where it stands rather than falling with the step: the frame never travels, which is
      // what an anchored button is for, and it is no less anchored on the way out.
      if (half.frame) frame.value = withTiming(0, OUT);
      return;
    }

    // Placed above by the same commit that swapped the step over, and invisible while it is put
    // there — so the rise is never seen beginning from where the fall ended.
    lift.value = -TRAVEL;
    lift.value = withTiming(0, IN);
    fade.value = withTiming(1, IN);
    // Unconditional, and a no-op for every move that left the frame alone: what arrives is a whole
    // screen, and it is not this half's business which parts of it went away.
    frame.value = withTiming(1, IN);

    const settle = setTimeout(() => {
      busy.current = false;
      setMoving(false);
    }, IN_MS);

    return () => clearTimeout(settle);
  }, [fade, frame, half, lift]);

  const begin = useCallback(
    (move: Move<Leaving>) => {
      if (busy.current) return;
      busy.current = true;
      setMoving(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      timers.current.forEach(clearTimeout);
      timers.current = [];
      const after = (ms: number, run: () => void) => {
        timers.current.push(setTimeout(run, ms));
      };

      /** Where a failure comes back to, held now because `shown` is about to stop being it. */
      const from = shown;

      setHalf({ of: 'out', frame: move.frame });

      let settled: Outcome<Leaving> | null = null;
      /** Whether the fall and the beat after it are over, which is the earliest anything arrives. */
      let ready = false;
      let landed = false;
      /** Whether the apology is on screen or on its way there, and so has to be taken back down. */
      let apologised = false;

      const land = () => {
        if (landed) return;
        landed = true;

        const outcome = settled ?? { error: null };
        const to = 'to' in outcome ? outcome.to : from;
        setError('error' in outcome ? outcome.error : null);

        if (to === 'done') {
          // The flow is leaving rather than arriving, so nothing is brought back in and the guard
          // is deliberately left closed — there is no screen left to press.
          onLeave('to' in outcome ? outcome.leaving : undefined);
          return;
        }

        move.arrive?.();
        setArrived(to);
        setHalf({ of: 'in' });
      };

      /** The answer is in. Whatever was said about the wait has to be unsaid first. */
      const finish = () => {
        if (!apologised) {
          land();
          return;
        }

        noteFade.value = withTiming(0, NOTE_OUT);
        after(NOTE_OUT_MS, () => {
          setNote(false);
          land();
        });
      };

      after(OUT_MS + GAP_MS, () => {
        ready = true;
        if (settled) finish();
      });

      if (move.patience !== false) {
        after(OUT_MS + GAP_MS + PATIENCE_MS, () => {
          if (settled) return;
          apologised = true;
          setNote(true);
          noteFade.value = withTiming(1, NOTE_IN);
        });
      }

      const work: Promise<Outcome<Leaving>> = move.task
        ? move.task()
        : Promise.resolve({ to: move.to ?? from });

      void work.then(
        (outcome) => {
          settled = outcome;
          if (ready) finish();
        },
        () => {
          // Nothing here throws by design — Better Auth answers with failures — so a rejection is
          // something unaccounted for, and it comes back to the step rather than stalling on the
          // empty screen for ever.
          settled = { error: 'Something went wrong. Please try again.' };
          if (ready) finish();
        },
      );
    },
    // `fade`, `lift` and `noteFade` are deliberately absent: a shared value listed as a dependency
    // is one the compiler then refuses to let this callback write to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onLeave, shown],
  );

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: lift.value }],
  }));

  const noteStyle = useAnimatedStyle(() => ({ opacity: noteFade.value }));

  /**
   * The frame's opacity, for the pieces of the screen that are not the step.
   *
   * Nothing turns their touches off with it. Every control in the frame already refuses a press
   * while a move is running — the chevron drops it, the two others go through `begin`, which is
   * shut for the length of one — so a button that is invisible is a button that was doing nothing
   * anyway, and there is no window in which one could be pressed unseen.
   */
  const frameStyle = useAnimatedStyle(() => ({ opacity: frame.value }));

  return { shown, error, setError, moving, note, contentStyle, frameStyle, noteStyle, begin };
}
