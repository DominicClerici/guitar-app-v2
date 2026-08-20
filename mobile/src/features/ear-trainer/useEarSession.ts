import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useRef, useState } from 'react';

import { claimPlayback, releasePlayback } from '@/features/articles/playbackBus';
import { haptics } from '@/lib/haptics';
import {
  createSession,
  droneMidiFor,
  EAR_SESSION_QUESTIONS,
  grade,
  nextQuestion,
  ORIENTATION_DECAY_S,
  ORIENTATION_TOTAL_S,
  orientationSequence,
  summary,
  toneMidiFor,
  type EarSession,
  type SessionState,
  type SessionSummary,
  type Verdict,
} from '@/lib/ear-training';

import { playTone, release, setDroneMidi, start, stop } from './trainerEngine';

// The graded loop, beside `useTrainer` rather than inside it.
//
// Both sit on the same audio graph and the same pure state machine in
// `lib/ear-training/session.ts`; what differs is everything a *grade* implies.
// The drone is auto-started here and user-toggled there; questions stop at ten
// here and never there; a correct answer holds for Continue here and advances
// itself there. Folding those into a `mode` flag would put the graded path at
// risk of every sandbox change, and the shared core left over would be mostly
// flags. The duplicated timer plumbing is the cheap half.

const KEEP_AWAKE_TAG = 'ear-session';

/** Silence between the screen arriving and the orientation run, so the drone is heard first. */
const SETTLE_MS = 600;

/** The orientation run, in whole milliseconds — the audio clock owns its inner spacing. */
const ORIENTATION_MS = Math.round(ORIENTATION_TOTAL_S * 1000);

/** Silence between a question being posed and its tone sounding. */
const ASK_DELAY_MS = 450;

/** How long an audition tap stays lit on the circle. */
const SOUNDING_MS = 700;

/**
 * Where the session is in its loop. `orientation` is the key being planted —
 * nothing is tappable. `question` has a tone out and unanswered. `reveal` holds
 * the verdict with the circle open for comparison, whichever way it went.
 * `summary` is over.
 */
export type EarPhase = 'orientation' | 'question' | 'reveal' | 'summary';

export interface UseEarSessionResult {
  phase: EarPhase;
  tonicPc: number;
  /** Questions graded so far, 0–10. The one on screen is the next one up. */
  asked: number;
  correct: number;
  /** Right or wrong per graded question, in order. */
  marks: boolean[];
  verdict: Verdict | null;
  /** Degree lit by an audition tap, as feedback that the tap sounded. */
  sounding: number | null;
  /** The finished tally, once there is one. Null until the tenth answer is confirmed. */
  result: SessionSummary | null;
  /** Answer during a question; audition during a reveal; ignored otherwise. */
  tapDegree: (degree: number) => void;
  /** Re-sound the question's own tone. Reveals nothing new, so it stays open all through. */
  replay: () => void;
  /** Leave the verdict — the next question, or the summary after the tenth. */
  continueNext: () => void;
  /** Sit the whole session again, in a new key. */
  restart: () => void;
}

/**
 * Uniform over all twelve, with no memory of the last session's key.
 *
 * Uniform rather than "anything but last time" — unlike `pickTonic` in
 * `session.ts`, where a roaming key change has to be *audible* and so excludes
 * the key already sounding. A session is a fresh start with nothing for a repeat
 * to spoil.
 */
function pickTonic(): number {
  return Math.floor(Math.random() * 12) % 12;
}

/**
 * One graded session: drone, orientation, ten questions, a summary.
 *
 * `onComplete` fires exactly once per run, as the tenth verdict is confirmed —
 * that is the moment the result is real, and leaving before it records nothing.
 */
