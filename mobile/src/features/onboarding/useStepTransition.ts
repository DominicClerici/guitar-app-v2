import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
 */

/** The fall, the beat of nothing, and the rise. */
const OUT_MS = 250;
const GAP_MS = 250;
const IN_MS = 400;

/** How far a step travels. Short: this is a change of question, not a change of place. */
const TRAVEL = 12;

/** How long past the earliest arrival the empty point may last before the wait is admitted to. */
const PATIENCE_MS = 150;
const NOTE_IN_MS = 150;
const NOTE_OUT_MS = 100;

/** Away on an accelerating curve, back on a decelerating one, so the pair reads as one movement. */
const OUT = { duration: OUT_MS, easing: Easing.in(Easing.cubic) };
const IN = { duration: IN_MS, easing: Easing.out(Easing.cubic) };
const NOTE_IN = { duration: NOTE_IN_MS, easing: Easing.out(Easing.quad) };
const NOTE_OUT = { duration: NOTE_OUT_MS, easing: Easing.in(Easing.quad) };

/**
 * How a step's work answers: with somewhere to go, or with a reason it is not going anywhere.
 *
 * A null error is a refusal rather than a failure — a provider sheet someone dismissed — and comes
 * back to the same step with nothing to say about it.
 */
export type Outcome = { to: OnboardingStep } | { error: string | null };

export type Task = () => Promise<Outcome>;

interface Move {
  /** Where this goes, for a move with nothing to wait for. Ignored when a `task` names its own. */
  to?: OnboardingStep;
  /** The step's work, started as the fall begins. */
  task?: Task;
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
}

export function useStepTransition({
  resting,
  onLeave,
}: {
  /** Where the flow sits before it has moved itself anywhere — read off the account. */
  resting: OnboardingStep;
  /** The flow is over: the last answer landed, or the sign-in did not take. */
  onLeave: () => void;
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
  const [half, setHalf] = useState<{ of: 'out' | 'in' } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  /** Whether the apology is mounted. Its opacity is animated separately. */
  const [note, setNote] = useState(false);

  const fade = useSharedValue(1);
  const lift = useSharedValue(0);
  const noteFade = useSharedValue(0);

  const shown = arrived ?? resting;

  /** Everything a move has scheduled, so a screen that goes away takes its timers with it. */
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /**
   * The guard, in a ref rather than in `moving`: two presses can land in one tick, and state read
   * back in the same tick is still the state before the first of them.
   */
  const busy = useRef(false);

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
      return;
    }

    // Placed above by the same commit that swapped the step over, and invisible while it is put
    // there — so the rise is never seen beginning from where the fall ended.
    lift.value = -TRAVEL;
    lift.value = withTiming(0, IN);
    fade.value = withTiming(1, IN);

    const settle = setTimeout(() => {
      busy.current = false;
      setMoving(false);
    }, IN_MS);

    return () => clearTimeout(settle);
  }, [fade, half, lift]);

  const begin = useCallback(
    (move: Move) => {
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

      setHalf({ of: 'out' });

      let settled: Outcome | null = null;
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
          onLeave();
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

      const work: Promise<Outcome> = move.task
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

  return { shown, error, setError, moving, note, contentStyle, noteStyle, begin };
}