export function useEarSession({
  session: curriculum,
  onComplete,
}: {
  session: EarSession;
  onComplete: (result: SessionSummary) => void;
}): UseEarSessionResult {
  // The key and the run are decided as the screen first renders rather than in
  // an effect, so the first frame is already the session the learner is about to
  // sit — there is no keyless moment to draw.
  const [tonicPc, setTonicPc] = useState(pickTonic);
  const [state, setState] = useState<SessionState>(() =>
    createSession({ degrees: curriculum.degrees, keyPolicy: { mode: 'fixed', tonicPc } }, tonicPc),
  );

  const [phase, setPhase] = useState<EarPhase>('orientation');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [marks, setMarks] = useState<boolean[]>([]);
  const [sounding, setSounding] = useState<number | null>(null);
  const [result, setResult] = useState<SessionSummary | null>(null);

  // Held in a ref so a caller passing an inline closure — which is all of them —
  // does not re-run the session's one setup effect on every render.
  const complete = useRef(onComplete);
  useEffect(() => {
    complete.current = onComplete;
  });

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const soundingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current = [];
  }, []);

  const after = useCallback((ms: number, run: () => void) => {
    timers.current.push(setTimeout(run, ms));
  }, []);

  /** Poses the next question and schedules its tone. */
  const ask = useCallback(
    (from: SessionState) => {
      clearTimers();

      const next = nextQuestion(from);
      const question = next.question;
      if (!question) return;

      setState(next);
      setPhase('question');
      setVerdict(null);

      const midi = toneMidiFor(next.tonicPc, question.degree, question.octave);
      after(ASK_DELAY_MS, () => playTone(midi));
    },
    [after, clearTimers],
  );

  /**
   * The audio half of starting a run: the drone, the orientation strikes, and
   * the first question waiting behind them. Kept apart from the state half so
   * that mounting the screen schedules sound without setting state a second time.
   */
  const sound = useCallback(
    (tonic: number, from: SessionState) => {
      clearTimers();

      const midi = droneMidiFor(tonic);
      // `start` is the first run's drone; `setDroneMidi` is a retake's change of
      // key. Each is a no-op in the other's case.
      start(midi);
      setDroneMidi(midi);

      after(SETTLE_MS, () => {
        for (const strike of orientationSequence(tonic)) {
          playTone(strike.midi, { delay: strike.delay, decay: ORIENTATION_DECAY_S });
        }

        after(ORIENTATION_MS, () => ask(from));
      });
    },
    [after, ask, clearTimers],
  );

  /** What another sound source calls to take the audio, and what teardown runs through. */
  const halt = useCallback(() => {
    clearTimers();
    stop();
  }, [clearTimers]);

  // One setup for the life of the screen. A session is defined by the degrees it
  // asks about, so a different session is a different screen, not a reconfigured
  // one — and the run this starts is the one the first render already built.
  useEffect(() => {
    claimPlayback(halt);
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    sound(tonicPc, state);

    return () => {
      clearTimers();
      if (soundingTimer.current) clearTimeout(soundingTimer.current);
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
      releasePlayback(halt);
      release();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Sounds a degree as itself — a look around the key, never an answer. */
  const audition = useCallback((degree: number, tonic: number, octave: number) => {
    playTone(toneMidiFor(tonic, degree, octave));
    setSounding(degree);
    if (soundingTimer.current) clearTimeout(soundingTimer.current);
    soundingTimer.current = setTimeout(() => setSounding(null), SOUNDING_MS);
  }, []);

  const tapDegree = useCallback(
    (degree: number) => {
      const question = state.question;
      if (!question) return;

      // A tap during an open question is an answer, never an audition. Free
      // listening with a question out would make the pass mark meaningless.
      if (phase === 'question') {
        if (!state.config.degrees.includes(degree)) return;

        const graded = grade(state, degree);
        setState(graded.state);
        setVerdict(graded.verdict);
        setMarks((previous) => [...previous, graded.verdict.correct]);
        setPhase('reveal');

        if (graded.verdict.correct) {
          haptics.success();
        } else {
          haptics.warning();
          // The mistake and the truth side by side, in the question's own
          // register — which is where the learning in a miss actually is.
          playTone(toneMidiFor(state.tonicPc, degree, question.octave));
        }
        return;
      }

      // The answer is in: the circle is an instrument again, in the octave the
      // question used, so a comparison compares like with like.
      if (phase === 'reveal') audition(degree, state.tonicPc, question.octave);
    },
    [audition, phase, state],
  );

  const replay = useCallback(() => {
    const question = state.question;
    if (!question) return;
    if (phase !== 'question' && phase !== 'reveal') return;

    playTone(toneMidiFor(state.tonicPc, question.degree, question.octave));
  }, [phase, state]);

  const continueNext = useCallback(() => {
    if (phase !== 'reveal') return;

    if (state.asked >= EAR_SESSION_QUESTIONS) {
      clearTimers();
      // The ground is only there to be heard against, and there is nothing left
      // to hear — a drone humming under a results screen is noise.
      stop();

      const tally = summary(state);
      setResult(tally);
      setPhase('summary');
      complete.current(tally);
      return;
    }

    ask(state);
  }, [ask, clearTimers, phase, state]);

  /** The whole run again, in a key of its own. */
  const restart = useCallback(() => {
    const tonic = pickTonic();
    const fresh = createSession(
      { degrees: curriculum.degrees, keyPolicy: { mode: 'fixed', tonicPc: tonic } },
      tonic,
    );

    setTonicPc(tonic);
    setState(fresh);
    setPhase('orientation');
    setVerdict(null);
    setMarks([]);
    setResult(null);

    sound(tonic, fresh);
  }, [curriculum.degrees, sound]);

  return {
    phase,
    tonicPc,
    asked: state.asked,
    correct: state.correct,
    marks,
    verdict,
    sounding,
    result,
    tapDegree,
    replay,
    continueNext,
    restart,
  };
}
